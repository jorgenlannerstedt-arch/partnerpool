import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Clock, Building2, MessageCircle } from "lucide-react";
import type { Case, CaseInquiry, AgencyProfile } from "@shared/schema";

type InquiryWithAgency = CaseInquiry & { agency?: AgencyProfile };

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();

  const { data: caseData, isLoading } = useQuery<Case>({
    queryKey: ["/api/cases", params.id],
  });

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery<InquiryWithAgency[]>({
    queryKey: ["/api/cases", params.id, "inquiries"],
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Case not found.</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">Go Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back-to-dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold font-serif truncate" data-testid="text-case-title">{caseData.title}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Created {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : ""}
          </p>
        </div>
        <Badge variant="secondary">{caseData.status}</Badge>
      </div>

      {caseData.aiSummary && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">AI Case Summary</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-ai-summary">
            {caseData.aiSummary}
          </p>
        </Card>
      )}

      {caseData.description && (
        <Card className="p-6 space-y-3">
          <h2 className="font-semibold">Additional Details</h2>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-case-description">{caseData.description}</p>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Responses from Law Firms
          {inquiries && inquiries.length > 0 && (
            <Badge variant="secondary">{inquiries.length}</Badge>
          )}
        </h2>
        {inquiriesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : inquiries && inquiries.length > 0 ? (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <Card key={inq.id} className="p-4 hover-elevate" data-testid={`card-inquiry-${inq.id}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{inq.agency?.name || "Law Firm"}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{inq.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{inq.message}</p>
                  <div className="flex items-center gap-2">
                    <Link href={`/messages?agency=${inq.agencyId}&case=${inq.caseId}`}>
                      <Button variant="outline" size="sm" data-testid={`button-message-agency-${inq.id}`}>
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                        Message
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No responses yet. Law firms are reviewing your case.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
