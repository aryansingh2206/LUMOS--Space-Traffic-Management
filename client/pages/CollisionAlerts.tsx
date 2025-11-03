import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface CollisionAlert {
  id: string;
  satellites: string[]; // Satellite names
  distanceKm: number;
  riskLevel: "low" | "medium" | "high";
  predictedTime: string;
}

export default function CollisionAlerts() {
  const [alerts, setAlerts] = useState<CollisionAlert[]>([]);

  useEffect(() => {
    // Connect to backend + tracker
    const socket = io("http://localhost:4000");

    socket.on("connect", () => console.log("Connected to collision alert server"));

    // Listen for collision alerts
    socket.on("collision-alerts", (data: any) => {
      if (data.alerts) setAlerts(data.alerts);
    });

    socket.on("disconnect", () => console.log("Disconnected from server"));

    return () => {
      socket.disconnect();
    };
  }, []);

  const getRiskColor = (level: CollisionAlert["riskLevel"]) => {
    switch (level) {
      case "high":
        return "bg-red-700";
      case "medium":
        return "bg-yellow-600";
      default:
        return "bg-green-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-orbitron text-foreground mb-4 glow-text">
          Collision Alerts
        </h1>
        <p className="text-muted-foreground mb-8">
          Current and predicted orbital collision warnings
        </p>

        <div className="bg-card border border-border rounded-lg p-8 text-center">
          {alerts.length === 0 && <p className="text-muted-foreground">No collision alerts at the moment</p>}

          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 mb-2 rounded text-white ${getRiskColor(alert.riskLevel)}`}
            >
              <strong>{alert.satellites.join(" & ")}</strong>
              <p>Distance: {alert.distanceKm.toFixed(2)} km</p>
              <p>Predicted Time: {new Date(alert.predictedTime).toLocaleTimeString()}</p>
              <p>Risk Level: {alert.riskLevel.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
