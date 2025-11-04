/* scripts/migrate-json-to-mongo.ts
 * One-time migration from /data/*.json -> MongoDB
 * - Maps legacy Launch JSON (name/date/time/etc.) to new Launch schema (mission/vehicle/agency/site/windowOpen/Close)
 * - Maps legacy Satellite JSON to new Satellite schema (with position)
 * Usage:
 *   npx tsx scripts/migrate-json-to-mongo.ts [--dry] [--wipe]
 * Env:
 *   MONGODB_URI=mongodb://localhost:27017/lumos  (in .env)
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectMongo, disconnectMongo } from "../server/db/mongo";
import { LaunchModel } from "../server/models/Launch";
import { SatelliteModel } from "../server/models/Satellite";

// Simple CLI flags
const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry");
const WIPE = args.has("--wipe");

dotenv.config();

type LegacyLaunch = {
  id?: number;
  name?: string;
  date?: string;       // "YYYY-MM-DD"
  time?: string | null; // "HH:MM"
  launchPad?: string;
  rocketType?: string;
  orbitType?: string;
  country?: string;
  operator?: string;
  description?: string;
  status?: string; // "Scheduled" etc.
  createdAt?: string;
};

type LegacySatellite = {
  id?: number;
  name?: string;
  orbitType?: string;
  country?: string;
  operator?: string;
  sourceLaunchId?: number | string | null;
  status?: string; // "active"/"decayed"/"unknown"
  liveSince?: string;
  launchedFrom?: string;
  rocketType?: string;
  lat?: number;
  lon?: number;
  altKm?: number;
};

// --- Helpers ---
const dataDir = path.join(process.cwd(), "data");
const launchesPath = path.join(dataDir, "launches.json");
const satellitesPath = path.join(dataDir, "satellites.json");

function readJsonArray<T = any>(p: string): T[] {
  if (!fs.existsSync(p)) return [];
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseDateTime(dateStr?: string, timeStr?: string | null): Date | null {
  if (!dateStr) return null;
  // accept HH:MM, fallback midnight
  const hhmm = timeStr && /^\d{2}:\d{2}$/.test(timeStr) ? timeStr : "00:00";
  const d = new Date(`${dateStr}T${hhmm}:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
}

function addHours(d: Date, hrs: number) {
  return new Date(d.getTime() + hrs * 3600 * 1000);
}

function normStatusLaunch(s?: string): "scheduled" | "hold" | "scrubbed" | "launched" | "aborted" {
  const v = (s || "").toLowerCase();
  if (["scheduled", "schedule"].includes(v)) return "scheduled";
  if (["hold", "on-hold"].includes(v)) return "hold";
  if (["scrub", "scrubbed"].includes(v)) return "scrubbed";
  if (["launched", "live", "success", "successfully launched"].includes(v)) return "launched";
  if (["abort", "aborted", "failed"].includes(v)) return "aborted";
  return "scheduled";
}

function normStatusSat(s?: string): "active" | "decayed" | "unknown" {
  const v = (s || "").toLowerCase();
  if (["active", "operational"].includes(v)) return "active";
  if (["decayed", "retired"].includes(v)) return "decayed";
  return "unknown";
}

// --- Migration mappers ---
function mapLegacyLaunch(l: LegacyLaunch) {
  const mission = l.name?.trim() || "Unnamed Mission";
  const vehicle = (l.rocketType || "").trim() || "Unknown Vehicle";
  const agency = (l.country || l.operator || "").trim() || "Unknown Agency";
  const site = (l.launchPad || "").trim() || "Unknown Site";

  // windowOpen comes from date/time; windowClose = +2h default
  const open = parseDateTime(l.date, l.time) || new Date();
  const close = addHours(open, 2);

  return {
    // Optional legacy numeric id retained for reference
    id: typeof l.id === "number" ? l.id : undefined,

    mission,
    vehicle,
    agency,
    site,

    windowOpen: open,
    windowClose: close,

    status: normStatusLaunch(l.status),
    notes: l.description ? String(l.description) : undefined,
  };
}

function mapLegacySatellite(s: LegacySatellite) {
  const name = s.name?.trim() || "Unnamed Satellite";
  const orbitType = (s.orbitType || "LEO").trim();
  const country = (s.country || s.operator || "").trim() || "Unknown";
  const launchedFrom = (s.launchedFrom || "").trim();
  const rocketType = (s.rocketType || "").trim();

  const liveSince = s.liveSince ? new Date(s.liveSince) : new Date();
  const lat = typeof s.lat === "number" ? s.lat : 0;
  const lon = typeof s.lon === "number" ? s.lon : 0;
  const altKm = typeof s.altKm === "number" ? s.altKm : 400;

  return {
    name,
    // keep room for NORAD later; not present in legacy
    noradId: undefined as number | undefined,

    operator: undefined as string | undefined, // you store `country` primarily
    country,

    // We cannot reliably map numeric legacy sourceLaunchId -> Mongo _id
    sourceLaunchId: undefined,

    status: normStatusSat(s.status),
    launchedFrom,
    rocketType,
    liveSince,

    position: {
      lat,
      lon,
      altKm,
      lastUpdate: new Date(),
    },
  };
}

// --- Main ---
async function run() {
  console.log("== LUMOS JSON → Mongo migration ==");
  console.log("Flags:", { DRY_RUN, WIPE });
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not set. Put it in your .env.");
  }

  const legacyLaunches = readJsonArray<LegacyLaunch>(launchesPath);
  const legacySatellites = readJsonArray<LegacySatellite>(satellitesPath);

  console.log(`Found ${legacyLaunches.length} launches in ${path.relative(process.cwd(), launchesPath)}`);
  console.log(`Found ${legacySatellites.length} satellites in ${path.relative(process.cwd(), satellitesPath)}`);

  const launchesToInsert = legacyLaunches.map(mapLegacyLaunch);
  const satellitesToInsert = legacySatellites.map(mapLegacySatellite);

  // Connect DB
  await connectMongo();

  if (WIPE) {
    console.log("WIPE requested → clearing collections…");
    if (!DRY_RUN) {
      await Promise.all([LaunchModel.deleteMany({}), SatelliteModel.deleteMany({})]);
    }
  }

  // Optional de-dup by (mission + windowOpen) to avoid inserting exact duplicates
  // (Simple client-side filter; for big sets, prefer server-side unique index)
  const uniqueLaunchKey = (x: any) => `${x.mission}__${new Date(x.windowOpen).toISOString()}`;
  const seen = new Set<string>();
  const dedupLaunches = launchesToInsert.filter((x) => {
    const k = uniqueLaunchKey(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  console.log(`Preparing to insert ${dedupLaunches.length} launches and ${satellitesToInsert.length} satellites.`);

  if (DRY_RUN) {
    console.log("[DRY] Skipping DB writes. Sample transformed launch:", dedupLaunches[0]);
    console.log("[DRY] Sample transformed satellite:", satellitesToInsert[0]);
  } else {
    if (dedupLaunches.length > 0) {
      await LaunchModel.insertMany(dedupLaunches, { ordered: false });
      console.log(`Inserted ${dedupLaunches.length} launch(es).`);
    } else {
      console.log("No launches to insert.");
    }

    if (satellitesToInsert.length > 0) {
      await SatelliteModel.insertMany(satellitesToInsert, { ordered: false });
      console.log(`Inserted ${satellitesToInsert.length} satellite(s).`);
    } else {
      console.log("No satellites to insert.");
    }
  }

  await disconnectMongo();
  console.log("Migration complete.");
}

run().catch(async (err) => {
  console.error("Migration failed:", err);
  try {
    await disconnectMongo();
  } catch {}
  process.exit(1);
});
