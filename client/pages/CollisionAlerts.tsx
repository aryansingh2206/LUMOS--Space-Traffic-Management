import { useEffect, useState, useCallback } from "react";
import axios from "axios";

type BackendAlert = {
  _id: string;
  aName?: string;
  bName?: string;
  missKm: number;
  level: "info" | "watch" | "warning" | "critical";
  tca: string;            // ISO
  acknowledged?: boolean;
  resolved?: boolean;
  updatedAt?: string;
};

type UIRisk = "low" | "medium" | "high";

interface CollisionAlert {
  id: string;
  satellites: string[];   // [aName, bName]
  distanceKm: number;
  riskLevel: UIRisk;
  predictedTime: string;  // ISO (tca)
  acknowledged: boolean;
}

function mapLevelToRisk(level: BackendAlert["level"]): UIRisk {
  if (level === "critical" || level === "warning") return "high";
  if (level === "watch") return "medium";
  return "low"; // info
}

export default function CollisionAlerts() {
  const [alerts, setAlerts] = useState<CollisionAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await axios.get<BackendAlert[]>("/api/alerts");
      const list = (res.data || [])
        .filter(a => !a.resolved) // only unresolved
        .map(a => ({
          id: a._id,
          satellites: [a.aName ?? "Sat-A", a.bName ?? "Sat-B"],
          distanceKm: a.missKm,
          riskLevel: mapLevelToRisk(a.level),
          predictedTime: a.tca,
          acknowledged: !!a.acknowledged,
        }));
      setAlerts(list);
    } catch (e) {
      console.error("Failed to fetch alerts", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const h = setInterval(fetchAlerts, 10_000);
    return () => clearInterval(h);
  }, [fetchAlerts]);

  const ackAlert = async (id: string) => {
    try {
      await axios.post(`/api/alerts/${id}/ack`);
      // reflect immediately in UI
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a)));
    } catch (e) {
      console.error("Failed to acknowledge alert", e);
    }
  };

  const riskColor = (level: UIRisk, acknowledged: boolean) => {
    if (acknowledged) return "bg-gray-600";
    switch (level) {
      case "high": return "bg-red-700";
      case "medium": return "bg-yellow-600";
      default: return "bg-green-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-orbitron text-foreground mb-4 glow-text">
          Collision Alerts
        </h1>
        <p className="text-muted-foreground mb-8">
          Current close-approach warnings (auto-scanned every 30s)
        </p>

        <div className="bg-card border border-border rounded-lg p-6">
          {loading && <p className="text-muted-foreground">Loading alerts…</p>}
          {!loading && alerts.length === 0 && (
            <p className="text-muted-foreground">No collision alerts at the moment</p>
          )}

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded text-white flex flex-col md:flex-row md:items-center md:justify-between ${riskColor(alert.riskLevel, alert.acknowledged)}`}
              >
                <div className="space-y-1">
                  <div className="font-semibold">
                    {alert.satellites.join(" & ")}
                  </div>
                  <div className="text-sm opacity-90">
                    Distance: {alert.distanceKm.toFixed(2)} km
                    {" · "}
                    TCA: {new Date(alert.predictedTime).toLocaleString()}
                    {" · "}
                    Risk: {alert.riskLevel.toUpperCase()}
                    {alert.acknowledged ? " · ACKNOWLEDGED" : ""}
                  </div>
                </div>

                {!alert.acknowledged && (
                  <button
                    className="mt-3 md:mt-0 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded"
                    onClick={() => ackAlert(alert.id)}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optional: manual refresh */}
        <div className="mt-4">
          <button
            onClick={fetchAlerts}
            className="text-sm px-3 py-2 border border-border rounded hover:bg-accent/20"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
