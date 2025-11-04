// server/index.ts
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";

import { handleDemo } from "./routes/demo";
import dashboardRouter from "./routes/dashboard";
import launchesRouter from "./routes/launches";
import alertsRouter from "./routes/alerts";              // 🆕 Alerts API
import satellitesRouter from "./routes/satellites";      // 🆕 Satellites API
import { attachTrackerServer } from "./routes/tracker-server";
import { connectMongo } from "./db/mongo";
import { startAlertScanner } from "./services/alert-scanner"; // 🆕 Alert scanner

export function createServer() {
  const app = express();

  // 🔧 Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 🔗 Connect MongoDB
  connectMongo().catch((err) => {
    console.error("[mongo] Connection error:", err);
  });

  // 📂 Static data (for any legacy JSON or assets)
  const dataPath = path.join(process.cwd(), "data");
  app.use("/data", express.static(dataPath));

  // 🩺 Health check + demo
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v3!" });
  });
  app.get("/api/demo", handleDemo);

  // 🚀 Core routes
  app.use("/api/launches", launchesRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/alerts", alertsRouter);
  app.use("/api/satellites", satellitesRouter); // ✅ Mount satellites route

  // 🛰️ Start periodic alert scanner
  startAlertScanner();

  return app;
}

// 🧩 If run directly, start the HTTP + tracker servers
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const server = http.createServer(app);

  // Attach the real-time tracker socket
  attachTrackerServer(server);

  const PORT = Number(process.env.PORT) || 4000;
  server.listen(PORT, () => {
    console.log(`✅ Backend + tracker running on port ${PORT}`);
  });
}
