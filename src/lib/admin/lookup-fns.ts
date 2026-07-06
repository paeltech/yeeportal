import { createServerFn } from "@tanstack/react-start";
import { getAuthSession } from "@/lib/auth/auth-fns";
import { isStaff } from "@/lib/auth/permissions";
import { logAuditEvent } from "@/lib/audit/log";
import { idSchema, lookupListSchema, lookupOptionSchema } from "@/lib/schemas/admin";

type LookupRow = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

function mapLookup(row: LookupRow) {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

async function requireStaff() {
  const session = await getAuthSession();
  if (!session || !isStaff(session.profile.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function admin() {
  const { createSupabaseAdminClient } = await import("@/lib/supabase/server");
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Database unavailable");
  return client;
}

async function listLookup(table: "member_roles" | "education_levels", includeInactive: boolean) {
  const db = await admin();
  let query = db.from(table).select("*").order("sort_order").order("name");
  if (!includeInactive) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapLookup);
}

async function saveLookup(
  table: "member_roles" | "education_levels",
  memberColumn: "member_role" | "education",
  entityType: string,
  data: { id?: string; name: string; sortOrder: number; isActive: boolean },
  session: { userId: string },
) {
  const db = await admin();
  const payload = {
    name: data.name.trim(),
    sort_order: data.sortOrder,
    is_active: data.isActive,
  };

  if (data.id) {
    const { data: existing, error: fetchError } = await db
      .from(table)
      .select("name")
      .eq("id", data.id)
      .single();
    if (fetchError) throw new Error(fetchError.message);

    const { data: row, error } = await db
      .from(table)
      .update(payload)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    if (existing.name !== payload.name) {
      await db
        .from("group_members")
        .update({ [memberColumn]: payload.name })
        .eq(memberColumn, existing.name);
    }

    await logAuditEvent({
      actorId: session.userId,
      action: `${entityType}.update`,
      entityType,
      entityId: data.id,
    });
    return mapLookup(row);
  }

  const { data: row, error } = await db.from(table).insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  await logAuditEvent({
    actorId: session.userId,
    action: `${entityType}.create`,
    entityType,
    entityId: row.id,
  });
  return mapLookup(row);
}

async function deleteLookup(
  table: "member_roles" | "education_levels",
  memberColumn: "member_role" | "education",
  entityType: string,
  id: string,
  session: { userId: string },
) {
  const db = await admin();
  const { data: option, error: fetchError } = await db
    .from(table)
    .select("name")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { count } = await db
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq(memberColumn, option.name);
  if (count && count > 0) {
    throw new Error(
      `"${option.name}" is used by ${count} member(s). Deactivate it instead of deleting.`,
    );
  }

  const { error } = await db.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAuditEvent({
    actorId: session.userId,
    action: `${entityType}.delete`,
    entityType,
    entityId: id,
  });
  return { success: true };
}

export const listMemberRoles = createServerFn({ method: "GET" })
  .validator((data: unknown) => lookupListSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    if (data.includeInactive) await requireStaff();
    return listLookup("member_roles", data.includeInactive);
  });

export const listEducationLevels = createServerFn({ method: "GET" })
  .validator((data: unknown) => lookupListSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    if (data.includeInactive) await requireStaff();
    return listLookup("education_levels", data.includeInactive);
  });

export const saveMemberRole = createServerFn({ method: "POST" })
  .validator((data: unknown) => lookupOptionSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    return saveLookup("member_roles", "member_role", "member_role", data, session);
  });

export const saveEducationLevel = createServerFn({ method: "POST" })
  .validator((data: unknown) => lookupOptionSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    return saveLookup("education_levels", "education", "education_level", data, session);
  });

export const deleteMemberRole = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    return deleteLookup("member_roles", "member_role", "member_role", data.id, session);
  });

export const deleteEducationLevel = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    return deleteLookup("education_levels", "education", "education_level", data.id, session);
  });

export async function assertActiveMemberRole(name: string) {
  const db = await admin();
  const { data } = await db
    .from("member_roles")
    .select("id")
    .eq("name", name)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) throw new Error("Select a valid member role");
}

export async function assertActiveEducationLevel(name: string) {
  const db = await admin();
  const { data } = await db
    .from("education_levels")
    .select("id")
    .eq("name", name)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) throw new Error("Select a valid education level");
}
