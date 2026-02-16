import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f3f4f8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="rounded-full mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Tillbaka
          </Button>
        </Link>

        <h1 className="text-3xl font-bold font-serif mb-6" data-testid="text-privacy-title">Integritetspolicy</h1>

        <div className="bg-white rounded-md p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Inledning</h2>
            <p>Vertigogo, en tjänst från Vertigo Intel AB, värnar om din personliga integritet. Denna integritetspolicy beskriver hur vi samlar in, använder och skyddar dina personuppgifter när du använder vår plattform.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Personuppgiftsansvarig</h2>
            <p>Vertigo Intel AB är personuppgiftsansvarig för behandlingen av dina personuppgifter. Kontakta oss på info@vertigointel.se för frågor om hur vi hanterar dina uppgifter.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Vilka uppgifter vi samlar in</h2>
            <p>Vi samlar in följande personuppgifter:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Namn och e-postadress vid registrering</li>
              <li>Telefonnummer (om du väljer att ange det)</li>
              <li>Dokument och ärendeinformation som du laddar upp</li>
              <li>Meddelanden som skickas via plattformen</li>
              <li>Teknisk information som IP-adress och webbläsartyp</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Hur vi använder dina uppgifter</h2>
            <p>Vi använder dina personuppgifter för att:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tillhandahålla och förbättra vår tjänst</li>
              <li>Matcha ditt ärende med relevanta advokatbyråer</li>
              <li>Kommunicera med dig om din användning av tjänsten</li>
              <li>Skicka nyhetsbrev (om du har valt att prenumerera)</li>
              <li>Uppfylla rättsliga skyldigheter</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. AI-behandling av dokument</h2>
            <p>Uppladdade dokument analyseras av AI (artificiell intelligens) för att skapa anonymiserade sammanfattningar av ditt ärende. Alla personuppgifter i dokumenten anonymiseras innan de delas med advokatbyråer.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Delning av uppgifter</h2>
            <p>Vi delar aldrig dina personuppgifter med tredje part utan ditt samtycke, med undantag för vad som krävs enligt lag. Anonymiserade ärendesammanfattningar delas med advokatbyråer som matchar ditt rättsområde.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Dina rättigheter</h2>
            <p>Enligt GDPR har du rätt att:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Begära tillgång till dina personuppgifter</li>
              <li>Begära rättelse av felaktiga uppgifter</li>
              <li>Begära radering av dina uppgifter</li>
              <li>Invända mot behandling</li>
              <li>Begära begränsning av behandling</li>
              <li>Begära dataportabilitet</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. Kontakt</h2>
            <p>Om du har frågor om denna integritetspolicy eller vill utöva dina rättigheter, kontakta oss på info@vertigointel.se.</p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t">Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}</p>
        </div>
      </div>
    </div>
  );
}
