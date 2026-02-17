import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { User, Mail, Shield, Bell, Trash2, AlertTriangle, ArrowLeft, Phone, Check, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsData {
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    createdAt: string | null;
  } | null;
  profile: {
    id: number;
    userId: string;
    role: string;
    onboardingComplete: boolean | null;
    newsletterOptIn: boolean | null;
    phone: string | null;
  };
}

export default function SettingsPage() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");

  const { data, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  const phoneMutation = useMutation({
    mutationFn: async (value: string) => {
      await apiRequest("PATCH", "/api/settings", { phone: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setEditingPhone(false);
      toast({ title: "Telefonnummer sparat" });
    },
    onError: () => {
      toast({ title: "Kunde inte spara telefonnummer", variant: "destructive" });
    },
  });

  const newsletterMutation = useMutation({
    mutationFn: async (value: boolean) => {
      await apiRequest("PATCH", "/api/settings", { newsletterOptIn: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Inställningar sparade" });
    },
    onError: () => {
      toast({ title: "Kunde inte spara inställningar", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/account");
    },
    onSuccess: () => {
      toast({ title: "Kontot har raderats" });
      setTimeout(() => logout(), 500);
    },
    onError: () => {
      toast({ title: "Kunde inte radera kontot", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const user = data?.user;
  const profile = data?.profile;
  const roleLabel = profile?.role === "agency" ? "Byrå" : "Klient";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-settings-title">Inställningar</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">Hantera ditt konto och dina preferenser</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold font-serif">Profil</h2>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Namn</span>
            <span className="text-sm font-medium" data-testid="text-settings-name">
              {user?.firstName || ""} {user?.lastName || ""}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              <Mail className="h-4 w-4 inline mr-1" />
              E-post
            </span>
            <span className="text-sm font-medium" data-testid="text-settings-email">
              {user?.email || "Ingen e-post angiven"}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              <Phone className="h-4 w-4 inline mr-1" />
              Telefon
            </span>
            {editingPhone ? (
              <div className="flex items-center gap-1">
                <Input
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  placeholder="070-123 45 67"
                  className="h-8 w-40 text-sm"
                  data-testid="input-phone"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => phoneMutation.mutate(phoneValue)}
                  disabled={phoneMutation.isPending}
                  data-testid="button-save-phone"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingPhone(false)}
                  data-testid="button-cancel-phone"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" data-testid="text-settings-phone">
                  {profile?.phone || "Inget telefonnummer"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs h-7"
                  onClick={() => {
                    setPhoneValue(profile?.phone || "");
                    setEditingPhone(true);
                  }}
                  data-testid="button-edit-phone"
                >
                  Ändra
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              <Shield className="h-4 w-4 inline mr-1" />
              Roll
            </span>
            <span className="text-sm font-medium" data-testid="text-settings-role">{roleLabel}</span>
          </div>
          {memberSince && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Medlem sedan</span>
              <span className="text-sm font-medium" data-testid="text-settings-member-since">{memberSince}</span>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold font-serif">Nyhetsbrev</h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="newsletter-toggle" className="text-sm font-medium">
              Prenumerera på nyhetsbrev
            </Label>
            <p className="text-xs text-muted-foreground">
              Få uppdateringar om nya funktioner och juridiska nyheter
            </p>
          </div>
          <Switch
            id="newsletter-toggle"
            checked={profile?.newsletterOptIn ?? false}
            onCheckedChange={(checked) => newsletterMutation.mutate(checked)}
            disabled={newsletterMutation.isPending}
            data-testid="switch-newsletter"
          />
        </div>
      </Card>

      <Card className="p-6 border-destructive/20">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold font-serif text-destructive">Radera konto</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Genom att radera ditt konto tas alla dina ärenden, meddelanden och personuppgifter bort permanent. Denna åtgärd kan inte ångras.
        </p>
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" data-testid="button-delete-account">
              <Trash2 className="h-4 w-4 mr-2" />
              Radera mitt konto
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Bekräfta radering
              </AlertDialogTitle>
              <AlertDialogDescription>
                Är du säker på att du vill radera ditt konto? Alla dina ärenden, meddelanden och personuppgifter raderas permanent. Denna åtgärd kan inte ångras.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Avbryt</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                className="bg-destructive text-destructive-foreground"
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Raderar..." : "Ja, radera mitt konto"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}
