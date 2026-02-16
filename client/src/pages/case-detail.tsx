import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ArrowLeft, FileText, Clock, Building2, MessageCircle, ShieldCheck, CircleDollarSign, Scale, Trash2, AlertTriangle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Case, CaseInquiry, AgencyProfile } from "@shared/schema";

type InquiryWithAgency = CaseInquiry & { agency?: AgencyProfile };

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

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: caseData, isLoading } = useQuery<Case>({
    queryKey: ["/api/cases", params.id],
  });

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery<InquiryWithAgency[]>({
    queryKey: ["/api/cases", params.id, "inquiries"],
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cases/${params.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({ title: "Ärende borttaget", description: "Ditt ärende har tagits bort permanent." });
      navigate("/");
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
          <Skeleton className="h-4 w-3/4" />
        </Card>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Ärendet hittades inte.</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">Gå tillbaka</Button>
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
            Skapad {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString("sv-SE") : ""}
          </p>
        </div>
        <Badge variant="secondary">{STATUS_LABELS[caseData.status] || caseData.status}</Badge>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-delete-case">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertTriangle className="h-5 w-5" />
                <AlertDialogTitle>Ta bort ärende</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="space-y-2">
                <span className="block">
                  Är du säker på att du vill ta bort ärendet <strong>"{caseData.title}"</strong>?
                </span>
                <span className="block font-semibold text-destructive">
                  Denna åtgärd kan inte ångras. Alla meddelanden och svar från advokatbyråer kopplade till detta ärende kommer också att raderas.
                </span>
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
                {deleteMutation.isPending ? "Tar bort..." : "Ta bort ärende"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex flex-wrap gap-3">
        {caseData.legalArea && (
          <div className="flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" data-testid="badge-legal-area">{caseData.legalArea}</Badge>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <Badge variant={caseData.hasInsurance ? "default" : "secondary"} data-testid="badge-insurance">
            {caseData.hasInsurance ? "Har rättsskydd" : "Inget rättsskydd"}
          </Badge>
        </div>
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
            <h2 className="font-semibold">AI-sammanfattning</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-ai-summary">
            {caseData.aiSummary}
          </p>
        </Card>
      )}

      {caseData.description && (
        <Card className="p-6 space-y-3">
          <h2 className="font-semibold">Ytterligare detaljer</h2>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-case-description">{caseData.description}</p>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Svar från advokatbyråer
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
                      <span className="font-semibold">{inq.agency?.name || "Advokatbyrå"}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{inq.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{inq.message}</p>
                  <div className="flex items-center gap-2">
                    <Link href={`/messages?agency=${inq.agencyId}&case=${inq.caseId}`}>
                      <Button variant="outline" size="sm" data-testid={`button-message-agency-${inq.id}`}>
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                        Meddelande
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString("sv-SE") : ""}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Inga svar ännu. Advokatbyråer granskar ditt ärende.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
