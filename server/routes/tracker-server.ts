import fs from "fs";
import path from "path";
import { Server as SocketIOServer } from "socket.io";

// Helper to read JSON safely
function readArr(filePath: string) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

export function attachTrackerServer(httpServer: any) {
  const io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("Tracker client connected:", socket.id);

    const satellitesPath = path.join(process.cwd(), "data", "satellites.json");

    const interval = setInterval(() => {
      const satellites = readArr(satellitesPath)
        .filter((sat: any) => sat.status === "active")
        .map((sat: any) => ({
          id: sat.id,
          name: sat.name,
          lat: sat.lat,
          lon: sat.lon,
          altKm: sat.altKm,
          status: sat.status,
        }));

      // debug
      console.log("Sending positions:", satellites);

      socket.emit("satellite-positions", { positions: satellites });
    }, 1000);

    socket.on("disconnect", () => {
      clearInterval(interval);
      console.log("Tracker client disconnected:", socket.id);
    });
  });

  console.log("Tracker server attached to backend");
  return io;
}
