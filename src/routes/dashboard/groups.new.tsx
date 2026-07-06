import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GroupForm, type GroupFormValues } from "@/components/admin/group-form";
import { listWards, saveGroup } from "@/lib/admin/admin-fns";

export const Route = createFileRoute("/dashboard/groups/new")({
  loader: async () => ({ wards: await listWards() }),
  component: NewGroupPage,
});

const emptyForm = (wardId: string): GroupFormValues => ({
  name: "",
  wardId,
  focus: "",
  tier: "C",
  cycleNumber: 1,
  readinessScore: 50,
  savingsTotal: 0,
  repaymentRate: "100%",
  status: "active",
  mentorName: "",
  meetingDay: "Saturday",
  formedYear: String(new Date().getFullYear()),
  contactPhone: "",
  loanBalanceDisplay: "",
  nextDisbursement: "",
});

function NewGroupPage() {
  const { wards } = Route.useLoaderData();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => emptyForm(wards[0]?.id ?? ""));

  const mutation = useMutation({
    mutationFn: saveGroup,
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      toast.success(`Created ${group.name}`);
      router.navigate({
        to: "/dashboard/groups/$groupId",
        params: { groupId: group.id },
      });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Create failed"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      data: {
        name: form.name,
        wardId: form.wardId,
        focus: form.focus,
        tier: form.tier,
        cycleNumber: form.cycleNumber,
        savingsTotal: form.savingsTotal,
        readinessScore: form.readinessScore,
        repaymentRate: form.repaymentRate,
        status: form.status,
        mentorName: form.mentorName || undefined,
        meetingDay: form.meetingDay || undefined,
        formedYear: form.formedYear ? Number(form.formedYear) : undefined,
        contactPhone: form.contactPhone || undefined,
        loanBalanceDisplay: form.loanBalanceDisplay || undefined,
        nextDisbursement: form.nextDisbursement || undefined,
      },
    });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link
          to="/dashboard/groups"
          className="text-sm font-semibold text-muted-foreground hover:text-ink"
        >
          ← Back to groups
        </Link>
        <p className="eyebrow text-clay mt-4">New group</p>
        <h1 className="mt-2 font-display text-4xl">Register a group</h1>
      </div>
      <GroupForm
        values={form}
        wards={wards}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitLabel={mutation.isPending ? "Creating…" : "Create group"}
        loading={mutation.isPending}
      />
      {mutation.isPending && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving…
        </div>
      )}
    </div>
  );
}
