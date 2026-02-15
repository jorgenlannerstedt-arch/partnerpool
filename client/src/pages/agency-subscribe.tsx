import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { Link } from "wouter";

const features = [
  "Access to all client case summaries",
  "AI-generated anonymized case descriptions",
  "Direct messaging with potential clients",
  "Featured placement in Partner Pool",
  "Priority case notifications",
  "Dedicated support",
];

export default function AgencySubscribePage() {
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/agency/create-checkout");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
      return data;
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back-subscribe">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-subscribe-title">Subscribe</h1>
      </div>

      <Card className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <CreditCard className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold font-serif">Vertogogo Professional</h2>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">995</span>
            <span className="text-muted-foreground">SEK/month</span>
          </div>
          <p className="text-sm text-muted-foreground">Cancel anytime</p>
        </div>

        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => subscribeMutation.mutate()}
          disabled={subscribeMutation.isPending}
          data-testid="button-start-subscription"
        >
          {subscribeMutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Start Subscription
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment processed by Stripe. Your subscription can be cancelled at any time.
        </p>
      </Card>
    </div>
  );
}
