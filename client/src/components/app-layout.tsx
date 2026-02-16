import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Users, MessageCircle, Settings, LogOut, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserProfile } from "@shared/schema";
import logoSrc from "@assets/vertigogo-logo.svg";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count || 0;

  const isAgency = profile?.role === "agency";
  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U"
    : "U";

  const clientNavItems = [
    { href: "/", label: "Panel", icon: LayoutDashboard },
    { href: "/partners", label: "Partners", icon: Users },
    { href: "/messages", label: "Meddelanden", icon: MessageCircle },
    { href: "/settings", label: "Inställningar", icon: Settings },
  ];

  const agencyNavItems = [
    { href: "/", label: "Panel", icon: LayoutDashboard },
    { href: "/messages", label: "Meddelanden", icon: MessageCircle },
    { href: "/agency/profile", label: "Profil", icon: Settings },
  ];

  const navItems = isAgency ? agencyNavItems : clientNavItems;

  return (
    <div className="min-h-screen bg-[#f3f4f8]">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-14">
            <div className="flex items-center gap-8">
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
                  <img src={logoSrc} alt="Vertigogo" className="h-5" />
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                  const isMessages = item.href === "/messages";
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full relative ${isActive ? "bg-secondary" : ""}`}
                        data-testid={`nav-${item.label.toLowerCase()}`}
                      >
                        <item.icon className="h-4 w-4 mr-1.5" />
                        {item.label}
                        {isMessages && unreadCount > 0 && (
                          <span
                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                            data-testid="badge-unread-count"
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full gap-2 px-2" data-testid="button-user-menu">
                    <span className="text-sm font-medium hidden sm:inline" data-testid="text-user-name">{user?.firstName}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href={isAgency ? "/agency/profile" : "/settings"}>
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-settings">
                      <Settings className="h-4 w-4 mr-2" />
                      {isAgency ? "Profilinställningar" : "Inställningar"}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={async () => {
                      await apiRequest("POST", "/api/profile/reset-role");
                      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
                    }}
                    data-testid="menu-switch-role"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Byt roll
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={() => logout()}
                    data-testid="menu-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logga ut
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="md:hidden border-t">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-1 overflow-x-auto py-2">
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                const isMessages = item.href === "/messages";
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full relative ${isActive ? "bg-secondary" : ""}`}
                    >
                      <item.icon className="h-4 w-4 mr-1.5" />
                      {item.label}
                      {isMessages && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="border-t py-6 px-4 sm:px-6 lg:px-8 bg-white mt-8" data-testid="footer">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Vertigo Intel AB
          </p>
          <div className="flex items-center gap-6">
            <Link href="/integritetspolicy">
              <span className="text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer" data-testid="link-privacy-policy">Integritetspolicy</span>
            </Link>
            <Link href="/datapolicy">
              <span className="text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer" data-testid="link-data-policy">Datapolicy</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
