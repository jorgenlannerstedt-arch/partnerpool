import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, MessageCircle, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { Case } from "@shared/schema";

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  open: { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: Clock },
  reviewing: { color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", icon: AlertCircle },
  matched: { color: "bg-green-500/10 text-green-600 dark:text-green-400", icon: CheckCircle },
  closed: { color: "bg-muted text-muted-foreground", icon: CheckCircle },
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
          <h1 className="text-2xl font-bold font-serif" data-testid="text-dashboard-title">My Cases</h1>
          <p className="text-muted-foreground text-sm">Manage your legal cases and connect with law firms</p>
        </div>
        <Link href="/cases/new">
          <Button data-testid="button-new-case">
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Cases</p>
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
                <p className="text-sm text-muted-foreground">Partner Pool</p>
                <p className="text-2xl font-bold text-primary" data-testid="text-partners">Browse</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </Link>
        <Link href="/messages">
          <Card className="p-4 hover-elevate cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold" data-testid="text-messages">
                  {unreadCount?.count || 0} unread
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Cases</h2>
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
                        <p className="text-sm text-muted-foreground line-clamp-2">{c.aiSummary || c.description || "No description yet"}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <Badge variant="secondary" className={config.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {c.status}
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
            <h3 className="font-semibold mb-1">No cases yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload a document to create your first case and find legal help.</p>
            <Link href="/cases/new">
              <Button data-testid="button-create-first-case">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Case
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
