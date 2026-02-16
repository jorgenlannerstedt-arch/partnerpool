import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import AgencyRegisterPage from "@/pages/agency-register";
import ClientLoginPage from "@/pages/client-login";
import RoleSelectPage from "@/pages/role-select";
import ClientDashboard from "@/pages/client-dashboard";
import NewCasePage from "@/pages/new-case";
import CaseDetailPage from "@/pages/case-detail";
import PartnerPoolPage from "@/pages/partner-pool";
import PartnerDetailPage from "@/pages/partner-detail";
import MessagesPage from "@/pages/messages";
import AgencyDashboard from "@/pages/agency-dashboard";
import AgencyProfileSetupPage from "@/pages/agency-profile-setup";
import AgencyCaseDetailPage from "@/pages/agency-case-detail";
import AgencySubscribePage from "@/pages/agency-subscribe";
import SettingsPage from "@/pages/settings";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import DataPolicyPage from "@/pages/data-policy";
import AppLayout from "@/components/app-layout";
import type { UserProfile } from "@shared/schema";

function AuthenticatedRouter() {
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-64 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (!profile || !profile.onboardingComplete) {
    return <RoleSelectPage />;
  }

  const isAgency = profile.role === "agency";

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={isAgency ? AgencyDashboard : ClientDashboard} />
        <Route path="/cases/new" component={NewCasePage} />
        <Route path="/cases/:id" component={CaseDetailPage} />
        <Route path="/partners" component={PartnerPoolPage} />
        <Route path="/partners/:id" component={PartnerDetailPage} />
        <Route path="/messages" component={MessagesPage} />
        <Route path="/agency/profile" component={AgencyProfileSetupPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/agency/cases/:id" component={AgencyCaseDetailPage} />
        <Route path="/agency/subscribe" component={AgencySubscribePage} />
        <Route path="/integritetspolicy" component={PrivacyPolicyPage} />
        <Route path="/datapolicy" component={DataPolicyPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-64 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/register/agency" component={AgencyRegisterPage} />
        <Route path="/login" component={ClientLoginPage} />
        <Route path="/integritetspolicy" component={PrivacyPolicyPage} />
        <Route path="/datapolicy" component={DataPolicyPage} />
        <Route component={LandingPage} />
      </Switch>
    );
  }

  return <AuthenticatedRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
