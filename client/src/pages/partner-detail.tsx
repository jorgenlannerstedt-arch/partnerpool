import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, MapPin, Users, Globe, Star, Clock, Shield, ShieldCheck, CreditCard, Languages, MessageCircle, Briefcase, Calendar, Trophy } from "lucide-react";
import type { AgencyProfile, AgencyReview } from "@shared/schema";

interface Office {
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}


export default function PartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: agency, isLoading } = useQuery<AgencyProfile>({
    queryKey: ["/api/agencies", params.id],
  });

  const { data: reviews } = useQuery<AgencyReview[]>({
    queryKey: ["/api/agencies", params.id, "reviews"],
    queryFn: async () => {
      const res = await fetch(`/api/agencies/${params.id}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!params.id,
  });

  const { data: stats } = useQuery<{ avgRating: number; reviewCount: number; caseCount: number; selectedCount: number; avgResponseHours: number | null }>({
    queryKey: ["/api/agencies", params.id, "stats"],
    queryFn: async () => {
      const res = await fetch(`/api/agencies/${params.id}/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Byrån hittades inte.</p>
        <Link href="/partners">
          <Button variant="outline" className="mt-4">Tillbaka till partners</Button>
        </Link>
      </div>
    );
  }

  const offices = agency.offices as Office[] | null;
  const yearsActive = agency.foundedYear ? new Date().getFullYear() - agency.foundedYear : null;

  const formatResponseTime = (hours: number | null) => {
    if (!hours) return null;
    if (hours < 2) return "Under 2 timmar";
    if (hours < 24) return `Inom ${hours} timmar`;
    const days = Math.round(hours / 24);
    return `Inom ${days} ${days === 1 ? "dag" : "dagar"}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/partners">
          <Button variant="ghost" size="icon" data-testid="button-back-to-partners">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-agency-name">{agency.name}</h1>
        {agency.barAssociationMember && (
          <Badge variant="secondary" className="text-xs" data-testid="badge-bar-member">
            <Shield className="h-3 w-3 mr-1 text-blue-500" />
            Advokatsamfundet
          </Badge>
        )}
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {agency.logoUrl ? (
              <img src={agency.logoUrl} alt={agency.name} className="w-full h-full object-contain" data-testid="img-agency-logo" />
            ) : (
              <Building2 className="h-10 w-10 text-muted-foreground" />
            )}
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
              {stats && stats.reviewCount > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={stats.avgRating} />
                  <span className="text-sm font-medium">{stats.avgRating}</span>
                  <span className="text-sm text-muted-foreground">({stats.reviewCount} omdömen)</span>
                </div>
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

            {agency.languages && agency.languages.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Languages className="h-4 w-4" />
                  Språk
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {agency.languages.map((lang) => (
                    <Badge key={lang} variant="secondary">{lang}</Badge>
                  ))}
                </div>
              </div>
            )}

            {offices && offices.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Kontor</h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="font-medium">Huvudkontor:</span> {agency.address ? `${agency.address}, ` : ""}{agency.city}
                  </p>
                  {offices.map((office, i) => (
                    <p key={i} className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      {office.address ? `${office.address}, ` : ""}{office.city}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{agency.employeeCount || 1} anställda</span>
              </div>
              {yearsActive && yearsActive > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Grundat {agency.foundedYear} ({yearsActive} år)</span>
                </div>
              )}
              {(stats?.avgResponseHours != null || agency.responseTimeHours) && (
                <div className="flex items-center gap-2 text-sm" data-testid="text-response-time">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {stats?.avgResponseHours != null
                      ? `Svarar i snitt: ${formatResponseTime(stats.avgResponseHours)}`
                      : `Svarar: ${formatResponseTime(agency.responseTimeHours)}`
                    }
                  </span>
                </div>
              )}
              {agency.priceRange && (
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Prisintervall: {agency.priceRange}</span>
                </div>
              )}
              {stats && stats.caseCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{stats.caseCount} ärenden via Vertigogo</span>
                </div>
              )}
              {stats && stats.selectedCount > 0 && (
                <div className="flex items-center gap-2 text-sm" data-testid="text-selected-count">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span>Vald {stats.selectedCount} {stats.selectedCount === 1 ? "gång" : "gånger"}</span>
                </div>
              )}
              {agency.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={agency.website.startsWith("http") ? agency.website : `https://${agency.website}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                    Besök webbplats
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold font-serif flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Omdömen
          {stats && stats.reviewCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground">({stats.reviewCount})</span>
          )}
        </h3>

        <div className="flex items-center gap-2 text-xs text-muted-foreground border-b pb-4">
          <ShieldCheck className="h-4 w-4" />
          <span>Omdömen kan bara lämnas av klienter som har valt byrån för ett ärende via Vertigogo.</span>
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="space-y-1" data-testid={`review-${review.id}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <Badge variant="outline" className="text-xs gap-1" data-testid={`badge-verified-${review.id}`}>
                    <ShieldCheck className="h-3 w-3" />
                    Verifierat omdöme
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString("sv-SE") : ""}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Inga omdömen ännu. Bli den första!</p>
        )}
      </Card>
    </div>
  );
}
