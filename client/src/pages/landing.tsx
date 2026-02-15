import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Scale, Shield, Users, FileText, MessageCircle, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI Case Analysis",
    desc: "Upload your legal documents and our AI generates a clear, anonymized case description for law firms to review.",
  },
  {
    icon: Users,
    title: "Vetted Partner Pool",
    desc: "Browse qualified law firms with detailed profiles, specialties, and locations. Find the right match for your case.",
  },
  {
    icon: MessageCircle,
    title: "Secure Messaging",
    desc: "Communicate directly with interested law firms through our encrypted in-app messaging system.",
  },
];

const stats = [
  { value: "500+", label: "Law Partners" },
  { value: "12k+", label: "Cases Matched" },
  { value: "98%", label: "Client Satisfaction" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">Vertogogo</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground transition-colors" data-testid="link-features">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors" data-testid="link-how-it-works">How It Works</a>
              <a href="#for-agencies" className="text-sm text-muted-foreground transition-colors" data-testid="link-for-agencies">For Agencies</a>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a href="/api/login">
                <Button variant="outline" data-testid="button-login">Log In</Button>
              </a>
              <a href="/api/login">
                <Button data-testid="button-get-started">Get Started</Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-sm text-primary">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Free for clients</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-serif leading-tight">
                  Find the Right<br />
                  <span className="text-primary">Legal Partner</span><br />
                  for Your Case
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Vertogogo connects you with qualified law firms through AI-powered case matching. Upload your documents, get matched, and communicate securely.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a href="/api/login">
                  <Button size="lg" data-testid="button-hero-cta">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" data-testid="button-hero-learn">
                    Learn More
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  AI-powered matching
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Secure & confidential
                </span>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative rounded-md overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 aspect-square flex items-center justify-center">
                <div className="space-y-4 w-full max-w-sm">
                  {stats.map((stat) => (
                    <Card key={stat.label} className="p-4 hover-elevate">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <span className="text-2xl font-bold text-primary">{stat.value}</span>
                      </div>
                    </Card>
                  ))}
                  <Card className="p-4 bg-primary text-primary-foreground">
                    <div className="flex items-center gap-3">
                      <Scale className="h-8 w-8" />
                      <div>
                        <p className="font-semibold">Vertigo Law Partners</p>
                        <p className="text-sm opacity-80">Your trusted partner pool</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">How Vertogogo Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A seamless process from document upload to finding the right legal representation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={feature.title} className="p-6 hover-elevate">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">{i + 1}</span>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="for-agencies" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">For Law Firms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Join Vertigo Law Partners and get access to pre-qualified cases from clients looking for legal representation. Our AI-powered matching ensures you only see cases relevant to your expertise.
              </p>
              <div className="space-y-3">
                {[
                  "Access AI-analyzed case descriptions",
                  "Filter cases by specialty and location",
                  "Communicate directly with potential clients",
                  "Build your firm's online presence",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Card className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Monthly subscription</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">995</span>
                    <span className="text-muted-foreground">SEK/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Cancel anytime</p>
                </div>
              </Card>
            </div>
            <div className="flex items-center justify-center">
              <Card className="p-8 max-w-sm w-full space-y-6 text-center">
                <Scale className="h-16 w-16 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Join as a Law Firm</h3>
                <p className="text-sm text-muted-foreground">Register your agency and start receiving qualified case leads today.</p>
                <a href="/api/login">
                  <Button className="w-full" data-testid="button-agency-signup">
                    Register Your Firm
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-semibold">Vertogogo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Vertogogo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
