import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { DirectMessage } from "@shared/schema";

type ConversationThread = {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: threads, isLoading: threadsLoading } = useQuery<ConversationThread[]>({
    queryKey: ["/api/messages/threads"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<DirectMessage[]>({
    queryKey: ["/api/messages", selectedThread],
    enabled: !!selectedThread,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: selectedThread,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedThread] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/threads"] });
    },
    onError: () => {
      toast({ title: "Fel", description: "Kunde inte skicka meddelandet", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim() && selectedThread) {
      sendMutation.mutate(messageText.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back-messages">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-messages-title">Meddelanden</h1>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-4 h-[calc(100%-3rem)]">
        <Card className="flex flex-col overflow-hidden">
          <div className="p-3 border-b">
            <h2 className="text-sm font-semibold">Konversationer</h2>
          </div>
          <ScrollArea className="flex-1">
            {threadsLoading ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : threads && threads.length > 0 ? (
              <div className="p-1">
                {threads.map((t) => (
                  <button
                    key={t.partnerId}
                    className={`w-full p-3 rounded-md text-left transition-colors flex items-center gap-3 hover-elevate ${
                      selectedThread === t.partnerId ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedThread(t.partnerId)}
                    data-testid={`button-thread-${t.partnerId}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {t.partnerName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{t.partnerName}</span>
                        {t.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                            {t.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Inga konversationer ännu</p>
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          {selectedThread ? (
            <>
              <div className="p-3 border-b">
                <h2 className="text-sm font-semibold">
                  {threads?.find((t) => t.partnerId === selectedThread)?.partnerName || "Konversation"}
                </h2>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3" ref={scrollRef}>
                {messagesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-2/3" />
                    ))}
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        data-testid={`message-${msg.id}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-md px-3 py-2 ${
                            isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-accent"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Inga meddelanden ännu. Starta konversationen!</p>
                  </div>
                )}
              </div>
              <div className="p-3 border-t flex items-center gap-2">
                <Input
                  placeholder="Skriv ett meddelande..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  data-testid="input-message"
                />
                <Button
                  size="icon"
                  disabled={!messageText.trim() || sendMutation.isPending}
                  onClick={handleSend}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Välj en konversation för att börja skicka meddelanden</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
