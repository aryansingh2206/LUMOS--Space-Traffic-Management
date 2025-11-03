export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <h1 className="text-4xl font-bold font-orbitron text-foreground mb-2 glow-text">
          About Lumos
        </h1>
        <p className="text-muted-foreground mb-8">
          Bringing order to orbital chaos with real-time space traffic insights.
        </p>

        {/* Our Mission */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🌌</div>
          <h2 className="text-2xl font-orbitron text-foreground mb-2">Our Mission</h2>
          <p className="text-muted-foreground">
            Lumos aims to monitor and manage satellites, predict collisions, and provide actionable insights to prevent orbital congestion and debris.
          </p>
        </div>

        {/* The Problem */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8 text-center">
          <div className="text-6xl mb-4">☄️</div>
          <h2 className="text-2xl font-orbitron text-foreground mb-2">The Problem</h2>
          <p className="text-muted-foreground">
            Space is getting crowded. Thousands of satellites and debris fragments orbit Earth, increasing collision risks and threatening future missions. Managing this traffic is critical for sustainable space activity.
          </p>
        </div>

        {/* Our Technology */}
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🛰️</div>
          <h2 className="text-2xl font-orbitron text-foreground mb-2">Our Technology</h2>
          <p className="text-muted-foreground">
            Lumos combines real-time satellite tracking, predictive collision modeling, and AI-powered alert systems. Using our dashboard, agencies and private operators can visualize orbits, monitor launches, and make informed decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
