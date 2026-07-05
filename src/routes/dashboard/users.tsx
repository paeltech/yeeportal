import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchAllProfiles, updateUserRole } from "@/lib/auth/auth-fns";
import { ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/users")({
  component: UsersPage,
});

function UsersPage() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchAllProfiles(),
  });

  const updateMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role updated");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-clay">Access control</p>
        <h1 className="mt-2 font-display text-4xl">User management</h1>
        <p className="mt-2 text-muted-foreground">
          Assign roles to programme staff, field officers, and group leaders.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading users…
        </div>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground">
          No users found. Connect Supabase and create accounts to manage roles here.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onUpdate={(role) => updateMutation.mutate({ data: { userId: user.id, role } })}
                  loading={updateMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  onUpdate,
  loading,
}: {
  user: { id: string; fullName: string; email: string; role: UserRole };
  onUpdate: (role: UserRole) => void;
  loading: boolean;
}) {
  const [role, setRole] = useState(user.role);

  return (
    <tr className="border-t border-border">
      <td className="px-5 py-3 font-medium">{user.fullName}</td>
      <td className="px-5 py-3 text-muted-foreground">{user.email}</td>
      <td className="px-5 py-3">
        <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-5 py-3 text-right">
        <Button size="sm" disabled={loading || role === user.role} onClick={() => onUpdate(role)}>
          Save
        </Button>
      </td>
    </tr>
  );
}
