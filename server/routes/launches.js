// routes/launches.js
import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const launchesFilePath = path.join(process.cwd(), "data", "launches.json");
const satellitesFilePath = path.join(process.cwd(), "data", "satellites.json");

// --- Helpers ---
function ensureFile(filePath, initial = "[]") {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, initial, "utf8");
  }
}

function readArr(filePath) {
  try {
    ensureFile(filePath);
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

function writeArr(filePath, arr) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// --- Processing: move past launches into satellites.json ---
function processPastLaunches() {
  try {
    const launches = readArr(launchesFilePath);
    if (!Array.isArray(launches) || launches.length === 0) return;

    const now = Date.now();
    const remaining = [];
    const toMove = [];

    for (const l of launches) {
      // safe guard: require date
      if (!l.date) {
        remaining.push(l);
        continue;
      }
      const dateTime = new Date(`${l.date}T${l.time || "00:00"}`).getTime();
      if (!isNaN(dateTime) && dateTime <= now) {
        toMove.push(l);
      } else {
        remaining.push(l);
      }
    }

    if (toMove.length === 0) return;

    // read satellites, append moved launches as satellites
    const satellites = readArr(satellitesFilePath);
    for (const l of toMove) {
      const satelliteObj = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        name: l.name,
        orbitType: l.orbitType || l.orbit || "LEO",
        country: l.country || l.operator || "",
        sourceLaunchId: l.id || null,
        status: "active",
        liveSince: new Date().toISOString(),
        // If you want to keep original launch metadata:
        launchedFrom: l.launchPad || "",
        rocketType: l.rocketType || "",
      };
      satellites.push(satelliteObj);
    }

    writeArr(satellitesFilePath, satellites);
    writeArr(launchesFilePath, remaining);

    console.log(`processPastLaunches: moved ${toMove.length} launch(es) -> satellites.json`);
  } catch (err) {
    console.error("Error in processPastLaunches:", err);
  }
}

// run once at startup and then every 15 seconds
processPastLaunches();
setInterval(processPastLaunches, 15 * 1000);

// --- Routes ---

// GET all launches (returns array)
router.get("/", (_req, res) => {
  const launches = readArr(launchesFilePath);
  res.json(launches);
});

// POST create new launch (saves to launches.json)
router.post("/", (req, res) => {
  try {
    const { name, date, time, launchPad, rocketType, orbitType, country, description } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: "name and date are required" });
    }

    const launches = readArr(launchesFilePath);

    const newLaunch = {
      id: Date.now(),
      name,
      date,               // expected YYYY-MM-DD
      time: time || null, // HH:MM or null
      launchPad: launchPad || "",
      rocketType: rocketType || "",
      orbitType: orbitType || "",
      country: country || "",
      description: description || "",
      status: "Scheduled",
      createdAt: new Date().toISOString(),
    };

    launches.push(newLaunch);
    writeArr(launchesFilePath, launches);

    res.status(201).json(newLaunch);
  } catch (err) {
    console.error("POST /api/launches error:", err);
    res.status(500).json({ error: "Failed to add launch" });
  }
});

// POST manual processing trigger (useful for tests)
router.post("/process", (_req, res) => {
  try {
    processPastLaunches();
    res.json({ message: "Processing triggered" });
  } catch (err) {
    res.status(500).json({ error: "Processing failed" });
  }
});

export default router;
