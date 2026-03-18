import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, FileText, MessageCircle, ArrowRight, CheckCircle, Lock, Zap, Building2, ChevronRight } from "lucide-react";
import logoSrc from "@assets/vertigogo-logo.svg";

const steps = [
  {
    num: "1",
    title: "Dokument laddas upp och analyseras",
    desc: <>Ladda upp ditt juridiska dokument från <a href="https://www.vertigogo.se" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">www.vertigogo.se</a>. Vår AI extraherar automatiskt nyckelfakta och anonymiserar all personlig information.</>,
    icon: FileText,
  },
  {
    num: "2",
    title: "Matchas med rätt byrå",
    desc: "Bläddra bland kvalificerade advokatbyråer eller låt vår matchning hitta rätt specialisering för ditt ärende.",
    icon: Users,
  },
  {
    num: "3",
    title: "Kommunicera säkert",
    desc: "Kommunicera direkt med intresserade advokatbyråer genom vårt krypterade meddelandesystem.",
    icon: MessageCircle,
  },
];

const securityFeatures = [
  { icon: Lock, title: "Ingen datalagring", desc: "Vi sparar inga konversationer eller historik från våra användare" },
  { icon: Shield, title: "Ingen AI-träning", desc: "Vi tränar aldrig våra AI-modeller på användardata eller innehåll" },
  { icon: Zap, title: "HTTPS-kryptering", desc: "All kommunikation är säkert krypterad med modern TLS" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f3f4f8]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b" data-testid="nav-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-2.5">
              <img src={logoSrc} alt="Vertigogo" className="h-6" data-testid="text-logo" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground" data-testid="link-how-it-works">Hur det fungerar</a>
              <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground" data-testid="link-features">Funktioner</a>
              <a href="#for-agencies" className="text-sm text-muted-foreground transition-colors hover:text-foreground" data-testid="link-for-agencies">För byråer</a>
              <a href="#security" className="text-sm text-muted-foreground transition-colors hover:text-foreground" data-testid="link-security">Säkerhet</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="/api/demo-login">
                <Button variant="outline" className="rounded-full" data-testid="button-demo-login">Demo</Button>
              </a>
              <a href="/login">
                <Button variant="outline" className="rounded-full" data-testid="button-login">Logga in</Button>
              </a>
              <a href="/login">
                <Button className="rounded-full" data-testid="button-get-started">
                  Kom igång
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>
      <section className="relative pt-32 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{backgroundImage: "url('/dude.webp')", backgroundSize: "cover", backgroundPosition: "center"}}>
        <div className="absolute inset-0 bg-white/30" />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl text-left space-y-8">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Alltid gratis för klienter
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-normal leading-[1.85] tracking-tight" data-testid="text-hero-heading">
              Hitta rätt juridisk <br />partner för ditt ärende
            </h1>
            <p className="text-[17px] text-muted-foreground max-w-2xl">
              Vertigogo kopplar dig samman med kvalificerade advokatbyråer genom AI-driven ärendeanalys. Ladda upp, bli matchad, kommunicera säkert.
            </p>
            <div className="flex flex-wrap items-center justify-start gap-4 pt-2">
              <a href="/login">
                <Button size="lg" className="rounded-full px-8 text-base" data-testid="button-hero-cta">
                  Starta gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="rounded-full px-8 text-base" data-testid="button-hero-learn">
                  Läs mer
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-6 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Inget kreditkort krävs
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                AI-driven matchning
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Säkert och konfidentiellt
              </span>
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Hur det fungerar</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold">Från dokument till juridisk hjälp</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              En smidig process från dokumentuppladdning till att hitta rätt juridisk representation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <Card key={step.num} className="p-8 hover-elevate group">
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                      {step.num}
                    </div>
                    <step.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f3f4f8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Vertigogo-plattformen</p>
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold">En komplett lösning för att hitta juridisk hjälp</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vertigogo analyserar dina dokument med AI, skapar anonymiserade ärendebeskrivningar och kopplar dig med rätt advokatbyrå. Allt i en säker, lättanvänd plattform.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  "Automatisk anonymisering av personuppgifter",
                  "AI-genererade ärendesammanfattningar",
                  "Sök bland kvalificerade partnerbyråer",
                  "Krypterad meddelandehantering",
                  "Helt gratis för privatpersoner",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-semibold">AI-analys av ärenden</h4>
                    <p className="text-sm text-muted-foreground">Ladda upp dina dokument och vår AI skapar en tydlig, anonymiserad ärendebeskrivning som advokatbyråer kan granska.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-semibold">Granskade partnerbyråer</h4>
                    <p className="text-sm text-muted-foreground">Bläddra bland kvalificerade advokatbyråer med detaljerade profiler, specialiseringar och platser på karta.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-semibold">Säker meddelandehantering</h4>
                    <p className="text-sm text-muted-foreground">Kommunicera direkt med intresserade advokatbyråer genom vårt krypterade meddelandesystem i appen.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <section id="for-agencies" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex items-center justify-center">
              <Card className="p-8 max-w-sm w-full space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold">Vertigogo Professional</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">995</span>
                    <span className="text-muted-foreground">SEK/mån</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Avsluta när som helst</p>
                </div>
                <div className="space-y-3 pt-2 border-t">
                  {[
                    "AI-analyserade ärendebeskrivningar",
                    "Filtrera ärenden efter specialisering",
                    "Direktmeddelanden med klienter",
                    "Synlighet i partnerportalen",
                    "Prioriterade ärendenotifikationer",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <a href="/register/agency">
                  <Button className="w-full rounded-full pt-[12px] pb-[12px] mt-[26px] mb-[26px]" data-testid="button-agency-signup">
                    Registrera din byrå
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </Card>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">För advokatbyråer</p>
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold">Öka lönsamheten med nya klienter till din byrå</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sluta leta efter rätt klienter. Via Vertigogo filtrerar vi fram de skarpa casen och slussar dem vidare till er lokala verksamhet. Som partner får ni exklusiv tillgång till försäkringsfinansierade ärenden som är redo för hantering.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Tillgång till AI-analyserade ärendebeskrivningar",
                  "Filtrera ärenden efter specialisering och plats",
                  "Kommunicera direkt med potentiella klienter",
                  "Bygg din byrås närvaro online",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f3f4f8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Säkerhet</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold">Vi tar din säkerhet på allvar</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Säkerhet i världsklass för din juridiska data, skyddad med avancerad kryptering och full GDPR-efterlevnad.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {securityFeatures.map((feature) => (
              <Card key={feature.title} className="text-center space-y-4 p-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold">Redo att hitta rätt juridisk hjälp?</h2>
          <p className="text-muted-foreground text-lg">
            Skapa ett konto idag och ladda upp ditt första ärende. Det är helt gratis och tar bara några minuter.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="/login">
              <Button size="lg" className="rounded-full px-8 text-base" data-testid="button-cta-bottom">
                Kom igång gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>
      <footer className="border-t py-3 px-4 sm:px-6 lg:px-8 bg-white" data-testid="footer">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Vertigo Intel AB
          </p>
          <div className="flex items-center gap-6">
            <a href="/support" className="text-xs text-muted-foreground transition-colors hover:text-foreground" data-testid="link-support">Support</a>
            <a href="/integritetspolicy" className="text-xs text-muted-foreground transition-colors hover:text-foreground" data-testid="link-privacy-policy">Integritetspolicy</a>
            <a href="/datapolicy" className="text-xs text-muted-foreground transition-colors hover:text-foreground" data-testid="link-data-policy">Datapolicy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
