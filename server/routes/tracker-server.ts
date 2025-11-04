// server/routes/tracker-server.ts
import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { SatelliteModel } from "../models/Satellite";

/**
 * Attaches a Socket.IO tracker server that emits live satellite positions
 * every second to connected clients.
 */
export function attachTrackerServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`🛰️ Tracker client connected: ${socket.id}`);

    const sendSatellitePositions = async () => {
      try {
        // Fetch active satellites from MongoDB
        const satellites = await SatelliteModel.find(
          { status: "active" },
          {
            _id: 1,
            name: 1,
            "position.lat": 1,
            "position.lon": 1,
            "position.altKm": 1,
            status: 1,
          }
        ).lean();

        // If you want to simulate motion (optional for demo)
        const updatedPositions = satellites.map((sat) => ({
          id: sat._id,
          name: sat.name,
          lat:
            sat.position?.lat !== undefined
              ? sat.position.lat + Math.random() * 0.05 - 0.025
              : 0,
          lon:
            sat.position?.lon !== undefined
              ? sat.position.lon + Math.random() * 0.05 - 0.025
              : 0,
          altKm: sat.position?.altKm ?? 400,
          status: sat.status,
        }));

        // Emit the updated positions to the connected client
        socket.emit("satellite-positions", { positions: updatedPositions });
      } catch (err) {
        console.error("❌ Tracker emit error:", err);
      }
    };

    // Send every second
    const interval = setInterval(sendSatellitePositions, 1000);

    socket.on("disconnect", () => {
      clearInterval(interval);
      console.log(`🛰️ Tracker client disconnected: ${socket.id}`);
    });
  });

  console.log("✅ Tracker server attached to backend (MongoDB powered)");
  return io;
}
