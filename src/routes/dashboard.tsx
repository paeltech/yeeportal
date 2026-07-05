import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import {
  FileText,
  LayoutDashboard,
  Users,
  ClipboardList,
  FolderOpen,
  User,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { getAuthSession, signOut } from "@/lib/auth/auth-fns";
import { getNavItemsForRole } from "@/lib/auth/permissions";
import type { AuthSession } from "@/lib/auth/types";
import { ROLE_LABELS } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ location }) => {
    const session = await getAuthSession();
    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname },
      });
    }
    return { session };
  },
  component: DashboardLayout,
});

const iconMap = {
  Overview: LayoutDashboard,
  Applications: ClipboardList,
  Groups: FolderOpen,
  Documents: FileText,
  "My group": Users,
  Users: Users,
  "My profile": User,
} as const;

function DashboardLayout() {
  const { session } = Route.useRouteContext();
  const router = useRouter();
  const navItems = getNavItemsForRole(session.profile.role);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    await router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-ink text-cream border-b border-cream/10">
        <div className="container-page flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-sm bg-sun text-ink font-display font-bold">
              Y
            </span>
            <span className="font-display text-lg">YEE Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right text-sm">
              <p className="font-semibold">{session.profile.fullName}</p>
              <p className="text-cream/70 text-xs">{ROLE_LABELS[session.profile.role]}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-cream/85 hover:text-sun hover:bg-cream/10"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="container-page py-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {navItems.map(({ to, label, exact }) => {
            const Icon = iconMap[label as keyof typeof iconMap] ?? LayoutDashboard;
            return (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors [&.active]:bg-secondary [&.active]:text-foreground [&.active]:font-semibold"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <Link
            to="/groups"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            Public directory
          </Link>
        </nav>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function useDashboardSession(): AuthSession {
  return Route.useRouteContext().session;
}
