import { Router } from "express";
import { AlertModel } from "../models/Alert";

const router = Router();

// List active (non-resolved) alerts, newest first
router.get("/", async (_req, res) => {
  try {
    const items = await AlertModel.find({ resolved: false }).sort({ updatedAt: -1 }).lean();
    res.json(items);
  } catch (e:any) {
    res.status(500).json({ error: e.message || "Failed to fetch alerts" });
  }
});

// Stats for dashboard
router.get("/stats", async (_req, res) => {
  try {
    const agg = await AlertModel.aggregate([
      { $match: { resolved: false } },
      { $group: { _id: "$level", count: { $sum: 1 } } }
    ]);
    const byLevel = Object.fromEntries(agg.map(x => [x._id, x.count]));
    res.json(byLevel);
  } catch (e:any) {
    res.status(500).json({ error: e.message || "Failed to fetch stats" });
  }
});

// Acknowledge (dismiss from UI but keep record)
router.post("/:id/ack", async (req, res) => {
  try {
    await AlertModel.updateOne({ _id: req.params.id }, { $set: { acknowledged: true } });
    res.json({ ok: true });
  } catch (e:any) {
    res.status(500).json({ error: e.message || "Failed to acknowledge" });
  }
});

// Manually resolve (optional)
router.post("/:id/resolve", async (req, res) => {
  try {
    await AlertModel.updateOne({ _id: req.params.id }, { $set: { resolved: true } });
    res.json({ ok: true });
  } catch (e:any) {
    res.status(500).json({ error: e.message || "Failed to resolve" });
  }
});

export default router;
