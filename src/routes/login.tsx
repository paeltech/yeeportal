import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth/auth-fns";
import { getDefaultDashboardPath } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn({ data: { email, password } });
      toast.success(`Welcome back, ${result.session.profile.fullName}`);
      const target = redirectTo ?? getDefaultDashboardPath(result.session.profile.role);
      window.location.href = target;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-cream p-12">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-sm bg-sun text-ink font-display font-bold">
            Y
          </span>
          <span className="font-display text-xl">YEE Portal</span>
        </Link>
        <div>
          <p className="eyebrow text-sun">Staff &amp; group leaders</p>
          <h1 className="mt-4 font-display text-5xl leading-tight">
            Manage groups, documents, and applications.
          </h1>
        </div>
        <p className="text-sm text-cream/70">Mulika Tanzania · UNFPA Tanzania</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="font-display text-3xl">Sign in</h2>
            <p className="mt-2 text-muted-foreground">
              Access the YEE dashboard to manage programme data.
            </p>
          </div>

          {!isSupabaseConfigured() && (
            <div className="rounded-xl border border-sun/40 bg-sun/10 px-4 py-3 text-sm">
              <p className="font-semibold">Demo mode</p>
              <p className="mt-1 text-muted-foreground">
                Supabase is not configured. Use <code className="text-xs">admin@yee.or.tz</code>{" "}
                with any password when <code className="text-xs">DEV_BYPASS_AUTH=true</code>.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yee.or.tz"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Want to join YEE?{" "}
            <Link to="/apply" className="font-semibold text-ink underline decoration-sun">
              Apply here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
