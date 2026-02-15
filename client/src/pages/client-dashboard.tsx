import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, MessageCircle, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { Case } from "@shared/schema";

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  open: { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: Clock, label: "Öppet" },
  reviewing: { color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", icon: AlertCircle, label: "Granskas" },
  matched: { color: "bg-green-500/10 text-green-600 dark:text-green-400", icon: CheckCircle, label: "Matchat" },
  closed: { color: "bg-muted text-muted-foreground", icon: CheckCircle, label: "Avslutat" },
};

export default function ClientDashboard() {
  const { data: cases, isLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-dashboard-title">Mina ärenden</h1>
          <p className="text-muted-foreground text-sm">Hantera dina juridiska ärenden och koppla upp dig med advokatbyråer</p>
        </div>
        <Link href="/cases/new">
          <Button data-testid="button-new-case">
            <Plus className="h-4 w-4 mr-2" />
            Nytt ärende
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Aktiva ärenden</p>
              <p className="text-2xl font-bold" data-testid="text-active-cases">
                {isLoading ? "..." : cases?.filter((c) => c.status !== "closed").length || 0}
              </p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Link href="/partners">
          <Card className="p-4 hover-elevate cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Partnerbyråer</p>
                <p className="text-2xl font-bold text-primary" data-testid="text-partners">Bläddra</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </Link>
        <Link href="/messages">
          <Card className="p-4 hover-elevate cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Meddelanden</p>
                <p className="text-2xl font-bold" data-testid="text-messages">
                  {unreadCount?.count || 0} olästa
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Senaste ärenden</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : cases && cases.length > 0 ? (
          <div className="space-y-3">
            {cases.map((c) => {
              const config = statusConfig[c.status] || statusConfig.open;
              const StatusIcon = config.icon;
              return (
                <Link key={c.id} href={`/cases/${c.id}`}>
                  <Card className="p-4 hover-elevate cursor-pointer" data-testid={`card-case-${c.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{c.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{c.aiSummary || c.description || "Ingen beskrivning ännu"}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("sv-SE") : ""}
                        </p>
                      </div>
                      <Badge variant="secondary" className={config.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-1">Inga ärenden ännu</h3>
            <p className="text-sm text-muted-foreground mb-4">Ladda upp ett dokument för att skapa ditt första ärende och hitta juridisk hjälp.</p>
            <Link href="/cases/new">
              <Button data-testid="button-create-first-case">
                <Plus className="h-4 w-4 mr-2" />
                Skapa ditt första ärende
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
