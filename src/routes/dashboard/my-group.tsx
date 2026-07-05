import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchGroupDetail, fetchAllGroups } from "@/lib/data/groups";
import { repoGetGroupDocuments } from "@/lib/documents/repository";
import { getAuthSession } from "@/lib/auth/auth-fns";
import { useDashboardSession } from "@/routes/dashboard";

export const Route = createFileRoute("/dashboard/my-group")({
  loader: async () => {
    const session = await getAuthSession();
    let slug: string | null = null;

    if (session?.profile.groupId) {
      const groups = await fetchAllGroups();
      const match = groups.find((g) => g.id === session.profile.groupId);
      slug = match?.slug ?? groups[0]?.slug ?? null;
    } else {
      const groups = await fetchAllGroups();
      slug = groups[0]?.slug ?? null;
    }

    if (!slug) return { detail: null, documents: [], groupSlug: null };

    const detail = await fetchGroupDetail(slug);
    const documents = await repoGetGroupDocuments(slug);
    return { detail, documents, groupSlug: slug };
  },
  component: MyGroupPage,
});

function MyGroupPage() {
  const { detail, documents, groupSlug } = Route.useLoaderData();
  const session = useDashboardSession();

  if (!detail) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-4xl">My group</h1>
        <p className="text-muted-foreground">
          No group is assigned to your profile yet. Contact a programme manager to link your account
          to a group.
        </p>
        <p className="text-sm text-muted-foreground">
          Signed in as {session.profile.fullName} ({session.profile.email})
        </p>
      </div>
    );
  }

  const { group, members, meta } = detail;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-clay">Group leader</p>
        <h1 className="mt-2 font-display text-4xl">{group.name}</h1>
        <p className="mt-2 text-muted-foreground">
          {group.ward} · {group.focus} · {group.members} members
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Savings" value={group.savings} />
        <MiniStat label="Readiness" value={`${group.readiness}%`} />
        <MiniStat label="Meeting" value={meta.meetingDay} />
      </dl>

      <section>
        <h2 className="font-display text-2xl mb-4">Members ({members.length})</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-5 py-3 font-medium">{m.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.role}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.contribution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {documents.length > 0 && (
        <section>
          <h2 className="font-display text-2xl mb-4">Documents</h2>
          <ul className="space-y-2">
            {documents.map((d) => (
              <li key={d.id} className="text-sm">
                {d.title}
              </li>
            ))}
          </ul>
        </section>
      )}

      {groupSlug && (
        <Link
          to="/groups/$groupId"
          params={{ groupId: groupSlug }}
          className="inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
        >
          View public page
        </Link>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 font-display text-2xl">{value}</dd>
    </div>
  );
}
