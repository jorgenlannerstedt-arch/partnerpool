import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, MessageCircle, Settings, CreditCard, AlertCircle, CheckCircle, Scale, ShieldCheck, Check, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Case, AgencyProfile } from "@shared/schema";

type CaseWithInquiry = Case & { hasInquired?: boolean };

export default function AgencyDashboard() {
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery<AgencyProfile>({
    queryKey: ["/api/agency/profile"],
  });

  const { data: availableCases, isLoading: casesLoading } = useQuery<CaseWithInquiry[]>({
    queryKey: ["/api/agency/cases"],
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
  });

  const dismissMutation = useMutation({
    mutationFn: async (caseId: number) => {
      await apiRequest("POST", `/api/agency/cases/${caseId}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/cases"] });
      toast({ title: "Ärende borttaget", description: "Ärendet visas inte längre i din lista." });
    },
    onError: () => {
      toast({ title: "Fel", description: "Kunde inte ta bort ärendet.", variant: "destructive" });
    },
  });

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4"><Skeleton className="h-16" /></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-semibold">Fyll i din profil</h2>
        <p className="text-muted-foreground">Konfigurera din byråprofil för att börja ta emot ärenden.</p>
        <Link href="/agency/profile">
          <Button className="rounded-full" data-testid="button-setup-profile">Konfigurera profil</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-agency-dashboard-title">Byråpanel</h1>
          <p className="text-muted-foreground text-sm">Välkommen tillbaka, {profile.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={profile.subscriptionActive ? "default" : "secondary"}>
            {profile.subscriptionActive ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> Aktivt abonnemang</>
            ) : (
              <><AlertCircle className="h-3 w-3 mr-1" /> Inget abonnemang</>
            )}
          </Badge>
        </div>
      </div>

      {!profile.subscriptionActive && (
        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-sm">Prenumerera för att se ärenden</p>
                <p className="text-xs text-muted-foreground">995 SEK/månad - Full tillgång till klientärenden och meddelanden</p>
              </div>
            </div>
            <Link href="/agency/subscribe">
              <Button size="sm" className="rounded-full" data-testid="button-subscribe">Prenumerera nu</Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tillgängliga ärenden</p>
              <p className="text-2xl font-bold" data-testid="text-available-cases">
                {casesLoading ? "..." : availableCases?.length || 0}
              </p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Link href="/messages">
          <Card className="p-4 hover-elevate cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Meddelanden</p>
                <p className="text-2xl font-bold" data-testid="text-agency-messages">
                  {unreadCount?.count || 0} olästa
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        </Link>
        <Link href="/agency/profile">
          <Card className="p-4 hover-elevate cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Profil</p>
                <p className="text-2xl font-bold text-primary" data-testid="text-edit-profile">Redigera</p>
              </div>
              <Settings className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Senaste ärenden</h2>
        {casesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4"><Skeleton className="h-16" /></Card>
            ))}
          </div>
        ) : availableCases && availableCases.length > 0 ? (
          <div className="space-y-3">
            {availableCases.map((c) => (
              <Link key={c.id} href={`/agency/cases/${c.id}`}>
                <Card className="p-4 hover-elevate cursor-pointer" data-testid={`card-agency-case-${c.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{c.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{c.aiSummary || "Ärendesammanfattning väntar..."}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {c.legalArea && (
                          <Badge variant="default" className="text-xs">
                            <Scale className="h-3 w-3 mr-1" />
                            {c.legalArea}
                          </Badge>
                        )}
                        {c.insuranceType && !c.insuranceType.startsWith("Nej") && (
                          <Badge variant="secondary" className="text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            {c.insuranceType}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("sv-SE") : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.hasInquired && (
                        <Badge variant="default" className="text-xs" data-testid={`badge-inquired-${c.id}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Besvarad
                        </Badge>
                      )}
                      <Badge variant="secondary" data-testid={`badge-status-${c.id}`}>
                        {c.status === "open" ? "Öppen" : c.status}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-dismiss-case-${c.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dismissMutation.mutate(c.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {profile.subscriptionActive ? "Inga ärenden tillgängliga just nu." : "Prenumerera för att se tillgängliga ärenden."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
