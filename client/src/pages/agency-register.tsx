import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Building2, Mail, AlertCircle } from "lucide-react";
import logoSrc from "@assets/vertigogo-logo.svg";

const BLOCKED_DOMAINS = [
  "gmail.com", "googlemail.com",
  "hotmail.com", "hotmail.se", "hotmail.co.uk",
  "outlook.com", "outlook.se",
  "live.com", "live.se",
  "msn.com",
  "yahoo.com", "yahoo.se", "yahoo.co.uk",
  "ymail.com",
  "aol.com",
  "icloud.com", "me.com", "mac.com",
  "protonmail.com", "proton.me",
  "mail.com",
  "zoho.com",
  "gmx.com", "gmx.se",
  "tutanota.com", "tuta.io",
  "fastmail.com",
  "hey.com",
  "pm.me",
  "mailbox.org",
];

function isBusinessEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return !BLOCKED_DOMAINS.includes(domain);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AgencyRegisterPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ange din e-postadress.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Ange en giltig e-postadress.");
      return;
    }

    if (!isBusinessEmail(email)) {
      setError("Vi accepterar bara företagsmailadresser. Vänligen använd din byrås e-postadress (inte Gmail, Hotmail etc.).");
      return;
    }

    localStorage.setItem("vertigogo_agency_email", email);
    localStorage.setItem("vertigogo_agency_registration", "true");
    setSubmitted(true);
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logoSrc} alt="Vertigogo" className="h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif" data-testid="text-register-heading">
            Registrera din advokatbyrå
          </h1>
          <p className="text-muted-foreground text-sm">
            Ange din byrås e-postadress för att komma igång. Vi accepterar bara företagsmailadresser.
          </p>
        </div>

        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Vertigogo Professional</p>
              <p className="text-xs text-muted-foreground">995 SEK/mån - Avsluta när som helst</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agency-email">Företagets e-postadress</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="agency-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="namn@advokatbyran.se"
                  className="pl-9"
                  data-testid="input-agency-email"
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 text-destructive text-sm" data-testid="text-email-error">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Gmail, Hotmail, Yahoo och andra gratistjänster accepteras inte.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={submitted}
              data-testid="button-register-continue"
            >
              {submitted ? "Omdirigerar..." : "Fortsätt"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Tillbaka till startsidan
          </a>
        </div>
      </div>
    </div>
  );
}
