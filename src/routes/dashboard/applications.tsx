import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { getFormSubmissions, reviewFormSubmission } from "@/lib/forms/form-fns";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => getFormSubmissions(),
  });

  const reviewMutation = useMutation({
    mutationFn: reviewFormSubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application updated");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Review failed"),
  });

  const interestApps = submissions.filter((s) => s.formType === "interest_application");

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-clay">Review queue</p>
        <h1 className="mt-2 font-display text-4xl">Applications</h1>
        <p className="mt-2 text-muted-foreground">
          Review and approve interest applications from the public apply form.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      ) : interestApps.length === 0 ? (
        <p className="text-muted-foreground">No applications yet.</p>
      ) : (
        <div className="space-y-4">
          {interestApps.map((app) => {
            const p = app.payload as Record<string, string>;
            return (
              <article key={app.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-xl">{p.fullName}</h2>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {p.email} · {p.phone} · {p.ward} · Age {p.age}
                    </p>
                    <p className="mt-1 text-sm">
                      <span className="font-medium">Focus:</span> {p.focusArea}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">{p.motivation}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Submitted {new Date(app.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {app.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          reviewMutation.mutate({
                            data: { id: app.id, status: "approved" },
                          })
                        }
                        disabled={reviewMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          reviewMutation.mutate({
                            data: { id: app.id, status: "rejected" },
                          })
                        }
                        disabled={reviewMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: "bg-sun/30 text-ink",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${colors[status as keyof typeof colors] ?? ""}`}
    >
      {status}
    </span>
  );
}
