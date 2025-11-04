// server/routes/dashboard.ts
import { Router } from "express";
import { LaunchModel } from "../models/Launch";
import { SatelliteModel } from "../models/Satellite";
// If you track collisions/alerts, keep this import. If not, comment it out.
import { AlertModel } from "../models/Alert";

const router = Router();

/** Helpers **/
function isUpcomingByWindowOpen(launch: any, now = Date.now()) {
  const t = new Date(launch.windowOpen).getTime();
  return Number.isFinite(t) && t >= now;
}
function compareByWindowOpen(a: any, b: any) {
  return new Date(a.windowOpen).getTime() - new Date(b.windowOpen).getTime();
}
function toUtcStr(d: Date | string) {
  const t = new Date(d);
  if (!Number.isFinite(+t)) return "";
  return t.toUTCString();
}

/** DB → legacy shape (what your current UI expects) */
function launchToLegacy(l: any) {
  const open = new Date(l.windowOpen);
  const yyyy = open.getUTCFullYear();
  const mm = String(open.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(open.getUTCDate()).padStart(2, "0");
  const HH = String(open.getUTCHours()).padStart(2, "0");
  const MM = String(open.getUTCMinutes()).padStart(2, "0");

  return {
    id: l.id ?? Number(new Date(l.createdAt ?? l.windowOpen).getTime()),
    name: l.mission,
    date: `${yyyy}-${mm}-${dd}`,
    time: `${HH}:${MM}`,
    launchPad: l.site ?? "",
    rocketType: l.vehicle ?? "",
    orbitType: l.orbitType ?? "", // optional, may not exist
    country: l.agency ?? l.country ?? "",
    description: l.notes ?? "",
    status: l.status === "scheduled" ? "Scheduled" : String(l.status ?? ""),
    createdAt: l.createdAt ?? new Date(),
    _id: l._id,
  };
}

/**
 * GET /api/dashboard/data
 * Filter-aware top-line metrics + recent activity
 * Query: ?country=India&orbitType=LEO&risk=high
 */
router.get("/data", async (req, res) => {
  try {
    const { country, orbitType, risk } = req.query as {
      country?: string;
      orbitType?: string;
      risk?: "low" | "medium" | "high";
    };

    // ---- 1) Satellites (this scopes the entire dashboard) ----
    const satQuery: any = {};
    if (country) satQuery.country = country;
    if (orbitType) satQuery.orbitType = orbitType;
    if (risk) satQuery.riskLevel = risk;

    // We’ll compute everything from the filtered satellites
    const satellites = await SatelliteModel.find(satQuery).lean();

    const activeSatellites = satellites.filter((s: any) => s.status === "active").length;
    const highRiskObjects = satellites.filter((s: any) => s.riskLevel === "high").length;

    // basic weekly delta (uses updatedAt if available)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const highRiskDeltaWeek = satellites.filter(
      (s: any) => s.riskLevel === "high" && s.updatedAt && new Date(s.updatedAt).getTime() >= weekAgo
    ).length;

    // ---- 2) Collisions (optional, if you track alerts) ----
    // If you don't have AlertModel, set both to 0 and keep going.
    let collisionWarnings = 0;
    let highRiskCollisionCount = 0;
    try {
      if (AlertModel) {
        // Find collision alerts that involve at least one filtered satellite
        const satIds = new Set(satellites.map((s: any) => String(s._id ?? s.id)));
        const alerts = await AlertModel.find({ type: "collision" }).lean();

        const involvingFiltered = alerts.filter((a: any) => {
          const ids: string[] = (a.satellites ?? a.objects ?? []).map((x: any) => String(x));
          return ids.some((id) => satIds.has(id));
        });

        collisionWarnings = involvingFiltered.length;
        highRiskCollisionCount = involvingFiltered.filter((a: any) => a.riskLevel === "high").length;
      }
    } catch {
      // swallow if model/collection isn't present
      collisionWarnings = 0;
      highRiskCollisionCount = 0;
    }

    // ---- 3) Launches (scope by country/orbit when provided) ----
    let launches = await LaunchModel.find({}).lean();
    const now = Date.now();

    let upcoming = launches.filter((l) => isUpcomingByWindowOpen(l, now));
    if (country) {
      // match agency/country/provider fields you store
      upcoming = upcoming.filter((l: any) => (l.agency ?? l.country ?? "").toString() === country);
    }
    if (orbitType) {
      // only if you store orbitType on the launch
      upcoming = upcoming.filter((l: any) => (l.orbitType ?? "").toString().toUpperCase() === orbitType.toUpperCase());
    }
    upcoming.sort(compareByWindowOpen);

    const upcomingCount = upcoming.length;
    const next = upcoming[0];
    const launchChange = next
      ? `Next: ${next.agency ?? next.country ?? "Launch"} · ${next.vehicle ?? ""} · ${toUtcStr(next.windowOpen)}`
      : "Next: none";

    // ---- 4) Recent activity (keep it simple for now) ----
    const recentActivity = [...launches]
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .slice(0, 3)
      .map((l) => ({
        message: `Scheduled: ${l.mission}`,
        timeAgo: "recent",
        variant: "secondary",
      }));

    // ---- 5) Response (all 4 cards = filter-aware) ----
    res.json({
      activeSatellites,
      activeChange: "+0", // wire to your real daily delta if you track it
      collisionWarnings,
      collisionChange: `${highRiskCollisionCount} high-risk`,
      upcomingLaunches: upcomingCount,
      launchChange,
      highRiskObjects,
      highRiskChange: `${highRiskDeltaWeek >= 0 ? "+" : ""}${highRiskDeltaWeek} this week`,
      recentActivity,
    });
  } catch (err) {
    console.error("GET /api/dashboard/data error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

/**
 * GET /api/dashboard/upcoming-launches
 * Return upcoming launches in the **legacy** shape so the Launches page renders.
 */
router.get("/upcoming-launches", async (_req, res) => {
  try {
    const launches = await LaunchModel.find({}).lean();
    const now = Date.now();

    const upcoming = launches
      .filter((l) => isUpcomingByWindowOpen(l, now))
      .sort(compareByWindowOpen)
      .map(launchToLegacy);

    res.json(upcoming);
  } catch (err) {
    console.error("GET /api/dashboard/upcoming-launches error:", err);
    res.status(500).json({ error: "Failed to load upcoming launches" });
  }
});

/**
 * POST /api/dashboard/launch-live
 * Promote a scheduled launch to a satellite.
 * Body: { id } (accepts Mongo _id or legacy numeric id)
 */
router.post("/launch-live", async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id is required" });

    // Try by ObjectId first, then fallback to legacy numeric id
    let launch = await LaunchModel.findById(id);
    if (!launch && /^\d+$/.test(String(id))) {
      launch = await LaunchModel.findOne({ id: Number(id) } as any);
    }
    if (!launch) return res.status(404).json({ error: "Launch not found" });

    await SatelliteModel.create({
      name: launch.mission,
      country: launch.agency || launch.country || "",
      launchedFrom: launch.site || "",
      rocketType: launch.vehicle || "",
      sourceLaunchId: launch._id,
      status: "active",
      liveSince: new Date(),
      noradId: Math.floor(100000 + Math.random() * 900000),
      position: { lat: 0, lon: 0, altKm: 400, lastUpdate: new Date() },
    });

    await LaunchModel.deleteOne({ _id: launch._id });

    res.json({ message: "Moved launch to satellites." });
  } catch (err) {
    console.error("POST /api/dashboard/launch-live error:", err);
    res.status(500).json({ error: "Failed to move launch to satellites" });
  }
});

export default router;
