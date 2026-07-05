import { createFileRoute } from "@tanstack/react-router";
import { useDashboardSession } from "@/routes/dashboard";
import { ROLE_LABELS } from "@/lib/auth/types";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const session = useDashboardSession();
  const { profile } = session;

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <p className="eyebrow text-clay">Account</p>
        <h1 className="mt-2 font-display text-4xl">My profile</h1>
      </div>

      <dl className="rounded-2xl border border-border bg-card divide-y divide-border">
        <ProfileRow label="Name" value={profile.fullName} />
        <ProfileRow label="Email" value={profile.email} />
        <ProfileRow label="Role" value={ROLE_LABELS[profile.role]} />
        {profile.phone && <ProfileRow label="Phone" value={profile.phone} />}
      </dl>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
