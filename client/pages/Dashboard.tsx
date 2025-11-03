import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Satellite, AlertTriangle, Rocket, Shield, X } from "lucide-react";
import axios from "axios";

export default function Dashboard() {
  const initialOverview = [
    { title: "Active Satellites", value: "0", change: "+0 today", icon: <Satellite className="h-6 w-6" />, color: "text-neon-blue" },
    { title: "Collision Warnings", value: "0", change: "0 high-risk", icon: <AlertTriangle className="h-6 w-6" />, color: "text-destructive" },
    { title: "Upcoming Launches", value: "0", change: "Next: 0", icon: <Rocket className="h-6 w-6" />, color: "text-neon-purple" },
    { title: "High-Risk Objects", value: "0", change: "+0 this week", icon: <Shield className="h-6 w-6" />, color: "text-yellow-400" },
  ];

  const initialActivity = [
    { message: "New satellite deployment", timeAgo: "2 min ago", variant: "secondary" },
    { message: "Collision warning updated", timeAgo: "15 min ago", variant: "destructive" },
    { message: "Launch schedule updated", timeAgo: "1 hour ago", variant: "bg-neon-purple" },
  ];

  const [overviewData, setOverviewData] = useState(initialOverview);
  const [recentActivity, setRecentActivity] = useState(initialActivity);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [satelliteName, setSatelliteName] = useState("");
  const [orbitType, setOrbitType] = useState("LEO");
  const [country, setCountry] = useState("USA");
  const [launchDate, setLaunchDate] = useState("");
  const [launchTime, setLaunchTime] = useState("");

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("/api/dashboard/data");
      const data = res.data;

      setOverviewData([
        { title: "Active Satellites", value: data.activeSatellites.toString(), change: data.activeChange, icon: <Satellite className="h-6 w-6" />, color: "text-neon-blue" },
        { title: "Collision Warnings", value: data.collisionWarnings.toString(), change: data.collisionChange, icon: <AlertTriangle className="h-6 w-6" />, color: "text-destructive" },
        { title: "Upcoming Launches", value: data.upcomingLaunches.toString(), change: data.launchChange, icon: <Rocket className="h-6 w-6" />, color: "text-neon-purple" },
        { title: "High-Risk Objects", value: data.highRiskObjects.toString(), change: data.highRiskChange, icon: <Shield className="h-6 w-6" />, color: "text-yellow-400" },
      ]);

      setRecentActivity(data.recentActivity);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // update every 10s
    return () => clearInterval(interval);
  }, []);

  const handleLaunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/launches", {
        name: satelliteName,
        orbitType,
        country,
        date: launchDate,
        time: launchTime,
        launchPad: "",
        rocketType: "",
        description: "",
      });
      fetchDashboardData();
      setShowModal(false);
      setSatelliteName("");
      setOrbitType("LEO");
      setCountry("USA");
      setLaunchDate("");
      setLaunchTime("");
    } catch (err) {
      console.error(err);
      alert("Failed to schedule launch");
    }
  };

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
        <div className="mb-8 flex flex-wrap gap-4">
          <Button variant="outline" className="border-neon-blue text-neon-blue hover:bg-neon-blue/10">All Objects</Button>
          <Button variant="outline" className="border-border">By Country</Button>
          <Button variant="outline" className="border-border">By Orbit Type</Button>
          <Button variant="outline" className="border-border">Risk Level</Button>
        </div>

        {/* Overview Cards */}
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

        {/* Quick Actions */}
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
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.message}</span>
                  <Badge className={item.variant}>{item.timeAgo}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

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
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Orbit Type</label>
                  <select
                    value={orbitType}
                    onChange={e => setOrbitType(e.target.value)}
                    className="w-full p-2 rounded border border-border bg-background text-foreground"
                  >
                    <option value="LEO">LEO</option>
                    <option value="MEO">MEO</option>
                    <option value="GEO">GEO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    required
                    className="w-full p-2 rounded border border-border bg-background text-foreground"
                  />
                </div>
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
