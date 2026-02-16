import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, FileText, Clock, Building2, MessageCircle, ShieldCheck, CircleDollarSign, Scale, Trash2, AlertTriangle, Send, CheckCircle, Loader2, Pencil } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Case, CaseInquiry, AgencyProfile, DirectMessage } from "@shared/schema";

type InquiryWithAgency = CaseInquiry & { agency?: AgencyProfile };

const STATUS_LABELS: Record<string, string> = {
  draft: "Utkast",
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

function InquiryMessageDialog({
  inquiry,
  caseId,
  open,
  onOpenChange,
}: {
  inquiry: InquiryWithAgency;
  caseId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: messagesLoading } = useQuery<DirectMessage[]>({
    queryKey: ["/api/messages", inquiry.agencyId],
    enabled: open,
    refetchInterval: open ? 5000 : false,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: inquiry.agencyId,
        caseId,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", inquiry.agencyId] });
    },
    onError: (err: Error) => {
      toast({ title: "Fel", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inquiry.agencyId) {
      apiRequest("POST", `/api/messages/mark-read/${inquiry.agencyId}`).catch(() => {});
    }
  }, [open, inquiry.agencyId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {inquiry.agency?.name || "Advokatbyrå"}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-muted/50 rounded-md p-3 mb-2">
          <p className="text-xs text-muted-foreground mb-1">Intresseanmälan:</p>
          <p className="text-sm">{inquiry.message}</p>
        </div>

        <ScrollArea className="flex-1 min-h-[200px] max-h-[400px] pr-3" ref={scrollRef}>
          {messagesLoading ? (
            <div className="space-y-3 p-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-3/4" />
              ))}
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-3 p-2">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`} data-testid={`message-${msg.id}`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString("sv-SE", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }) : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Inga meddelanden ännu. Skriv ett svar nedan.
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Textarea
            placeholder="Skriv ditt svar..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={2}
            className="flex-1 resize-none"
            data-testid="input-reply-message"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                e.preventDefault();
                sendMutation.mutate(messageText.trim());
              }
            }}
          />
          <Button
            size="icon"
            disabled={!messageText.trim() || sendMutation.isPending}
            onClick={() => sendMutation.mutate(messageText.trim())}
            data-testid="button-send-reply"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editingDescription, setEditingDescription] = useState(false);
  const [draftDescription, setDraftDescription] = useState("");
  const [editingSummary, setEditingSummary] = useState(false);
  const [draftSummary, setDraftSummary] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryWithAgency | null>(null);

  const { data: caseData, isLoading } = useQuery<Case>({
    queryKey: ["/api/cases", params.id],
  });

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery<InquiryWithAgency[]>({
    queryKey: ["/api/cases", params.id, "inquiries"],
    enabled: caseData?.status !== "draft",
  });

  const isDraft = caseData?.status === "draft";

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

  const updateMutation = useMutation({
    mutationFn: async (updates: { description?: string; status?: string; aiSummary?: string }) => {
      const res = await apiRequest("PATCH", `/api/cases/${params.id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases", params.id] });
      setEditingDescription(false);
      setEditingSummary(false);
    },
    onError: (err: Error) => {
      toast({ title: "Fel", description: err.message, variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/cases/${params.id}`, { status: "open" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({ title: "Ärende publicerat", description: "Ditt ärende är nu synligt för advokatbyråer med matchande kompetens." });
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
        <Badge variant={isDraft ? "outline" : "secondary"} data-testid="badge-case-status">
          {STATUS_LABELS[caseData.status] || caseData.status}
        </Badge>
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

      {isDraft && (
        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Utkast — inte publicerat ännu</p>
              <p className="text-xs text-muted-foreground mt-1">
                Granska AI-sammanfattningen och gör eventuella justeringar i detaljerna nedan innan du publicerar.
                När du publicerar blir ärendet synligt för advokatbyråer med matchande kompetens.
              </p>
            </div>
          </div>
        </Card>
      )}

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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">AI-sammanfattning</h2>
            </div>
            {isDraft && !editingSummary && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraftSummary(caseData.aiSummary || "");
                  setEditingSummary(true);
                }}
                data-testid="button-edit-summary"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Redigera
              </Button>
            )}
          </div>
          {editingSummary ? (
            <div className="space-y-3">
              <Textarea
                value={draftSummary}
                onChange={(e) => setDraftSummary(e.target.value)}
                rows={6}
                data-testid="input-edit-summary"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate({ aiSummary: draftSummary })}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-summary"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Spara
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSummary(false)}
                  data-testid="button-cancel-edit-summary"
                >
                  Avbryt
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-ai-summary">
              {caseData.aiSummary}
            </p>
          )}
        </Card>
      )}

      <Card className="p-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">Ytterligare detaljer</h2>
          {isDraft && !editingDescription && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraftDescription(caseData.description || "");
                setEditingDescription(true);
              }}
              data-testid="button-edit-description"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Redigera
            </Button>
          )}
        </div>
        {editingDescription ? (
          <div className="space-y-3">
            <Textarea
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="Lägg till ytterligare information om ditt ärende..."
              rows={4}
              data-testid="input-edit-description"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => updateMutation.mutate({ description: draftDescription })}
                disabled={updateMutation.isPending}
                data-testid="button-save-description"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                )}
                Spara
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingDescription(false)}
                data-testid="button-cancel-edit"
              >
                Avbryt
              </Button>
            </div>
          </div>
        ) : caseData.description ? (
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-case-description">{caseData.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic" data-testid="text-no-description">
            {isDraft ? "Inga ytterligare detaljer. Klicka på Redigera för att lägga till." : "Inga ytterligare detaljer."}
          </p>
        )}
      </Card>

      {isDraft && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full rounded-full" size="lg" data-testid="button-publish-case">
              <CheckCircle className="h-4 w-4 mr-2" />
              Publicera ärende till advokatbyråer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Publicera ärende</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <span className="block">
                  När du publicerar blir ärendet <strong>"{caseData.title}"</strong> synligt för anslutna advokatbyråer
                  med matchande kompetens inom <strong>{caseData.legalArea || "det relevanta rättsområdet"}</strong>.
                </span>
                <span className="block">
                  Byråerna kan sedan skicka intresseanmälningar och du kan välja vilka du vill kommunicera med.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-publish">Avbryt</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                data-testid="button-confirm-publish"
              >
                {publishMutation.isPending ? "Publicerar..." : "Publicera"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {!isDraft && (
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
                <Card
                  key={inq.id}
                  className="p-4 hover-elevate cursor-pointer"
                  onClick={() => setSelectedInquiry(inq)}
                  data-testid={`card-inquiry-${inq.id}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{inq.agency?.name || "Advokatbyrå"}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString("sv-SE") : ""}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{inq.message}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInquiry(inq);
                        }}
                        data-testid={`button-open-inquiry-${inq.id}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                        Öppna & svara
                      </Button>
                    </div>
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
      )}

      {selectedInquiry && caseData && (
        <InquiryMessageDialog
          inquiry={selectedInquiry}
          caseId={caseData.id}
          open={!!selectedInquiry}
          onOpenChange={(open) => {
            if (!open) setSelectedInquiry(null);
          }}
        />
      )}
    </div>
  );
}
