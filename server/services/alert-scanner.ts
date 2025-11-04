import { SatelliteModel } from "../models/Satellite";
import { AlertModel } from "../models/Alert";

// Config
const SCAN_EVERY_MS = 30_000;       // run every 30s
const ALERT_KM = 5;                 // trigger distance
const RESOLVE_KM = 8;               // mark resolved when > this
const EARTH_RADIUS_KM = 6371;

function haversineKm(lat1:number, lon1:number, lat2:number, lon2:number) {
  const toRad = (d:number)=> d*Math.PI/180;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return EARTH_RADIUS_KM * c;
}

// crude 3D: surface arc -> chord, then combine with altitude difference
function distanceKm(lat1:number, lon1:number, alt1:number, lat2:number, lon2:number, alt2:number) {
  const surfaceKm = haversineKm(lat1, lon1, lat2, lon2);
  const dAlt = (alt2 - alt1); // km
  return Math.hypot(surfaceKm, dAlt);
}

function levelFromMiss(m:number) {
  if (m <= 1) return "critical";
  if (m <= 2) return "warning";
  if (m <= 5) return "watch";
  if (m <= 10) return "info";
  return null;
}

export function startAlertScanner() {
  const tick = async () => {
    try {
      const sats = await SatelliteModel.find({ status: "active" }, {
        _id: 1, name: 1, "position.lat": 1, "position.lon": 1, "position.altKm": 1,
      }).lean();

      // simple prefilter: drop sats with missing positions
      const clean = sats.filter(s => s.position && typeof s.position.lat === "number" && typeof s.position.lon === "number");

      // naive O(N^2); fine for small N. (Can optimize later.)
      for (let i=0; i<clean.length; i++) {
        for (let j=i+1; j<clean.length; j++) {
          const a = clean[i], b = clean[j];
          const miss = distanceKm(a.position!.lat, a.position!.lon, a.position!.altKm ?? 400,
                                  b.position!.lat, b.position!.lon, b.position!.altKm ?? 400);

          // create/update alert when close
          if (miss <= ALERT_KM) {
            const level = levelFromMiss(miss) ?? "info";
            const [idA, idB] = String(a._id) < String(b._id) ? [String(a._id), String(b._id)] : [String(b._id), String(a._id)];
            const pairKey = `${idA}__${idB}`;

            await AlertModel.findOneAndUpdate(
              { pairKey },
              {
                aSatId: idA, bSatId: idB,
                aName: a.name, bName: b.name,
                missKm: Math.round(miss*100)/100,
                tca: new Date(),
                level,
                resolved: false,
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          } else if (miss > RESOLVE_KM) {
            // mark resolved if exists
            const [idA, idB] = String(a._id) < String(b._id) ? [String(a._id), String(b._id)] : [String(b._id), String(a._id)];
            const pairKey = `${idA}__${idB}`;
            await AlertModel.updateOne({ pairKey, resolved: false }, { $set: { resolved: true } });
          }
        }
      }
    } catch (e) {
      console.error("[alert-scanner] error:", e);
    }
  };

  // kick and schedule
  tick();
  const h = setInterval(tick, SCAN_EVERY_MS);
  console.log(`[alert-scanner] running every ${SCAN_EVERY_MS/1000}s (ALERT_KM=${ALERT_KM})`);
  return () => clearInterval(h);
}
