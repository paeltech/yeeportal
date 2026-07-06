import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteGroup, listGroupsAdmin } from "@/lib/admin/admin-fns";

export const Route = createFileRoute("/dashboard/groups/")({
  component: DashboardGroupsPage,
});

function DashboardGroupsPage() {
  const queryClient = useQueryClient();

  const {
    data: groups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-groups"],
    queryFn: () => listGroupsAdmin(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      toast.success("Group deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-clay">Operations</p>
          <h1 className="mt-2 font-display text-4xl">Groups</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage youth groups across all wards — members, trainings, and savings.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/dashboard/groups/new">
            <Plus className="mr-2 h-4 w-4" />
            Add group
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading groups…
        </div>
      ) : error ? (
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Failed to load groups"}
        </p>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No groups yet.</p>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/dashboard/groups/new">Create your first group</Link>
          </Button>
        </div>
      ) : (
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
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className="border-t border-border">
                  <td className="px-5 py-3 font-medium">{g.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{g.wardName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{g.focus}</td>
                  <td className="px-5 py-3 text-muted-foreground">{g.memberCount}</td>
                  <td className="px-5 py-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-sun/30 text-xs font-bold">
                      {g.tier}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{g.readinessScore}%</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={g.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to="/dashboard/groups/$groupId"
                        params={{ groupId: g.id }}
                        className="inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold text-ink underline decoration-sun decoration-2 underline-offset-[6px] hover:bg-secondary"
                      >
                        Manage
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${g.name}`}
                        onClick={() => {
                          if (confirm(`Delete "${g.name}" and all related records?`)) {
                            deleteMutation.mutate({ data: { id: g.id } });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "active"
      ? "bg-green-100 text-green-800"
      : status === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}
    >
      {status}
    </span>
  );
}
