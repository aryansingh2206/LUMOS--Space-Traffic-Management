import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Satellite,
  AlertTriangle,
  Map,
  Calendar,
  Shield,
  Zap,
  Eye,
  Globe,
  ArrowRight,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";

export default function Index() {
  const features = [
    {
      icon: <AlertTriangle className="h-8 w-8" />,
      title: "Collision Alerts",
      description:
        "Real-time warnings for potential satellite collisions with advanced prediction algorithms",
      color: "text-destructive",
    },
    {
      icon: <Map className="h-8 w-8" />,
      title: "Satellite Map",
      description:
        "Interactive 3D visualization of all orbital objects with precise tracking data",
      color: "text-neon-blue",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Debris Tracker",
      description:
        "Monitor space debris and track potentially hazardous objects in Earth's orbit",
      color: "text-yellow-400",
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Launch Timeline",
      description:
        "Comprehensive schedule of upcoming rocket launches and mission details",
      color: "text-neon-purple",
    },
  ];

  const stats = [
    { value: "5,847", label: "Active Satellites" },
    { value: "34,000+", label: "Tracked Objects" },
    { value: "99.9%", label: "Accuracy Rate" },
    { value: "24/7", label: "Monitoring" },
  ];

  const partners = [
    "NASA",
    "SpaceX",
    "ESA",
    "Space-Track",
    "CelesTrak",
    "Blue Origin",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-space-deep via-space-navy to-space-navy-light">
        <div className="absolute inset-0 star-field opacity-30"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge
                variant="outline"
                className="border-neon-blue text-neon-blue px-4 py-2 text-sm font-medium"
              >
                🛰️ Space Traffic Management Platform
              </Badge>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-orbitron text-foreground glow-text">
                <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  LUMOS
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
                Bringing Order to Orbital Chaos
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Advanced space traffic management with real-time satellite
                tracking, collision prediction, and comprehensive orbital
                awareness.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-neon-blue hover:bg-neon-blue-dark text-background font-semibold px-8 py-3 text-lg shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-300"
                >
                  View Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-neon-purple text-neon-purple hover:bg-neon-purple/10 px-8 py-3 text-lg transition-all duration-300"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold font-orbitron text-neon-blue">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Lumos Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold font-orbitron text-foreground">
                What is Lumos?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Lumos is an advanced space traffic management platform that
                provides real-time monitoring of satellites, predicts potential
                collisions, and tracks rocket launches. Our mission is to ensure
                the sustainable use of orbital space for future generations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-card border-border hover:shadow-glow-blue transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-neon-blue/10 rounded-full w-fit">
                    <Eye className="h-8 w-8 text-neon-blue" />
                  </div>
                  <CardTitle className="font-orbitron">Monitor</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Track over 34,000 objects in real-time with precision
                    orbital data.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-glow-purple transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-neon-purple/10 rounded-full w-fit">
                    <Zap className="h-8 w-8 text-neon-purple" />
                  </div>
                  <CardTitle className="font-orbitron">Predict</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Advanced algorithms predict potential collisions days in
                    advance.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-glow-blue transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-yellow-400/10 rounded-full w-fit">
                    <Globe className="h-8 w-8 text-yellow-400" />
                  </div>
                  <CardTitle className="font-orbitron">Protect</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Safeguard orbital infrastructure for sustainable space
                    operations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gradient-to-br from-space-navy/20 to-space-deep/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-orbitron text-foreground mb-4">
              Key Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for space situational awareness and orbital
              safety management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card border-border hover:shadow-glow-blue transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div
                      className={`${feature.color} p-3 bg-background rounded-lg`}
                    >
                      {feature.icon}
                    </div>
                    <CardTitle className="font-orbitron text-xl">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold font-orbitron text-foreground mb-4">
              Trusted Data Sources
            </h3>
            <p className="text-muted-foreground">
              Partnering with leading space agencies and organizations
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="text-lg font-semibold text-muted-foreground hover:text-neon-blue transition-colors duration-300"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="text-2xl font-bold font-orbitron text-neon-blue glow-text">
                LUMOS
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bringing order to orbital chaos through advanced space traffic
                management.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="block text-muted-foreground hover:text-neon-blue transition-colors text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  to="/tracker"
                  className="block text-muted-foreground hover:text-neon-blue transition-colors text-sm"
                >
                  Satellite Tracker
                </Link>
                <Link
                  to="/alerts"
                  className="block text-muted-foreground hover:text-neon-blue transition-colors text-sm"
                >
                  Collision Alerts
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <div className="space-y-2">
                <Link
                  to="/about"
                  className="block text-muted-foreground hover:text-neon-blue transition-colors text-sm"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block text-muted-foreground hover:text-neon-blue transition-colors text-sm"
                >
                  Contact
                </Link>
                <div className="text-muted-foreground text-sm">
                  Privacy Policy
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect</h4>
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-neon-blue"
                >
                  <Github className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-neon-blue"
                >
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-neon-blue"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Lumos. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
