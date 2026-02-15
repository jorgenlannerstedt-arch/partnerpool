import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, MapPin, Users, Globe, Phone, Mail } from "lucide-react";
import type { AgencyProfile } from "@shared/schema";

export default function PartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: agency, isLoading } = useQuery<AgencyProfile>({
    queryKey: ["/api/agencies", params.id],
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </Card>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Byrån hittades inte.</p>
        <Link href="/partners">
          <Button variant="outline" className="mt-4">Tillbaka till partners</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/partners">
          <Button variant="ghost" size="icon" data-testid="button-back-to-partners">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-agency-name">{agency.name}</h1>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-20 h-20 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-xl font-semibold">{agency.name}</h2>
              {agency.city && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {agency.address ? `${agency.address}, ${agency.city}` : agency.city}
                </p>
              )}
            </div>

            {agency.description && (
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-agency-description">
                {agency.description}
              </p>
            )}

            {agency.specialties && agency.specialties.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Specialiseringar</h3>
                <div className="flex flex-wrap gap-1.5">
                  {agency.specialties.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{agency.employeeCount || 1} anställda</span>
              </div>
              {agency.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${agency.email}`} className="text-primary">{agency.email}</a>
                </div>
              )}
              {agency.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{agency.phone}</span>
                </div>
              )}
              {agency.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                    Besök webbplats
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
