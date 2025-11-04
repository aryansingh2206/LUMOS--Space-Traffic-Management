import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Satellite, AlertTriangle, Rocket, Shield, X } from "lucide-react";
import axios from "axios";

type Risk = "low" | "medium" | "high";
type Orbit = "LEO" | "MEO" | "GEO" | "HEO" | "SSO" | "Other";

type DashboardStats = {
  activeSatellites: number;
  activeChange: string;
  collisionWarnings: number;
  collisionChange: string;
  upcomingLaunches: number;
  launchChange: string;
  highRiskObjects: number;
  highRiskChange: string;
  recentActivity: { message: string; timeAgo: string; variant: string }[];
  // optional helper payloads so we can render object previews
  objects?: { id: string; name: string; country: string; orbitType: string; riskLevel: Risk }[];
  countries?: string[];
};

export default function Dashboard() {
  // ---------- UI STATE ----------
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // KPI cards
  const [overviewData, setOverviewData] = useState([
    { title: "Active Satellites", value: "0", change: "+0 today", icon: <Satellite className="h-6 w-6" />, color: "text-neon-blue" },
    { title: "Collision Warnings", value: "0", change: "0 high-risk", icon: <AlertTriangle className="h-6 w-6" />, color: "text-destructive" },
    { title: "Upcoming Launches", value: "0", change: "Next: 0", icon: <Rocket className="h-6 w-6" />, color: "text-neon-purple" },
    { title: "High-Risk Objects", value: "0", change: "+0 this week", icon: <Shield className="h-6 w-6" />, color: "text-yellow-400" },
  ]);

  // activity & preview
  const [recentActivity, setRecentActivity] = useState<{ message: string; timeAgo: string; variant: string }[]>([]);
  const [objectsPreview, setObjectsPreview] = useState<DashboardStats["objects"]>([]);
  const [countries, setCountries] = useState<string[]>(["USA", "India"]); // will get replaced by API if available

  // filter tab + values
  const [tab, setTab] = useState<"all" | "country" | "orbit" | "risk">("all");
  const [country, setCountry] = useState<string>("All");
  const [orbitType, setOrbitType] = useState<Orbit>("LEO");
  const [risk, setRisk] = useState<Risk>("low");

  // launch modal
  const [showModal, setShowModal] = useState(false);
  const [satelliteName, setSatelliteName] = useState("");
  const [launchOrbit, setLaunchOrbit] = useState<Orbit>("LEO");
  const [agencyCountry, setAgencyCountry] = useState("USA");
  const [launchDate, setLaunchDate] = useState("");
  const [launchTime, setLaunchTime] = useState("");
  const [rocketType, setRocketType] = useState("");
  const [launchPad, setLaunchPad] = useState("");

  // ---------- DATA FETCH ----------
  const fetchDashboardData = async (params?: { country?: string; orbitType?: string; risk?: Risk }) => {
    const res = await axios.get<DashboardStats>("/api/dashboard/data", { params });
    return res.data;
  };

  const refresh = async () => {
    try {
      setLoading(true);
      setErr(null);

      const params =
        tab === "country" && country !== "All" ? { country } :
        tab === "orbit" ? { orbitType } :
        tab === "risk" ? { risk } :
        undefined;

      const data = await fetchDashboardData(params);

      setOverviewData([
        { title: "Active Satellites", value: String(data.activeSatellites), change: data.activeChange, icon: <Satellite className="h-6 w-6" />, color: "text-neon-blue" },
        { title: "Collision Warnings", value: String(data.collisionWarnings), change: data.collisionChange, icon: <AlertTriangle className="h-6 w-6" />, color: "text-destructive" },
        { title: "Upcoming Launches", value: String(data.upcomingLaunches), change: data.launchChange, icon: <Rocket className="h-6 w-6" />, color: "text-neon-purple" },
        { title: "High-Risk Objects", value: String(data.highRiskObjects), change: data.highRiskChange, icon: <Shield className="h-6 w-6" />, color: "text-yellow-400" },
      ]);

      setRecentActivity(data.recentActivity || []);
      setObjectsPreview((data.objects || []).slice(0, 8));
      if (data.countries && data.countries.length) setCountries(["All", ...data.countries]);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 10000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, country, orbitType, risk]);

  // ---------- HANDLERS ----------
  const clearFilters = () => {
    setTab("all");
    setCountry("All");
    setOrbitType("LEO");
    setRisk("low");
  };

  const activeFilterLabel = useMemo(() => {
    if (tab === "country" && country !== "All") return `Country: ${country}`;
    if (tab === "orbit") return `Orbit: ${orbitType}`;
    if (tab === "risk") return `Risk: ${risk}`;
    return "All Objects";
  }, [tab, country, orbitType, risk]);

  const handleLaunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/launches", {
        name: satelliteName,
        orbitType: launchOrbit,
        country: agencyCountry,    // mapped to agency on server
        date: launchDate,          // YYYY-MM-DD
        time: launchTime,          // HH:MM
        launchPad,
        rocketType,
        description: "",
        status: "Scheduled",
      });
      await refresh();
      setShowModal(false);
      setSatelliteName("");
      setLaunchOrbit("LEO");
      setAgencyCountry("USA");
      setLaunchDate("");
      setLaunchTime("");
      setRocketType("");
      setLaunchPad("");
    } catch (err) {
      console.error(err);
      alert("Failed to schedule launch");
    }
  };

  // ---------- RENDER ----------
  if (loading) return <div className="p-8 text-center text-foreground">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-orbitron text-foreground mb-2 glow-text">Mission Control Dashboard</h1>
          <p className="text-muted-foreground text-lg">Real-time orbital situation awareness</p>
        </div>

        {/* Filter Bar */}
        <div className="mb-4 flex flex-wrap gap-3">
          <Button
            variant={tab === "all" ? "default" : "outline"}
            className={tab === "all" ? "bg-neon-blue text-background" : "border-neon-blue text-neon-blue hover:bg-neon-blue/10"}
            onClick={() => setTab("all")}
          >
            All Objects
          </Button>
          <Button
            variant={tab === "country" ? "default" : "outline"}
            className={tab === "country" ? "bg-neon-blue text-background" : "border-border"}
            onClick={() => setTab("country")}
          >
            By Country
          </Button>
          <Button
            variant={tab === "orbit" ? "default" : "outline"}
            className={tab === "orbit" ? "bg-neon-blue text-background" : "border-border"}
            onClick={() => setTab("orbit")}
          >
            By Orbit Type
          </Button>
          <Button
            variant={tab === "risk" ? "default" : "outline"}
            className={tab === "risk" ? "bg-neon-blue text-background" : "border-border"}
            onClick={() => setTab("risk")}
          >
            Risk Level
          </Button>

          {(tab !== "all") && (
            <Button variant="ghost" className="ml-auto" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="mb-8">
          {tab === "country" && (
            <div className="flex gap-3 items-center">
              <label className="text-sm text-muted-foreground">Country</label>
              <select
                className="p-2 rounded border border-border bg-background text-foreground"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Badge variant="secondary" className="ml-2">{activeFilterLabel}</Badge>
            </div>
          )}

          {tab === "orbit" && (
            <div className="flex gap-3 items-center">
              <label className="text-sm text-muted-foreground">Orbit</label>
              <select
                className="p-2 rounded border border-border bg-background text-foreground"
                value={orbitType}
                onChange={(e) => setOrbitType(e.target.value as Orbit)}
              >
                {["LEO","MEO","GEO","HEO","SSO","Other"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <Badge variant="secondary" className="ml-2">{activeFilterLabel}</Badge>
            </div>
          )}

          {tab === "risk" && (
            <div className="flex gap-3 items-center">
              <label className="text-sm text-muted-foreground">Risk</label>
              <select
                className="p-2 rounded border border-border bg-background text-foreground"
                value={risk}
                onChange={(e) => setRisk(e.target.value as Risk)}
              >
                {["low","medium","high"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <Badge variant="secondary" className="ml-2">{activeFilterLabel}</Badge>
            </div>
          )}

          {tab === "all" && <Badge variant="secondary">{activeFilterLabel}</Badge>}
        </div>

        {/* Overview Cards (KPI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewData.map((item, idx) => (
            <Card key={idx} className="bg-card border-border hover:shadow-glow-blue transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                <div className={item.color}>{item.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-orbitron text-foreground">{item.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{item.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-orbitron text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full bg-neon-blue hover:bg-neon-blue-dark text-background font-semibold"
                onClick={() => setShowModal(true)}
              >
                Launch Satellite
              </Button>
              <Button
                variant="outline"
                className="w-full border-neon-purple text-neon-purple hover:bg-neon-purple/10"
                onClick={() => (window.location.href = "/launches")}
              >
                Check Launch Schedule
              </Button>
              <Button
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => (window.location.href = "/alerts")}
              >
                Review Active Alerts
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-orbitron text-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length === 0 && <div className="text-sm text-muted-foreground">Quiet skies… for now.</div>}
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.message}</span>
                  <Badge className={item.variant}>{item.timeAgo}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Filtered Objects Preview */}
        <Card className="bg-card border-border mb-16">
          <CardHeader>
            <CardTitle className="font-orbitron text-foreground">Filtered Objects (preview)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {objectsPreview && objectsPreview.length ? (
              objectsPreview.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{o.name}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{o.country}</Badge>
                    <Badge variant="secondary">{o.orbitType}</Badge>
                    <Badge className={o.riskLevel === "high" ? "bg-destructive text-background" : ""}>
                      {o.riskLevel}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No objects match the current filter.</div>
            )}
          </CardContent>
        </Card>

        {/* Launch Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-2xl w-full max-w-md relative">
              <button className="absolute top-4 right-4 text-muted-foreground" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-foreground mb-4">Launch Satellite</h2>
              <form onSubmit={handleLaunchSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Satellite Name</label>
                  <input
                    type="text"
                    value={satelliteName}
                    onChange={e => setSatelliteName(e.target.value)}
                    required
                    className="w-full p-2 rounded border border-border bg-background text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Orbit Type</label>
                    <select
                      value={launchOrbit}
                      onChange={e => setLaunchOrbit(e.target.value as Orbit)}
                      className="w-full p-2 rounded border border-border bg-background text-foreground"
                    >
                      {["LEO","MEO","GEO","HEO","SSO","Other"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Agency/Country</label>
                    <input
                      type="text"
                      value={agencyCountry}
                      onChange={e => setAgencyCountry(e.target.value)}
                      required
                      className="w-full p-2 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Vehicle (Rocket Type)</label>
                    <input
                      type="text"
                      placeholder="Falcon 9 / PSLV / Ariane 6"
                      value={rocketType}
                      onChange={e => setRocketType(e.target.value)}
                      required
                      className="w-full p-2 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Launch Site</label>
                    <input
                      type="text"
                      placeholder="SLC-40 / SHAR / Kourou ELA-4"
                      value={launchPad}
                      onChange={e => setLaunchPad(e.target.value)}
                      required
                      className="w-full p-2 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Launch Date</label>
                    <input
                      type="date"
                      value={launchDate}
                      onChange={e => setLaunchDate(e.target.value)}
                      required
                      className="w-full p-2 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Launch Time</label>
                    <input
                      type="time"
                      value={launchTime}
                      onChange={e => setLaunchTime(e.target.value)}
                      required
                      className="w-full p-2 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-neon-blue hover:bg-neon-blue-dark text-background font-semibold">
                  Launch
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
