import { useEffect, useMemo, useState } from "react";

type Launch = {
  id?: number;
  name: string;
  date: string;
  time?: string;
  launchPad?: string;
  rocketType?: string;
  orbitType?: string;
};

export default function LaunchSchedule() {
  const [launches, setLaunches] = useState<Launch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/upcoming-launches");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Launch[] = await res.json();
        if (!cancelled) setLaunches(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load launches");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const upcoming = useMemo(() => {
    if (!launches) return [];
    const now = Date.now();
    return [...launches]
      .filter(l => {
        const launchDateTime = new Date(`${l.date}T${l.time || "00:00"}`).getTime();
        return launchDateTime >= now;
      })
      .sort((a, b) => {
        const aTime = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
        const bTime = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
        return aTime - bTime;
      });
  }, [launches]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-orbitron text-foreground mb-4 glow-text">Launch Schedule</h1>
        <p className="text-muted-foreground mb-8">Upcoming rocket launches and mission timelines</p>

        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-orbitron text-foreground mb-2">Mission Timeline</h2>
          <p className="text-muted-foreground">This page will display upcoming launches with detailed schedules and mission information.</p>

          <div className="mt-6">
            {launches === null && !error && <div className="text-sm text-muted-foreground">Loading launches…</div>}
            {error && <div className="text-sm text-yellow-500">Couldn’t load launches ({error}). The timeline will appear once the API is ready.</div>}
            {launches && upcoming.length === 0 && <div className="text-sm text-muted-foreground">No upcoming launches found.</div>}

            {upcoming.length > 0 && (
              <ul className="mt-4 space-y-4 text-left max-w-3xl mx-auto">
                {upcoming.map((l) => {
                  const launchDateTime = new Date(`${l.date}T${l.time || "00:00"}`);
                  return (
                    <li key={`${l.name}-${l.date}-${l.time || "00:00"}`} className="border border-border rounded-lg p-4 bg-background/40">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="text-lg font-semibold text-foreground">{l.name}</div>
                          <div className="text-xs text-muted-foreground">{l.rocketType || ""} {l.orbitType ? `• ${l.orbitType}` : ""}</div>
                        </div>
                        <div className="text-sm text-foreground">
                          {launchDateTime.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-muted-foreground">{l.launchPad || "Unknown Launch Pad"}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
