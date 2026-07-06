import { createFileRoute } from "@tanstack/react-router";
import { LookupOptionManager } from "@/components/admin/lookup-option-manager";
import {
  deleteEducationLevel,
  deleteMemberRole,
  listEducationLevels,
  listMemberRoles,
  saveEducationLevel,
  saveMemberRole,
} from "@/lib/admin/lookup-fns";

export const Route = createFileRoute("/dashboard/member-options")({
  component: MemberOptionsPage,
});

function MemberOptionsPage() {
  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow text-clay">Configuration</p>
        <h1 className="mt-2 font-display text-4xl">Member options</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Standardize roles and education levels used when registering group members. Changes apply
          to all member forms across the dashboard.
        </p>
      </div>

      <LookupOptionManager
        title="Member roles"
        description="Leadership and membership roles shown in the member registration form."
        queryKey="member-roles-admin"
        listFn={listMemberRoles}
        saveFn={saveMemberRole}
        deleteFn={deleteMemberRole}
      />

      <LookupOptionManager
        title="Education levels"
        description="Education options for youth group members."
        queryKey="education-levels-admin"
        listFn={listEducationLevels}
        saveFn={saveEducationLevel}
        deleteFn={deleteEducationLevel}
      />

      <p className="text-sm text-muted-foreground">
        Renaming an option updates existing member records automatically. Options in use cannot be
        deleted — deactivate them instead.
      </p>
    </div>
  );
}
