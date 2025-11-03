// routes/dashboard.ts
import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const launchesFilePath = path.join(process.cwd(), "data", "launches.json");
const satellitesFilePath = path.join(process.cwd(), "data", "satellites.json");

// Helpers
function readArr(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf8");
      return [];
    }
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

function writeArr(filePath: string, arr: any[]) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// GET overview data (used by Dashboard.tsx)
router.get("/data", (_req, res) => {
  try {
    const satellites = readArr(satellitesFilePath);
    const launches = readArr(launchesFilePath);

    const now = Date.now();
    const upcomingCount = launches.filter((l: any) => {
      if (!l.date) return false;
      const dt = new Date(`${l.date}T${l.time || "00:00"}`).getTime();
      return !isNaN(dt) && dt >= now;
    }).length;

    // Example stats (you can extend these)
    res.json({
      activeSatellites: satellites.length,
      collisionWarnings: 23,
      upcomingLaunches: upcomingCount,
      highRiskObjects: 157,
      activeChange: "+0",
      collisionChange: "3 high-risk",
      launchChange: upcomingCount > 0 ? `Next: ${upcomingCount} scheduled` : "No upcoming",
      highRiskChange: "+5 this week",
      recentActivity: [
        // derive some recent activity if you like - kept simple here
        ...launches.slice(-3).reverse().map((l: any) => ({ message: `Scheduled: ${l.name}`, timeAgo: "recent", variant: "secondary" })),
      ],
    });
  } catch (err) {
    console.error("GET /api/dashboard/data error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

// GET filtered upcoming launches for LaunchSchedule.tsx
router.get("/upcoming-launches", (_req, res) => {
  try {
    const launches = readArr(launchesFilePath);
    const now = Date.now();
    const upcoming = launches
      .filter((l: any) => {
        if (!l.date) return false;
        const dt = new Date(`${l.date}T${l.time || "00:00"}`).getTime();
        return !isNaN(dt) && dt >= now;
      })
      .sort((a: any, b: any) => {
        const aT = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
        const bT = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
        return aT - bT;
      });

    res.json(upcoming);
  } catch (err) {
    console.error("GET /api/dashboard/upcoming-launches error:", err);
    res.status(500).json({ error: "Failed to load upcoming launches" });
  }
});

// POST mark a scheduled launch as live manually (moves a single launch into satellites.json)
router.post("/launch-live", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id is required" });

    const launches = readArr(launchesFilePath);
    const idx = launches.findIndex((l: any) => l.id === id || String(l.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: "Launch not found" });

    const [launch] = launches.splice(idx, 1);
    const satellites = readArr(satellitesFilePath);
    satellites.push({
      id: Date.now(),
      name: launch.name,
      orbitType: launch.orbitType || "LEO",
      country: launch.country || "",
      sourceLaunchId: launch.id,
      status: "active",
      liveSince: new Date().toISOString(),
    });

    writeArr(launchesFilePath, launches);
    writeArr(satellitesFilePath, satellites);

    res.json({ message: "Moved launch to satellites." });
  } catch (err) {
    console.error("POST /api/dashboard/launch-live error:", err);
    res.status(500).json({ error: "Failed to move launch to satellites" });
  }
});

export default router;
