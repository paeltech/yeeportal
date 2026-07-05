import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ClipboardList, Users, TrendingUp } from "lucide-react";
import { getProgrammeStats } from "@/lib/data/group-fns";
import { getPendingApplicationCount } from "@/lib/forms/form-fns";
import { useDashboardSession } from "@/routes/dashboard";
import { isAdmin, isStaff } from "@/lib/auth/permissions";

export const Route = createFileRoute("/dashboard/")({
  loader: async () => {
    const [stats, pendingApps] = await Promise.all([
      getProgrammeStats(),
      getPendingApplicationCount().catch(() => 0),
    ]);
    return { stats, pendingApps };
  },
  component: DashboardOverview,
});

function DashboardOverview() {
  const { stats, pendingApps } = Route.useLoaderData();
  const session = useDashboardSession();

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-clay">Admin</p>
        <h1 className="mt-2 font-display text-4xl">
          Welcome, {session.profile.fullName.split(" ")[0]}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Programme overview across {stats.wardCount} wards — {stats.totalGroups} active groups and{" "}
          {stats.totalMembers} members.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Groups" value={String(stats.totalGroups)} />
        <StatCard label="Members" value={String(stats.totalMembers)} />
        <StatCard label="Total savings" value={stats.totalSavingsDisplay} />
        <StatCard label="Avg readiness" value={`${stats.avgReadiness}%`} />
      </dl>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isAdmin(session.profile.role) && (
          <DashLink
            to="/dashboard/applications"
            icon={ClipboardList}
            title="Applications"
            desc={`${pendingApps} pending review`}
          />
        )}
        {isStaff(session.profile.role) && (
          <>
            <DashLink
              to="/dashboard/groups"
              icon={Users}
              title="Manage groups"
              desc="View and manage youth groups"
            />
            <DashLink
              to="/dashboard/documents"
              icon={FileText}
              title="Documents"
              desc="Constitutions & certificates"
            />
          </>
        )}
        {session.profile.role === "group_leader" && (
          <DashLink
            to="/dashboard/my-group"
            icon={TrendingUp}
            title="My group"
            desc="Members, savings & trainings"
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 font-display text-3xl">{value}</dd>
    </div>
  );
}

function DashLink({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to as "/dashboard"}
      className="group rounded-2xl border border-border bg-card p-6 hover:border-sun/60 hover:bg-cream/30 transition-colors"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-ink group-hover:bg-sun/30 transition-colors">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 font-display text-xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
