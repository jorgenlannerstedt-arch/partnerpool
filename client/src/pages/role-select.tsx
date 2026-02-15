import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Building2, ArrowRight, Mail, AlertCircle } from "lucide-react";
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

export default function RoleSelectPage() {
  const [selected, setSelected] = useState<"client" | "agency" | null>(null);
  const [agencyEmail, setAgencyEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const isAgencyReg = localStorage.getItem("vertigogo_agency_registration");
    const isClientReg = localStorage.getItem("vertigogo_client_registration");
    const storedEmail = localStorage.getItem("vertigogo_agency_email");
    if (isAgencyReg === "true") {
      setSelected("agency");
      if (storedEmail) setAgencyEmail(storedEmail);
    } else if (isClientReg === "true") {
      setSelected("client");
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await apiRequest("POST", "/api/profile/role", {
        role,
        ...(role === "agency" ? { agencyEmail } : {}),
      });
      return res.json();
    },
    onSuccess: () => {
      localStorage.removeItem("vertigogo_agency_registration");
      localStorage.removeItem("vertigogo_agency_email");
      localStorage.removeItem("vertigogo_client_registration");
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (err: Error) => {
      setEmailError(err.message || "Ett fel uppstod. Försök igen.");
    },
  });

  const handleContinue = () => {
    if (!selected) return;
    setEmailError("");

    if (selected === "agency") {
      if (!agencyEmail.trim()) {
        setEmailError("Ange din byrås e-postadress.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agencyEmail)) {
        setEmailError("Ange en giltig e-postadress.");
        return;
      }
      if (!isBusinessEmail(agencyEmail)) {
        setEmailError("Vi accepterar bara företagsmailadresser (inte Gmail, Hotmail etc.).");
        return;
      }
    }

    mutation.mutate(selected);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src={logoSrc} alt="Vertigogo" className="h-7" />
          </div>
          <h1 className="text-3xl font-bold font-serif">Välkommen! Hur vill du använda Vertigogo?</h1>
          <p className="text-muted-foreground">Välj din roll för att komma igång. Det hjälper oss att anpassa din upplevelse.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card
            className={`p-6 cursor-pointer transition-all hover-elevate ${selected === "client" ? "ring-2 ring-primary" : ""}`}
            onClick={() => { setSelected("client"); setEmailError(""); }}
            data-testid="card-role-client"
          >
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Jag är klient</h3>
                <p className="text-sm text-muted-foreground">Jag behöver juridisk hjälp och vill hitta rätt advokatbyrå för mitt ärende.</p>
              </div>
              <div className="text-xs text-primary font-medium">Alltid gratis</div>
            </div>
          </Card>

          <Card
            className={`p-6 cursor-pointer transition-all hover-elevate ${selected === "agency" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelected("agency")}
            data-testid="card-role-agency"
          >
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Jag är advokatbyrå</h3>
                <p className="text-sm text-muted-foreground">Jag vill ta emot kvalificerade ärenden och utveckla min verksamhet.</p>
              </div>
              <div className="text-xs text-muted-foreground font-medium">995 SEK/månad</div>
            </div>
          </Card>
        </div>

        {selected === "agency" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="agency-email-role">Företagets e-postadress</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="agency-email-role"
                  type="email"
                  value={agencyEmail}
                  onChange={(e) => { setAgencyEmail(e.target.value); setEmailError(""); }}
                  placeholder="namn@advokatbyran.se"
                  className="pl-9"
                  data-testid="input-agency-email-role"
                />
              </div>
              {emailError && (
                <div className="flex items-start gap-2 text-destructive text-sm" data-testid="text-role-email-error">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Vi accepterar bara företagsmailadresser (inte Gmail, Hotmail etc.).
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            className="rounded-full px-8"
            disabled={!selected || mutation.isPending}
            onClick={handleContinue}
            data-testid="button-continue-role"
          >
            {mutation.isPending ? "Konfigurerar..." : "Fortsätt"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
