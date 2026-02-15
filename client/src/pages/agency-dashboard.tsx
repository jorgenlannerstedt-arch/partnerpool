import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, MessageCircle, Settings, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import type { Case, AgencyProfile } from "@shared/schema";

export default function AgencyDashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery<AgencyProfile>({
    queryKey: ["/api/agency/profile"],
  });

  const { data: availableCases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/agency/cases"],
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
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
        <h2 className="text-xl font-semibold">Complete Your Profile</h2>
        <p className="text-muted-foreground">Set up your agency profile to start receiving case leads.</p>
        <Link href="/agency/profile">
          <Button data-testid="button-setup-profile">Set Up Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-agency-dashboard-title">Agency Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {profile.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={profile.subscriptionActive ? "default" : "secondary"}>
            {profile.subscriptionActive ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> Active Subscription</>
            ) : (
              <><AlertCircle className="h-3 w-3 mr-1" /> No Subscription</>
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
                <p className="font-semibold text-sm">Subscribe to access cases</p>
                <p className="text-xs text-muted-foreground">995 SEK/month - Get full access to client cases and messaging</p>
              </div>
            </div>
            <Link href="/agency/subscribe">
              <Button size="sm" data-testid="button-subscribe">Subscribe Now</Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Available Cases</p>
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
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold" data-testid="text-agency-messages">
                  {unreadCount?.count || 0} unread
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
                <p className="text-sm text-muted-foreground">Profile</p>
                <p className="text-2xl font-bold text-primary" data-testid="text-edit-profile">Edit</p>
              </div>
              <Settings className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Cases</h2>
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
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{c.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{c.aiSummary || "Case summary pending..."}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <Badge variant="secondary">{c.status}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {profile.subscriptionActive ? "No cases available at the moment." : "Subscribe to see available cases."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
