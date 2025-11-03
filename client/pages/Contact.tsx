export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <h1 className="text-4xl font-bold font-orbitron text-foreground mb-2 glow-text">
          Contact Us
        </h1>
        <p className="text-muted-foreground mb-8">
          Reach out to the Lumos team for inquiries, feedback, or collaboration.
        </p>

        {/* Contact Form */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <div className="text-6xl mb-4 text-center">📡</div>
          <h2 className="text-2xl font-orbitron text-foreground mb-4 text-center">
            Send Us a Message
          </h2>
          <form className="max-w-lg mx-auto space-y-4 text-left">
            <label className="block">
              <span className="text-muted-foreground">Name</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                placeholder="Your Name"
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground">Email</span>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                placeholder="your@email.com"
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground">Message</span>
              <textarea
                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                rows={4}
                placeholder="Your message..."
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-md bg-foreground text-background py-2 font-bold hover:bg-foreground/80 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Team Info */}
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">👨‍🚀</div>
          <h2 className="text-2xl font-orbitron text-foreground mb-2">
            Our Team
          </h2>
          <p className="text-muted-foreground">
            Lumos is built by a dedicated team of space enthusiasts, engineers, and developers committed to making space safer and more accessible.
          </p>
        </div>
      </div>
    </div>
  );
}
