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
import { ArrowLeft, Loader2, Save, X, Plus } from "lucide-react";
import { Link } from "wouter";
import type { AgencyProfile } from "@shared/schema";

const SPECIALTY_OPTIONS = [
  "Corporate Law", "Criminal Law", "Family Law", "Employment Law",
  "Immigration Law", "Real Estate", "Tax Law", "Intellectual Property",
  "Environmental Law", "Personal Injury", "Bankruptcy", "Civil Litigation",
  "Contract Law", "Insurance Law", "Maritime Law",
];

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
  });

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
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        employeeCount: parseInt(form.employeeCount) || 1,
      };
      const res = await apiRequest("POST", "/api/agency/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profile saved", description: "Your agency profile has been updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back-profile">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-profile-title">Agency Profile</h1>
          <p className="text-muted-foreground text-sm">Set up your law firm's profile</p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Firm Name *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Anderson & Associates" data-testid="input-firm-name" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell clients about your firm..." rows={3} data-testid="input-firm-description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Business Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@firm.com" data-testid="input-firm-email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+46 8 123 456" data-testid="input-firm-phone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" data-testid="input-firm-address" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Stockholm" data-testid="input-firm-city" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude</Label>
            <Input id="lat" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="59.3293" data-testid="input-firm-lat" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude</Label>
            <Input id="lng" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="18.0686" data-testid="input-firm-lng" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://www.firm.se" data-testid="input-firm-website" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employees">Number of Employees</Label>
            <Input id="employees" type="number" min="1" value={form.employeeCount} onChange={(e) => setForm({ ...form, employeeCount: e.target.value })} data-testid="input-firm-employees" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Specialties</Label>
          <div className="flex flex-wrap gap-1.5">
            {SPECIALTY_OPTIONS.map((s) => (
              <Badge
                key={s}
                variant={form.specialties.includes(s) ? "default" : "secondary"}
                className="cursor-pointer toggle-elevate"
                onClick={() => toggleSpecialty(s)}
                data-testid={`badge-specialty-${s.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {form.specialties.includes(s) ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          disabled={!form.name || mutation.isPending}
          onClick={() => mutation.mutate()}
          data-testid="button-save-profile"
        >
          {mutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Save Profile</>
          )}
        </Button>
      </Card>
    </div>
  );
}
