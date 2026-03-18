import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import logoSrc from "@assets/vertigogo-logo.svg";

function handleLogin() {
  localStorage.setItem("vertigogo_client_registration", "true");
  window.location.href = "/api/login";
}

export default function ClientLoginPage() {
  return (
    <div className="min-h-screen bg-[#f3f4f8] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center mb-6">
            <img src={logoSrc} alt="Vertigogo" className="h-7" />
          </div>
          <h1 className="text-3xl font-bold font-serif" data-testid="text-client-login-heading">
            Logga in eller skapa konto
          </h1>
          <p className="text-muted-foreground text-[17px]">
            Helt gratis. Hitta rätt juridisk partner för ditt ärende.
          </p>
        </div>

        <Card className="p-8 space-y-4">
          <Button
            variant="outline"
            className="w-full rounded-full justify-center gap-3"
            onClick={handleLogin}
            data-testid="button-login-google"
          >
            <SiGoogle className="h-4 w-4" />
            Fortsätt med Google
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">eller</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-full justify-center gap-3"
            onClick={handleLogin}
            data-testid="button-login-email"
          >
            <Mail className="h-4 w-4" />
            Fortsätt med e-post
          </Button>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Genom att fortsätta godkänner du våra användarvillkor och integritetspolicy.
          </p>
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">Är du advokatbyrå?</p>
            <a href="/register/agency" className="inline-block text-sm font-medium text-primary border border-primary/40 rounded-full px-5 py-2 hover:bg-primary/5 transition-colors" data-testid="link-register-agency">
              Registrera din advokatbyrå
            </a>
          </div>
          <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mt-4" data-testid="link-back-home">
            <ArrowLeft className="h-3.5 w-3.5" />
            Tillbaka till startsidan
          </a>
        </div>
      </div>
    </div>
  );
}
