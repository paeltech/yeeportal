import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GroupForm, groupToFormValues, type GroupFormValues } from "@/components/admin/group-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deleteGroup,
  deleteMember,
  deleteSavingsRecord,
  deleteTrainingCompletion,
  getGroupAdmin,
  listMembers,
  listSavingsRecords,
  listTrainingCompletions,
  listTrainingModules,
  listWards,
  saveGroup,
  saveMember,
  saveSavingsRecord,
  saveTrainingCompletion,
} from "@/lib/admin/admin-fns";
import { listEducationLevels, listMemberRoles } from "@/lib/admin/lookup-fns";
import { DocumentsManager } from "@/components/admin/documents-manager";

export const Route = createFileRoute("/dashboard/groups/$groupId")({
  loader: async ({ params }) => {
    const [group, wards] = await Promise.all([
      getGroupAdmin({ data: { id: params.groupId } }),
      listWards(),
    ]);
    return { group, wards };
  },
  component: GroupAdminPage,
});

function GroupAdminPage() {
  const { groupId } = Route.useParams();
  const { group, wards } = Route.useLoaderData();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("details");
  const [form, setForm] = useState<GroupFormValues>(() => groupToFormValues(group));

  const invalidateGroup = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
    router.invalidate();
  };

  const saveGroupMutation = useMutation({
    mutationFn: saveGroup,
    onSuccess: () => {
      toast.success("Group saved");
      invalidateGroup();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      toast.success("Group deleted");
      router.navigate({ to: "/dashboard/groups" });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    saveGroupMutation.mutate({
      data: {
        id: group.id,
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/dashboard/groups"
            className="text-sm font-semibold text-muted-foreground hover:text-ink"
          >
            ← Back to groups
          </Link>
          <p className="eyebrow text-clay mt-4">{group.wardName}</p>
          <h1 className="mt-2 font-display text-4xl">{group.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {group.memberCount} members · Tier {group.tier} · {group.readinessScore}% readiness
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="rounded-full">
            <Link to="/groups/$groupId" params={{ groupId: group.slug }}>
              Public page
            </Link>
          </Button>
          <Button
            variant="destructive"
            className="rounded-full"
            disabled={deleteGroupMutation.isPending}
            onClick={() => {
              if (confirm(`Delete "${group.name}" and all related records?`)) {
                deleteGroupMutation.mutate({ data: { id: group.id } });
              }
            }}
          >
            {deleteGroupMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="trainings">Trainings</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 max-w-3xl">
          <GroupForm
            values={form}
            wards={wards}
            onChange={setForm}
            onSubmit={handleSaveGroup}
            submitLabel={saveGroupMutation.isPending ? "Saving…" : "Save changes"}
            loading={saveGroupMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <MembersTab groupId={groupId} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsManager
            scope="group"
            groupSlug={group.slug}
            groupName={group.name}
          />
        </TabsContent>

        <TabsContent value="trainings" className="mt-6">
          <TrainingsTab groupId={groupId} />
        </TabsContent>

        <TabsContent value="savings" className="mt-6">
          <SavingsTab groupId={groupId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type MemberRow = {
  id: string;
  fullName: string;
  age: number;
  sex: "F" | "M";
  memberRole: string;
  education: string;
  contributionAmount: number;
};

function MembersTab({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MemberRow | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    age: 22,
    sex: "F" as "F" | "M",
    memberRole: "",
    education: "",
    contributionAmount: 0,
  });

  const { data: memberRoles = [] } = useQuery({
    queryKey: ["member-roles"],
    queryFn: () => listMemberRoles({ data: { includeInactive: false } }),
  });

  const { data: educationLevels = [] } = useQuery({
    queryKey: ["education-levels"],
    queryFn: () => listEducationLevels({ data: { includeInactive: false } }),
  });

  const defaultRole =
    memberRoles.find((r) => r.name === "Member")?.name ?? memberRoles[0]?.name ?? "Member";
  const defaultEducation =
    educationLevels.find((e) => e.name === "Secondary")?.name ??
    educationLevels[0]?.name ??
    "Secondary";

  const roleOptions = useMemo(() => {
    if (form.memberRole && !memberRoles.some((r) => r.name === form.memberRole)) {
      return [
        ...memberRoles,
        { id: "legacy-role", name: form.memberRole, sortOrder: 999, isActive: false },
      ];
    }
    return memberRoles;
  }, [memberRoles, form.memberRole]);

  const educationOptions = useMemo(() => {
    if (form.education && !educationLevels.some((e) => e.name === form.education)) {
      return [
        ...educationLevels,
        { id: "legacy-edu", name: form.education, sortOrder: 999, isActive: false },
      ];
    }
    return educationLevels;
  }, [educationLevels, form.education]);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin-members", groupId],
    queryFn: () => listMembers({ data: { groupId } }),
  });

  const saveMutation = useMutation({
    mutationFn: saveMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members", groupId] });
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      toast.success("Member saved");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members", groupId] });
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      toast.success("Member removed");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      fullName: "",
      age: 22,
      sex: "F",
      memberRole: defaultRole,
      education: defaultEducation,
      contributionAmount: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (m: MemberRow) => {
    setEditing(m);
    setForm({
      fullName: m.fullName,
      age: m.age,
      sex: m.sex,
      memberRole: m.memberRole,
      education: m.education,
      contributionAmount: m.contributionAmount,
    });
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Add member
        </Button>
      </div>
      {isLoading ? (
        <LoaderRow />
      ) : (
        <DataTable
          headers={["Name", "Age", "Sex", "Role", "Education", "Contribution", ""]}
          rows={members.map((m) => [
            m.fullName,
            String(m.age),
            m.sex,
            m.memberRole,
            m.education,
            m.contributionDisplay,
            <RowActions
              key={m.id}
              onEdit={() => openEdit(m)}
              onDelete={() => {
                if (confirm(`Remove ${m.fullName}?`)) {
                  deleteMutation.mutate({ data: { id: m.id } });
                }
              }}
            />,
          ])}
          emptyMessage="No members yet. Add the first member."
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit member" : "Add member"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate({
                data: {
                  id: editing?.id,
                  groupId,
                  ...form,
                },
              });
            }}
            className="space-y-4"
          >
            <Field label="Full name">
              <Input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age">
                <Input
                  type="number"
                  min={16}
                  max={35}
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) }))}
                  required
                />
              </Field>
              <Field label="Sex">
                <Select
                  value={form.sex}
                  onValueChange={(v) => setForm((f) => ({ ...f, sex: v as "F" | "M" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="M">Male</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Role">
              <Select
                value={form.memberRole || defaultRole}
                onValueChange={(v) => setForm((f) => ({ ...f, memberRole: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r.id} value={r.name}>
                      {r.name}
                      {!r.isActive ? " (inactive)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Education">
              <Select
                value={form.education || defaultEducation}
                onValueChange={(v) => setForm((f) => ({ ...f, education: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education" />
                </SelectTrigger>
                <SelectContent>
                  {educationOptions.map((e) => (
                    <SelectItem key={e.id} value={e.name}>
                      {e.name}
                      {!e.isActive ? " (inactive)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Contribution (K TZS)">
              <Input
                type="number"
                min={0}
                value={form.contributionAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contributionAmount: Number(e.target.value) }))
                }
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TrainingsTab({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState({
    moduleId: "",
    membersCompleted: 1,
    completedAt: new Date().toISOString().slice(0, 10),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["training-modules"],
    queryFn: () => listTrainingModules(),
  });

  const { data: completions = [], isLoading } = useQuery({
    queryKey: ["admin-trainings", groupId],
    queryFn: () => listTrainingCompletions({ data: { groupId } }),
  });

  const saveMutation = useMutation({
    mutationFn: saveTrainingCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainings", groupId] });
      toast.success("Training record saved");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTrainingCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainings", groupId] });
      toast.success("Training record removed");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const openCreate = () => {
    setEditingId(undefined);
    setForm({
      moduleId: modules[0]?.id ?? "",
      membersCompleted: 1,
      completedAt: new Date().toISOString().slice(0, 10),
    });
    setDialogOpen(true);
  };

  const openEdit = (c: {
    id: string;
    moduleId: string;
    membersCompleted: number;
    completedAt: string;
  }) => {
    setEditingId(c.id);
    setForm({
      moduleId: c.moduleId,
      membersCompleted: c.membersCompleted,
      completedAt: c.completedAt.slice(0, 10),
    });
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="rounded-full" disabled={modules.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Record training
        </Button>
      </div>
      {isLoading ? (
        <LoaderRow />
      ) : (
        <DataTable
          headers={["Module", "Members completed", "Date", ""]}
          rows={completions.map((c) => [
            c.moduleName,
            String(c.membersCompleted),
            c.completedAt.slice(0, 10),
            <RowActions
              key={c.id}
              onEdit={() => openEdit(c)}
              onDelete={() => {
                if (confirm("Remove this training record?")) {
                  deleteMutation.mutate({ data: { id: c.id } });
                }
              }}
            />,
          ])}
          emptyMessage="No training completions recorded."
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit training" : "Record training"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate({
                data: { id: editingId, groupId, ...form },
              });
            }}
            className="space-y-4"
          >
            <Field label="Module">
              <Select
                value={form.moduleId}
                onValueChange={(v) => setForm((f) => ({ ...f, moduleId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Members completed">
              <Input
                type="number"
                min={1}
                value={form.membersCompleted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, membersCompleted: Number(e.target.value) }))
                }
                required
              />
            </Field>
            <Field label="Completion date">
              <Input
                type="date"
                value={form.completedAt}
                onChange={(e) => setForm((f) => ({ ...f, completedAt: e.target.value }))}
                required
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SavingsTab({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState({
    meetingDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    notes: "",
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["admin-savings", groupId],
    queryFn: () => listSavingsRecords({ data: { groupId } }),
  });

  const saveMutation = useMutation({
    mutationFn: saveSavingsRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-savings", groupId] });
      toast.success("Savings record saved");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSavingsRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-savings", groupId] });
      toast.success("Savings record removed");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const openCreate = () => {
    setEditingId(undefined);
    setForm({
      meetingDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      notes: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (r: { id: string; meetingDate: string; amount: number; notes: string }) => {
    setEditingId(r.id);
    setForm({
      meetingDate: r.meetingDate.slice(0, 10),
      amount: r.amount,
      notes: r.notes,
    });
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Add savings record
        </Button>
      </div>
      {isLoading ? (
        <LoaderRow />
      ) : (
        <DataTable
          headers={["Meeting date", "Amount (TZS)", "Notes", ""]}
          rows={records.map((r) => [
            r.meetingDate.slice(0, 10),
            r.amount.toLocaleString(),
            r.notes || "—",
            <RowActions
              key={r.id}
              onEdit={() => openEdit(r)}
              onDelete={() => {
                if (confirm("Remove this savings record?")) {
                  deleteMutation.mutate({ data: { id: r.id } });
                }
              }}
            />,
          ])}
          emptyMessage="No savings records yet."
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit savings" : "Add savings record"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate({
                data: {
                  id: editingId,
                  groupId,
                  meetingDate: form.meetingDate,
                  amount: form.amount,
                  notes: form.notes || undefined,
                },
              });
            }}
            className="space-y-4"
          >
            <Field label="Meeting date">
              <Input
                type="date"
                value={form.meetingDate}
                onChange={(e) => setForm((f) => ({ ...f, meetingDate: e.target.value }))}
                required
              />
            </Field>
            <Field label="Amount (TZS)">
              <Input
                type="number"
                min={1}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                required
              />
            </Field>
            <Field label="Notes">
              <Input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function LoaderRow() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground py-8">
      <Loader2 className="h-5 w-5 animate-spin" />
      Loading…
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

function DataTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground py-8">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <tr>
            {headers.map((h) => (
              <th key={h} className={`px-5 py-3 ${h === "" ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-t border-border">
              {cells.map((cell, j) => (
                <td
                  key={j}
                  className={`px-5 py-3 ${j === cells.length - 1 ? "text-right" : j > 0 ? "text-muted-foreground" : "font-medium"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
