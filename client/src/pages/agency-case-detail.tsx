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
import { ArrowLeft, FileText, Send, Loader2, CheckCircle } from "lucide-react";
import type { Case, CaseInquiry } from "@shared/schema";

export default function AgencyCaseDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [inquiryMessage, setInquiryMessage] = useState("");

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
        <Badge variant="secondary">{caseData.status}</Badge>
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

      {myInquiry ? (
        <Card className="p-6 space-y-3 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Din intresseanmälan</h2>
          </div>
          <p className="text-sm text-muted-foreground">{myInquiry.message}</p>
          <Badge variant="secondary">{myInquiry.status}</Badge>
          <Link href={`/messages?client=${caseData.clientId}&case=${caseData.id}`}>
            <Button variant="outline" size="sm" className="mt-2" data-testid="button-message-client">
              Meddela klient
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">Visa intresse</h2>
          <p className="text-sm text-muted-foreground">
            Skicka ett meddelande till klienten och förklara hur din byrå kan hjälpa till med detta ärende.
          </p>
          <Textarea
            value={inquiryMessage}
            onChange={(e) => setInquiryMessage(e.target.value)}
            placeholder="Beskriv din expertis inom detta område och hur du skulle hantera ärendet..."
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
      )}
    </div>
  );
}
