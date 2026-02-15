import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, X, Plus, Upload, MapPin, Trash2, Building2, Shield } from "lucide-react";
import { Link } from "wouter";
import type { AgencyProfile } from "@shared/schema";
import { LEGAL_AREAS, PRICE_RANGES, LANGUAGES } from "@shared/schema";

interface Office {
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export default function AgencyProfileSetupPage() {
  const { toast } = useToast();
  const { data: existing } = useQuery<AgencyProfile>({
    queryKey: ["/api/agency/profile"],
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    phone: "",
    email: "",
    website: "",
    employeeCount: "1",
    specialties: [] as string[],
    logoUrl: "",
    offices: [] as Office[],
    foundedYear: "",
    languages: [] as string[],
    priceRange: "",
    barAssociationMember: false,
    responseTimeHours: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || "",
        description: existing.description || "",
        address: existing.address || "",
        city: existing.city || "",
        latitude: existing.latitude?.toString() || "",
        longitude: existing.longitude?.toString() || "",
        phone: existing.phone || "",
        email: existing.email || "",
        website: existing.website || "",
        employeeCount: existing.employeeCount?.toString() || "1",
        specialties: existing.specialties || [],
        logoUrl: existing.logoUrl || "",
        offices: (existing.offices as Office[]) || [],
        foundedYear: existing.foundedYear?.toString() || "",
        languages: existing.languages || [],
        priceRange: existing.priceRange || "",
        barAssociationMember: existing.barAssociationMember || false,
        responseTimeHours: existing.responseTimeHours?.toString() || "",
      });
      if (existing.logoUrl) {
        setLogoPreview(existing.logoUrl);
      }
    }
  }, [existing]);

  const logoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch("/api/agency/logo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data: { logoUrl: string }) => {
      setForm((prev) => ({ ...prev, logoUrl: data.logoUrl }));
      setLogoPreview(data.logoUrl);
      toast({ title: "Logotyp uppladdad" });
    },
    onError: (err: Error) => {
      toast({ title: "Fel", description: err.message, variant: "destructive" });
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        employeeCount: parseInt(form.employeeCount) || 1,
        logoUrl: form.logoUrl || null,
        offices: form.offices.length > 0 ? form.offices : null,
        foundedYear: form.foundedYear ? parseInt(form.foundedYear) : null,
        languages: form.languages.length > 0 ? form.languages : null,
        priceRange: form.priceRange || null,
        responseTimeHours: form.responseTimeHours ? parseInt(form.responseTimeHours) : null,
      };
      const res = await apiRequest("POST", "/api/agency/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profil sparad", description: "Din byråprofil har uppdaterats." });
    },
    onError: (err: Error) => {
      toast({ title: "Fel", description: err.message, variant: "destructive" });
    },
  });

  const toggleSpecialty = (specialty: string) => {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const toggleLanguage = (lang: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
      logoMutation.mutate(file);
    }
  };

  const addOffice = () => {
    setForm((prev) => ({
      ...prev,
      offices: [...prev.offices, { city: "", address: "" }],
    }));
  };

  const updateOffice = (index: number, field: keyof Office, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      offices: prev.offices.map((o, i) => (i === index ? { ...o, [field]: value } : o)),
    }));
  };

  const removeOffice = (index: number) => {
    setForm((prev) => ({
      ...prev,
      offices: prev.offices.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back-profile">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-profile-title">Byråprofil</h1>
          <p className="text-muted-foreground text-sm">Konfigurera din advokatbyrås profil</p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <div className="space-y-3">
          <Label>Logotyp</Label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-md border flex items-center justify-center overflow-hidden bg-muted">
              {logoPreview ? (
                <img src={logoPreview} alt="Logotyp" className="w-full h-full object-contain" data-testid="img-logo-preview" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => document.getElementById("logo-input")?.click()}
                disabled={logoMutation.isPending}
                data-testid="button-upload-logo"
              >
                {logoMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Laddar upp...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Ladda upp logotyp</>
                )}
              </Button>
              <input
                id="logo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG eller SVG. Max 5 MB.</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Byrånamn *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="t.ex. Andersson & Partners" data-testid="input-firm-name" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="desc">Beskrivning</Label>
            <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Berätta om din byrå för klienter..." rows={3} data-testid="input-firm-description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-postadress</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="kontakt@byra.se" data-testid="input-firm-email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+46 8 123 456" data-testid="input-firm-phone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Huvudkontor - Adress</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Gatuadress" data-testid="input-firm-address" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Huvudkontor - Stad</Label>
            <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Stockholm" data-testid="input-firm-city" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lat">Latitud</Label>
            <Input id="lat" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="59.3293" data-testid="input-firm-lat" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitud</Label>
            <Input id="lng" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="18.0686" data-testid="input-firm-lng" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Webbplats</Label>
            <Input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://www.byra.se" data-testid="input-firm-website" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employees">Antal anställda</Label>
            <Input id="employees" type="number" min="1" value={form.employeeCount} onChange={(e) => setForm({ ...form, employeeCount: e.target.value })} data-testid="input-firm-employees" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="foundedYear">Grundat år</Label>
            <Input id="foundedYear" type="number" min="1800" max="2030" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} placeholder="t.ex. 1995" data-testid="input-firm-founded-year" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responseTime">Genomsnittlig svarstid (timmar)</Label>
            <Input id="responseTime" type="number" min="1" max="168" value={form.responseTimeHours} onChange={(e) => setForm({ ...form, responseTimeHours: e.target.value })} placeholder="t.ex. 4" data-testid="input-firm-response-time" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Prisintervall</Label>
            <Select value={form.priceRange} onValueChange={(v) => setForm({ ...form, priceRange: v })}>
              <SelectTrigger data-testid="select-price-range">
                <SelectValue placeholder="Välj prisintervall" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_RANGES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Medlem i Advokatsamfundet</Label>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={form.barAssociationMember}
                onCheckedChange={(checked) => setForm({ ...form, barAssociationMember: checked })}
                data-testid="switch-bar-association"
              />
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                {form.barAssociationMember ? "Ja, vi är medlemmar" : "Nej"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Språk</Label>
          <p className="text-xs text-muted-foreground">Vilka språk kan ni erbjuda rådgivning på?</p>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map((lang) => (
              <Badge
                key={lang}
                variant={form.languages.includes(lang) ? "default" : "secondary"}
                className="cursor-pointer toggle-elevate"
                onClick={() => toggleLanguage(lang)}
                data-testid={`badge-lang-${lang.toLowerCase()}`}
              >
                {form.languages.includes(lang) ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                {lang}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Specialiseringar *</Label>
          <p className="text-xs text-muted-foreground">Välj de rättsområden din byrå arbetar med. Ni kommer bara att se ärenden som matchar era specialiseringar.</p>
          <div className="flex flex-wrap gap-1.5">
            {LEGAL_AREAS.map((s) => (
              <Badge
                key={s}
                variant={form.specialties.includes(s) ? "default" : "secondary"}
                className="cursor-pointer toggle-elevate"
                onClick={() => toggleSpecialty(s)}
                data-testid={`badge-specialty-${s.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")}`}
              >
                {form.specialties.includes(s) ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <Label>Ytterligare kontor</Label>
              <p className="text-xs text-muted-foreground">Lägg till fler orter där byrån finns representerad</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" onClick={addOffice} data-testid="button-add-office">
              <Plus className="h-4 w-4 mr-1" /> Lägg till kontor
            </Button>
          </div>
          {form.offices.map((office, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Kontor {i + 1}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeOffice(i)} data-testid={`button-remove-office-${i}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Stad *</Label>
                  <Input
                    value={office.city}
                    onChange={(e) => updateOffice(i, "city", e.target.value)}
                    placeholder="Göteborg"
                    data-testid={`input-office-city-${i}`}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Adress</Label>
                  <Input
                    value={office.address}
                    onChange={(e) => updateOffice(i, "address", e.target.value)}
                    placeholder="Gatuadress"
                    data-testid={`input-office-address-${i}`}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          className="w-full rounded-full"
          disabled={!form.name || form.specialties.length === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
          data-testid="button-save-profile"
        >
          {mutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sparar...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Spara profil</>
          )}
        </Button>
        {form.specialties.length === 0 && (
          <p className="text-xs text-destructive text-center">Välj minst en specialisering för att kunna spara.</p>
        )}
      </Card>
    </div>
  );
}
