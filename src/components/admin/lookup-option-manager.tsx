import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";

type LookupOption = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type LookupOptionManagerProps = {
  title: string;
  description: string;
  queryKey: string;
  listFn: (opts: { data: { includeInactive: boolean } }) => Promise<LookupOption[]>;
  saveFn: (opts: {
    data: { id?: string; name: string; sortOrder: number; isActive: boolean };
  }) => Promise<LookupOption>;
  deleteFn: (opts: { data: { id: string } }) => Promise<{ success: boolean }>;
};

export function LookupOptionManager({
  title,
  description,
  queryKey,
  listFn,
  saveFn,
  deleteFn,
}: LookupOptionManagerProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LookupOption | null>(null);
  const [form, setForm] = useState({ name: "", sortOrder: 0, isActive: true });

  const { data: options = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => listFn({ data: { includeInactive: true } }),
  });

  const saveMutation = useMutation({
    mutationFn: saveFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ["member-roles"] });
      queryClient.invalidateQueries({ queryKey: ["education-levels"] });
      toast.success("Option saved");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ["member-roles"] });
      queryClient.invalidateQueries({ queryKey: ["education-levels"] });
      toast.success("Option removed");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", sortOrder: options.length + 1, isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (option: LookupOption) => {
    setEditing(option);
    setForm({
      name: option.name,
      sortOrder: option.sortOrder,
      isActive: option.isActive,
    });
    setDialogOpen(true);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Add option
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {options.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    No options yet.
                  </td>
                </tr>
              ) : (
                options.map((option) => (
                  <tr key={option.id} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{option.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{option.sortOrder}</td>
                    <td className="px-5 py-3">
                      {option.isActive ? (
                        <span className="text-xs font-semibold text-green-700">Yes</span>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(option)}
                          aria-label={`Edit ${option.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Delete "${option.name}"?`)) {
                              deleteMutation.mutate({ data: { id: option.id } });
                            }
                          }}
                          aria-label={`Delete ${option.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit option" : "Add option"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate({
                data: {
                  id: editing?.id,
                  name: form.name,
                  sortOrder: form.sortOrder,
                  isActive: form.isActive,
                },
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="lookup-name">Name</Label>
              <Input
                id="lookup-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lookup-order">Sort order</Label>
              <Input
                id="lookup-order"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <Label htmlFor="lookup-active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive options are hidden from member forms
                </p>
              </div>
              <Switch
                id="lookup-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
            </div>
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
    </section>
  );
}
