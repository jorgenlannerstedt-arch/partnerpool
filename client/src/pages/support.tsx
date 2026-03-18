import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Hej! Jag är Vertigogos supportagent. Hur kan jag hjälpa dig idag? Du kan ställa frågor om hur plattformen fungerar, hur du laddar upp ett ärende, hur matchning med advokatbyråer sker, eller vad som helst annat.",
};

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/support/chat", {
        messages: updatedMessages,
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tyvärr uppstod ett fel. Försök igen eller kontakta oss på support@vertigogo.se." },
      ]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="text-muted-foreground hover:text-foreground cursor-pointer" data-testid="link-back">
            <ArrowLeft className="h-5 w-5" />
          </span>
        </Link>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-support-title">Support</h1>
      </div>

      <Card className="flex flex-col h-[calc(100vh-180px)] min-h-[500px]">
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Vertigogo Support</p>
            <p className="text-xs text-muted-foreground">AI-driven supportagent</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              data-testid={`message-${msg.role}-${i}`}
            >
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === "assistant" ? "bg-primary/10" : "bg-muted"
              }`}>
                {msg.role === "assistant"
                  ? <Bot className="h-3.5 w-3.5 text-primary" />
                  : <User className="h-3.5 w-3.5 text-muted-foreground" />
                }
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "assistant"
                  ? "bg-muted text-foreground rounded-tl-sm"
                  : "bg-primary text-primary-foreground rounded-tr-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 flex-row" data-testid="message-loading">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-primary/10">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="px-5 py-4 border-t">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Skriv din fråga här… (Enter för att skicka)"
              className="resize-none min-h-[44px] max-h-[120px] text-sm"
              rows={1}
              disabled={isLoading}
              data-testid="input-support-message"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="flex-shrink-0 rounded-full h-10 w-10"
              data-testid="button-send-support"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Tryck Enter för att skicka · Shift+Enter för ny rad
          </p>
        </div>
      </Card>
    </div>
  );
}
