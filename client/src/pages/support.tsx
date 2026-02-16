import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Headphones } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="text-muted-foreground hover:text-foreground cursor-pointer" data-testid="link-back">
            <ArrowLeft className="h-5 w-5" />
          </span>
        </Link>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-support-title">Support</h1>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Headphones className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold font-serif">Hur kan vi hjälpa dig?</h2>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-support-info">
          Vår supportagent kommer snart att vara tillgänglig här för att hjälpa dig med frågor om Vertigogo.
        </p>
      </Card>
    </div>
  );
}
