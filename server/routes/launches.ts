// server/routes/launches.ts
import { Router } from "express";
import { LaunchModel } from "../models/Launch";
import { SatelliteModel } from "../models/Satellite";

const router = Router();

/** Utils */
const twoHoursMs = 2 * 60 * 60 * 1000;

function toDateFromLegacy(date?: string, time?: string | null): Date | null {
  if (!date) return null;
  const hhmm = time && /^\d{2}:\d{2}$/.test(time) ? time : "00:00";
  const d = new Date(`${date}T${hhmm}:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
}
function addHours(d: Date, hrs = 2) {
  return new Date(d.getTime() + hrs * 3600 * 1000);
}
function normalizeLaunchStatus(s?: string) {
  const v = String(s || "").toLowerCase();
  if (["scheduled", "schedule"].includes(v)) return "scheduled";
  if (["hold", "on-hold"].includes(v)) return "hold";
  if (["scrub", "scrubbed"].includes(v)) return "scrubbed";
  if (["launched", "live", "success"].includes(v)) return "launched";
  if (["abort", "aborted", "failed"].includes(v)) return "aborted";
  return "scheduled";
}

/** DB → legacy shape (what your UI expects) */
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
    orbitType: "", // optional, not in schema
    country: l.agency ?? "",
    description: l.notes ?? "",
    status: l.status === "scheduled" ? "Scheduled" : String(l.status),
    createdAt: l.createdAt ?? new Date(),
    _id: l._id,
  };
}

/**
 * POST /api/launches
 * Accepts legacy (name/date/time/...) OR new (mission/vehicle/agency/site/windowOpen/windowClose) payloads.
 * Auto-fills sane defaults to satisfy schema required fields.
 */
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const isLegacy = !!(body.name || body.date || body.time);

    // Extract with fallbacks
    const mission = isLegacy
      ? (body.name ?? "").trim()
      : (body.mission ?? "").trim();

    const vehicle = isLegacy
      ? (body.rocketType ?? "").trim()
      : (body.vehicle ?? "").trim();

    const agency = isLegacy
      ? ((body.country ?? body.operator ?? "") as string).trim()
      : (body.agency ?? "").trim();

    const site = isLegacy
      ? (body.launchPad ?? "").trim()
      : (body.site ?? "").trim();

    const windowOpen: Date | null = isLegacy
      ? toDateFromLegacy(body.date, body.time) || null
      : body.windowOpen
      ? new Date(body.windowOpen)
      : null;

    const windowClose: Date | null = isLegacy
      ? (windowOpen ? addHours(windowOpen, 2) : null)
      : body.windowClose
      ? new Date(body.windowClose)
      : null;

    const notes =
      (isLegacy ? body.description : body.notes) != null
        ? String(isLegacy ? body.description : body.notes)
        : undefined;

    const status = normalizeLaunchStatus(body.status); // handles "Scheduled" → "scheduled"

    // Provide last-resort defaults so Mongoose required fields pass
    const openFinal = windowOpen ?? new Date(Date.now() + 5 * 60 * 1000); // 5 min in future
    const closeFinal = windowClose ?? new Date(openFinal.getTime() + twoHoursMs);

    const missionFinal = mission || "Unnamed Mission";
    const vehicleFinal = vehicle || "Unknown Vehicle";
    const agencyFinal = agency || "Unknown Agency";
    const siteFinal = site || "Unknown Site";

    const legacyId =
      typeof body.id === "number" ? body.id : Date.now(); // keep numeric id for legacy flows

    const doc = await LaunchModel.create({
      id: legacyId,
      mission: missionFinal,
      vehicle: vehicleFinal,
      agency: agencyFinal,
      site: siteFinal,
      windowOpen: openFinal,
      windowClose: closeFinal,
      status, // normalized
      notes,
    });

    res.status(201).json(launchToLegacy(doc));
  } catch (err: any) {
    console.error("POST /api/launches error:", err);
    res.status(500).json({ error: err?.message || "Failed to add launch" });
  }
});

/** GET /api/launches → legacy array */
router.get("/", async (_req, res) => {
  try {
    const launches = await LaunchModel.find({}).sort({ windowOpen: 1 }).lean();
    res.json(launches.map(launchToLegacy));
  } catch (err) {
    console.error("GET /api/launches error:", err);
    res.status(500).json({ error: "Failed to fetch launches" });
  }
});

/** POST /api/launches/process → promote past-due to satellites */
router.post("/process", async (_req, res) => {
  try {
    const now = new Date();
    const toMove = await LaunchModel.find({ windowOpen: { $lte: now } });

    if (toMove.length === 0) return res.json({ moved: 0 });

    await Promise.all(
      toMove.map(async (l) => {
        await SatelliteModel.create({
          name: l.mission,
          country: l.agency || "",
          launchedFrom: l.site || "",
          rocketType: l.vehicle || "",
          sourceLaunchId: l._id,
          status: "active",
          liveSince: new Date(),
          noradId: Math.floor(100000 + Math.random() * 900000),
          position: { lat: 0, lon: 0, altKm: 400, lastUpdate: new Date() },
        });
        await LaunchModel.deleteOne({ _id: l._id });
      })
    );

    res.json({ moved: toMove.length });
  } catch (err) {
    console.error("POST /api/launches/process error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

export default router;
