import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, FileText, Loader2, ArrowLeft, Sparkles, ShieldCheck, CircleDollarSign, Eye, Mail, Phone } from "lucide-react";
import { Link } from "wouter";
import { INSURANCE_TYPES, AMOUNT_RANGES } from "@shared/schema";

export default function NewCasePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [insuranceType, setInsuranceType] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [legalProtectionApplied, setLegalProtectionApplied] = useState<string>("");
  const [legalProtectionGranted, setLegalProtectionGranted] = useState<string>("");
  const [needsLegalProtectionHelp, setNeedsLegalProtectionHelp] = useState<string>("");

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      if (file) formData.append("pdf", file);
      if (insuranceType) formData.append("insuranceType", insuranceType);
      if (estimatedAmount) formData.append("estimatedAmount", estimatedAmount);
      if (contactEmail.trim()) formData.append("contactEmail", contactEmail.trim());
      if (contactPhone.trim()) formData.append("contactPhone", contactPhone.trim());
      if (legalProtectionApplied) formData.append("legalProtectionApplied", legalProtectionApplied);
      if (legalProtectionGranted) formData.append("legalProtectionGranted", legalProtectionGranted);
      if (needsLegalProtectionHelp) formData.append("needsLegalProtectionHelp", needsLegalProtectionHelp);

      const res = await fetch("/api/cases", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({ title: "Ärende skapat", description: "Ditt ärende har skickats in och analyseras." });
      navigate(`/cases/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Fel", description: err.message, variant: "destructive" });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      toast({ title: "Ogiltig fil", description: "Vänligen ladda upp en PDF-fil.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-new-case-title">Nytt ärende</h1>
          <p className="text-muted-foreground text-sm">Beskriv ditt ärende och ladda upp relevanta dokument.</p>
        </div>
      </div>

      <Card className="p-5 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Förhandsgranskning av Vertigogo</p>
            <p className="text-xs text-muted-foreground mt-1">
              Alla uppladdade dokument förhandsgranskas av Vertigogo innan de delas med advokatbyråer.
              Personlig information anonymiseras automatiskt av vår AI. Du kan känna dig trygg med att
              dina uppgifter hanteras konfidentiellt.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Ärendetitel *</Label>
          <Input
            id="title"
            placeholder="t.ex. Arbetsrättstvist, Fastighetstvist"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-case-title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Ytterligare detaljer (valfritt)</Label>
          <Textarea
            id="description"
            placeholder="Eventuell extra information om ditt ärende..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            data-testid="input-case-description"
          />
        </div>

        <div className="space-y-2">
          <Label>Ladda upp dokument (PDF)</Label>
          <div
            className={`border-2 border-dashed rounded-md p-8 text-center transition-colors cursor-pointer ${
              dragOver
                ? "border-primary bg-primary/5"
                : file
                ? "border-primary/50 bg-primary/5"
                : "border-border"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            data-testid="dropzone-pdf"
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium" data-testid="text-file-name">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Dra och släpp en PDF här, eller klicka för att bläddra
                </p>
                <p className="text-xs text-muted-foreground">
                  Dokumentet förhandsgranskas av Vertigogo innan det delas
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-semibold">Har du försäkring?</Label>
          </div>
          <RadioGroup value={insuranceType} onValueChange={(v) => {
            setInsuranceType(v);
            if (v !== "Hemförsäkring" && v !== "Företagsförsäkring") {
              setLegalProtectionApplied("");
              setLegalProtectionGranted("");
              setNeedsLegalProtectionHelp("");
            }
          }} data-testid="radio-insurance-type">
            {INSURANCE_TYPES.map((type) => {
              const clientLabel = type === "Klient betalar själv" ? "Jag betalar själv" : type === "Ingen försäkring" ? "Nej, jag har ingen försäkring" : type;
              return (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={`insurance-${type}`} data-testid={`radio-insurance-${type.toLowerCase().replace(/\s+/g, "-")}`} />
                  <Label htmlFor={`insurance-${type}`} className="text-sm font-normal cursor-pointer">{clientLabel}</Label>
                </div>
              );
            })}
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Rättsskydd ingår ofta i hem- eller företagsförsäkringen och kan täcka juridiska kostnader.
          </p>
        </div>

        {(insuranceType === "Hemförsäkring" || insuranceType === "Företagsförsäkring") && (
          <div className="space-y-4 pl-4 border-l-2 border-primary/20">
            <div className="space-y-3">
              <Label>Har du gjort en rättsskyddsansökan till ditt försäkringsbolag?</Label>
              <RadioGroup value={legalProtectionApplied} onValueChange={(v) => {
                setLegalProtectionApplied(v);
                if (v === "yes") {
                  setNeedsLegalProtectionHelp("");
                } else {
                  setLegalProtectionGranted("");
                }
              }} data-testid="radio-legal-protection-applied">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="lp-yes" data-testid="radio-lp-applied-yes" />
                  <Label htmlFor="lp-yes" className="text-sm font-normal cursor-pointer">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="lp-no" data-testid="radio-lp-applied-no" />
                  <Label htmlFor="lp-no" className="text-sm font-normal cursor-pointer">Nej</Label>
                </div>
              </RadioGroup>
            </div>

            {legalProtectionApplied === "yes" && (
              <div className="space-y-3">
                <Label>Är rättsskyddsansökan beviljad?</Label>
                <RadioGroup value={legalProtectionGranted} onValueChange={setLegalProtectionGranted} data-testid="radio-legal-protection-granted">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="lpg-yes" data-testid="radio-lp-granted-yes" />
                    <Label htmlFor="lpg-yes" className="text-sm font-normal cursor-pointer">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="lpg-no" data-testid="radio-lp-granted-no" />
                    <Label htmlFor="lpg-no" className="text-sm font-normal cursor-pointer">Nej</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="lpg-pending" data-testid="radio-lp-granted-pending" />
                    <Label htmlFor="lpg-pending" className="text-sm font-normal cursor-pointer">Inväntar svar</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {legalProtectionApplied === "no" && (
              <div className="space-y-3">
                <Label>Behöver du hjälp med att skriva en rättsskyddsansökan?</Label>
                <RadioGroup value={needsLegalProtectionHelp} onValueChange={setNeedsLegalProtectionHelp} data-testid="radio-needs-lp-help">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="lph-yes" data-testid="radio-lp-help-yes" />
                    <Label htmlFor="lph-yes" className="text-sm font-normal cursor-pointer">Ja, jag behöver hjälp</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="lph-no" data-testid="radio-lp-help-no" />
                    <Label htmlFor="lph-no" className="text-sm font-normal cursor-pointer">Nej</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            <Label>Ungefärligt belopp</Label>
          </div>
          <Select value={estimatedAmount} onValueChange={setEstimatedAmount}>
            <SelectTrigger data-testid="select-amount">
              <SelectValue placeholder="Välj beloppsklass" />
            </SelectTrigger>
            <SelectContent>
              {AMOUNT_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Ange ett ungefärligt tvistebelopp eller värde.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Label>Kontaktuppgifter (valfritt)</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Ange din e-post och/eller telefonnummer om du vill bli notifierad när en byrå svarar på ditt ärende.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail" className="text-xs text-muted-foreground">E-postadress</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="din@email.se"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                data-testid="input-contact-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone" className="text-xs text-muted-foreground">Telefonnummer</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="070-123 45 67"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                data-testid="input-contact-phone"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-md bg-primary/5">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Vår AI analyserar ditt dokument, anonymiserar personlig information och skapar en ärendebeskrivning.
            Ärendet matchas sedan automatiskt mot advokatbyråer med rätt kompetens.
          </p>
        </div>

        <Button
          className="w-full rounded-full"
          size="lg"
          disabled={!title || uploadMutation.isPending}
          onClick={() => uploadMutation.mutate()}
          data-testid="button-submit-case"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyserar dokument...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analysera ärende
            </>
          )}
        </Button>
      </Card>

      {uploadMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" data-testid="overlay-ai-loading">
          <Card className="p-8 max-w-sm w-full mx-4 text-center space-y-5">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg font-serif">AI analyserar ditt dokument</h3>
              <p className="text-sm text-muted-foreground">
                Vår AI läser igenom dokumentet, anonymiserar personuppgifter och skapar en sammanfattning. Det kan ta upp till 30 sekunder.
              </p>
            </div>
            <div className="flex justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
