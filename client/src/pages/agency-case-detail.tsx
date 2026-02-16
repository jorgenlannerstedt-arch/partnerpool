import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Send, Loader2, CheckCircle, ShieldCheck, CircleDollarSign, Scale, MessageCircle, Trophy, XCircle } from "lucide-react";
import type { Case, CaseInquiry } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

const STATUS_LABELS: Record<string, string> = {
  open: "Öppet",
  reviewing: "Granskas",
  matched: "Matchat",
  closed: "Avslutat",
};

const AMOUNT_LABELS: Record<string, string> = {
  "under-50k": "Under 50 000 SEK",
  "50k-100k": "50 000 - 100 000 SEK",
  "100k-250k": "100 000 - 250 000 SEK",
  "250k-500k": "250 000 - 500 000 SEK",
  "500k-1m": "500 000 - 1 000 000 SEK",
  "over-1m": "Över 1 000 000 SEK",
  "unknown": "Osäker / Vet ej",
};

export default function AgencyCaseDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [inquiryMessage, setInquiryMessage] = useState("");

  const { data: agencyProfile } = useQuery<{ id: number }>({
    queryKey: ["/api/agency/profile"],
  });

  const { data: caseData, isLoading } = useQuery<Case>({
    queryKey: ["/api/agency/cases", params.id],
  });

  const { data: myInquiry } = useQuery<CaseInquiry | null>({
    queryKey: ["/api/agency/cases", params.id, "my-inquiry"],
  });

  const sendInquiryMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", `/api/agency/cases/${params.id}/inquire`, { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/cases", params.id, "my-inquiry"] });
      toast({ title: "Intresseanmälan skickad", description: "Klienten kommer att meddelas om ditt intresse." });
      setInquiryMessage("");
    },
    onError: (err: Error) => {
      toast({ title: "Fel", description: err.message, variant: "destructive" });
    },
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

  if (!caseData) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Ärendet hittades inte.</p>
        <Link href="/"><Button variant="outline" className="mt-4">Gå tillbaka</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back-agency-case">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold font-serif truncate" data-testid="text-agency-case-title">{caseData.title}</h1>
          <p className="text-sm text-muted-foreground">
            Publicerad {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString("sv-SE") : ""}
          </p>
        </div>
        <Badge variant="secondary">{STATUS_LABELS[caseData.status] || caseData.status}</Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        {caseData.legalArea && (
          <div className="flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" data-testid="badge-legal-area">{caseData.legalArea}</Badge>
          </div>
        )}
        {caseData.insuranceType && (
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <Badge variant={caseData.insuranceType.startsWith("Nej") ? "secondary" : "default"} data-testid="badge-insurance">
              {caseData.insuranceType}
            </Badge>
          </div>
        )}
        {caseData.estimatedAmount && (
          <div className="flex items-center gap-1.5">
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" data-testid="badge-amount">
              {AMOUNT_LABELS[caseData.estimatedAmount] || caseData.estimatedAmount}
            </Badge>
          </div>
        )}
      </div>

      {caseData.aiSummary && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Ärendesammanfattning</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-agency-ai-summary">
            {caseData.aiSummary}
          </p>
        </Card>
      )}

      {caseData.status === "closed" && caseData.selectedAgencyId === agencyProfile?.id && (
        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <Trophy className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Klienten har valt er byrå</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ni har tilldelats detta ärende. Fortsätt konversationen med klienten via meddelanden.
              </p>
            </div>
          </div>
        </Card>
      )}

      {caseData.status === "closed" && caseData.selectedAgencyId !== agencyProfile?.id && myInquiry && (
        <Card className="p-4 border-muted bg-muted/30">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-muted-foreground">Klienten har valt en annan byrå</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ärendet har stängts. Tack för ert intresse.
              </p>
            </div>
          </div>
        </Card>
      )}

      {myInquiry ? (
        <Card className="p-6 space-y-3 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Din intresseanmälan</h2>
          </div>
          <p className="text-sm text-muted-foreground">{myInquiry.message}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {myInquiry.status === "pending" ? "Skickad" : myInquiry.status === "accepted" ? "Accepterad" : myInquiry.status === "rejected" ? "Avvisad" : myInquiry.status}
            </Badge>
            <Link href={`/messages?client=${caseData.clientId}&case=${caseData.id}`}>
              <Button variant="outline" size="sm" data-testid="button-message-client">
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                Öppna konversation
              </Button>
            </Link>
          </div>
        </Card>
      ) : caseData.status !== "closed" ? (
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">Visa intresse</h2>
          <p className="text-sm text-muted-foreground">
            Skicka ett meddelande till klienten och förklara hur din byrå kan hjälpa till med detta ärende.
          </p>
          <Textarea
            value={inquiryMessage}
            onChange={(e) => setInquiryMessage(e.target.value)}
            placeholder="Beskriv din expertis inom detta området och hur du skulle hantera ärendet..."
            rows={4}
            data-testid="input-inquiry-message"
          />
          <Button
            className="rounded-full"
            disabled={!inquiryMessage.trim() || sendInquiryMutation.isPending}
            onClick={() => sendInquiryMutation.mutate(inquiryMessage.trim())}
            data-testid="button-send-inquiry"
          >
            {sendInquiryMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Skickar...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Skicka intresseanmälan</>
            )}
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
