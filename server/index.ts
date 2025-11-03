import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { handleDemo } from "./routes/demo";
import dashboardRouter from "./routes/dashboard";
import launchesRouter from "./routes/launches";
import { attachTrackerServer } from "./routes/tracker-server.js"; // Import tracker

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static data for frontend
  const dataPath = path.join(process.cwd(), "data");
  app.use("/data", express.static(dataPath));

  // Routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  app.use("/api/launches", launchesRouter);
  app.use("/api/dashboard", dashboardRouter);

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const server = http.createServer(app);

  attachTrackerServer(server);

  const PORT = 4000;
  server.listen(PORT, () =>
    console.log(`Backend + tracker running on port ${PORT}`)
  );
}
