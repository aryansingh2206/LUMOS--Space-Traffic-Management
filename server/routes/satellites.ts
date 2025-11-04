// server/routes/satellites.ts
import { Router } from "express";
import { SatelliteModel } from "../models/Satellite";

const router = Router();

/**
 * GET /api/satellites/active
 * Returns minimal fields the 3D viewer needs, mapped from your schema.
 */
router.get("/active", async (_req, res) => {
  try {
    const sats = await SatelliteModel.find({ status: "active" })
      .select("name country status position updatedAt")
      .lean();

    const payload = (sats || []).map((s: any) => ({
      id: String(s._id ?? s.noradId ?? s.name),
      name: s.name ?? "Unknown",
      status: s.status ?? "active",
      country: s.country ?? "",
      // map from nested position.*
      lat: Number(s.position?.lat ?? 0),
      lon: Number(s.position?.lon ?? 0),
      altKm: Number(s.position?.altKm ?? 400),
      updatedAt: s.updatedAt ?? new Date().toISOString(),
    }));

    res.json(payload);
  } catch (e) {
    console.error("[satellites] /active error:", e);
    res.status(500).json({ error: "Failed to load active satellites" });
  }
});

/**
 * (Optional debug) GET /api/satellites/all
 * Handy to eyeball what the DB is returning during dev.
 */
router.get("/all", async (_req, res) => {
  try {
    const sats = await SatelliteModel.find({}).lean();
    res.json(sats);
  } catch (e) {
    res.status(500).json({ error: "Failed to load satellites" });
  }
});

export default router;
