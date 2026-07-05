import { createFileRoute, Link } from "@tanstack/react-router";
import { slugify } from "@/lib/groups-data";
import { getGroups } from "@/lib/data/group-fns";

export const Route = createFileRoute("/dashboard/groups/")({
  loader: async () => ({ groups: await getGroups() }),
  component: DashboardGroupsPage,
});

function DashboardGroupsPage() {
  const { groups } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-clay">Operations</p>
        <h1 className="mt-2 font-display text-4xl">Groups</h1>
        <p className="mt-2 text-muted-foreground">
          Manage youth groups across all wards. Select a group to add members or record trainings.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Group</th>
              <th className="px-5 py-3">Ward</th>
              <th className="px-5 py-3">Focus</th>
              <th className="px-5 py-3">Members</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3">Readiness</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.slug} className="border-t border-border">
                <td className="px-5 py-3 font-medium">{g.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{g.ward}</td>
                <td className="px-5 py-3 text-muted-foreground">{g.focus}</td>
                <td className="px-5 py-3 text-muted-foreground">{g.members}</td>
                <td className="px-5 py-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-sun/30 text-xs font-bold">
                    {g.tier}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{g.readiness}%</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to="/groups/$groupId"
                    params={{ groupId: slugify(g.name) }}
                    className="text-sm font-semibold text-ink underline decoration-sun decoration-2 underline-offset-[6px]"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
