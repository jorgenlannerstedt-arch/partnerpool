import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale, User, Building2, ArrowRight } from "lucide-react";

export default function RoleSelectPage() {
  const [selected, setSelected] = useState<"client" | "agency" | null>(null);

  const mutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await apiRequest("POST", "/api/profile/role", { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  const handleContinue = () => {
    if (selected) mutation.mutate(selected);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Vertogogo</span>
          </div>
          <h1 className="text-3xl font-bold font-serif">Welcome! How will you use Vertogogo?</h1>
          <p className="text-muted-foreground">Choose your role to get started. This helps us personalize your experience.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card
            className={`p-6 cursor-pointer transition-all hover-elevate ${selected === "client" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelected("client")}
            data-testid="card-role-client"
          >
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">I'm a Client</h3>
                <p className="text-sm text-muted-foreground">I need legal help and want to find the right law firm for my case.</p>
              </div>
              <div className="text-xs text-primary font-medium">Always free</div>
            </div>
          </Card>

          <Card
            className={`p-6 cursor-pointer transition-all hover-elevate ${selected === "agency" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelected("agency")}
            data-testid="card-role-agency"
          >
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">I'm a Law Firm</h3>
                <p className="text-sm text-muted-foreground">I want to receive qualified case leads and grow my practice.</p>
              </div>
              <div className="text-xs text-muted-foreground font-medium">995 SEK/month</div>
            </div>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!selected || mutation.isPending}
            onClick={handleContinue}
            data-testid="button-continue-role"
          >
            {mutation.isPending ? "Setting up..." : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
