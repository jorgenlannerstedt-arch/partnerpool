import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DataPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f3f4f8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="rounded-full mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Tillbaka
          </Button>
        </Link>

        <h1 className="text-3xl font-bold font-serif mb-6" data-testid="text-data-policy-title">Datapolicy</h1>

        <div className="bg-white rounded-md p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Datalagring</h2>
            <p>Alla data lagras säkert inom EU/EES i enlighet med GDPR. Vi använder krypterade anslutningar (SSL/TLS) för all dataöverföring.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Cookies</h2>
            <p>Vertigogo använder nödvändiga cookies för att hantera inloggning och sessioner. Vi använder inga spårningscookies eller tredjepartscookies för marknadsföring.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Dokumenthantering</h2>
            <p>Uppladdade dokument:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lagras krypterat och är endast tillgängliga för dig och Vertigogos system</li>
              <li>Analyseras av AI för att skapa anonymiserade ärendesammanfattningar</li>
              <li>Delas aldrig i sin helhet med advokatbyråer</li>
              <li>Kan raderas av dig när som helst genom att ta bort ditt ärende</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Anonymisering</h2>
            <p>Alla ärendesammanfattningar som delas med advokatbyråer genomgår en automatisk anonymiseringsprocess. Personnamn, adresser och andra identifierande uppgifter ersätts med generiska beteckningar som [Klienten], [Motparten] etc.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Meddelandedata</h2>
            <p>Meddelanden som skickas via plattformen lagras för att möjliggöra kommunikation mellan klienter och advokatbyråer. Meddelanden krypteras under överföring och är endast synliga för avsändare och mottagare.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Radering av data</h2>
            <p>Du kan när som helst begära radering av ditt konto och all tillhörande data. Vid kontoradering:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Alla personuppgifter raderas</li>
              <li>Uppladdade dokument tas bort</li>
              <li>Ärenden och meddelanden raderas</li>
              <li>Processen är oåterkallelig</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Tredjepartstjänster</h2>
            <p>Vi använder följande tredjepartstjänster för att tillhandahålla vår plattform:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Anthropic (Claude) - AI-analys av dokument</li>
              <li>Stripe - Betalningshantering för advokatbyråer</li>
              <li>Resend - E-postnotifieringar</li>
            </ul>
            <p>Varje tredjepartstjänst har sina egna datapolicyer och uppfyller GDPR-kraven.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. Kontakt</h2>
            <p>För frågor om vår datahantering, kontakta oss på info@vertigointel.se.</p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t">Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}</p>
        </div>
      </div>
    </div>
  );
}
