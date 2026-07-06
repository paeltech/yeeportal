import { createServerFn } from "@tanstack/react-start";
import { getAuthSession } from "@/lib/auth/auth-fns";
import { isStaff } from "@/lib/auth/permissions";
import { logAuditEvent } from "@/lib/audit/log";
import { slugify } from "@/lib/groups-data";
import {
  groupIdSchema,
  groupUpsertSchema,
  idSchema,
  memberUpsertSchema,
  savingsRecordSchema,
  trainingCompletionSchema,
} from "@/lib/schemas/admin";
import { assertActiveEducationLevel, assertActiveMemberRole } from "@/lib/admin/lookup-fns";

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

function formatSavings(total: number): string {
  if (total >= 1_000_000) return `TZS ${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `TZS ${Math.round(total / 1_000)}K`;
  return `TZS ${total}`;
}

async function syncMemberCount(groupId: string) {
  const db = await admin();
  const { count } = await db
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);
  await db
    .from("groups")
    .update({ member_count: count ?? 0 })
    .eq("id", groupId);
}

function mapGroup(row: Record<string, unknown>) {
  const ward = row.wards as { id: string; name: string } | null;
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    wardId: row.ward_id as string,
    wardName: ward?.name ?? "",
    focus: row.focus as string,
    memberCount: row.member_count as number,
    savingsTotal: Number(row.savings_total ?? 0),
    savingsDisplay: row.savings_display as string,
    readinessScore: row.readiness_score as number,
    tier: row.tier as "A" | "B" | "C",
    cycleNumber: row.cycle_number as number,
    cycleLabel: row.cycle_label as string,
    repaymentRate: row.repayment_rate as string,
    status: row.status as string,
    mentorName: (row.mentor_name as string) ?? "",
    meetingDay: (row.meeting_day as string) ?? "",
    formedYear: (row.formed_year as number) ?? null,
    contactPhone: (row.contact_phone as string) ?? "",
    loanBalanceDisplay: (row.loan_balance_display as string) ?? "",
    nextDisbursement: (row.next_disbursement as string) ?? "",
  };
}

export const listWards = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff();
  const db = await admin();
  const { data, error } = await db.from("wards").select("id, name, district").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listGroupsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff();
  const db = await admin();
  const { data, error } = await db.from("groups").select("*, wards(id, name)").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapGroup);
});

export const getGroupAdmin = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid input");
    if ("id" in data && data.id) return { id: String((data as { id: string }).id) };
    if ("slug" in data && data.slug) return { slug: String((data as { slug: string }).slug) };
    throw new Error("id or slug required");
  })
  .handler(async ({ data }) => {
    await requireStaff();
    const db = await admin();
    let query = db.from("groups").select("*, wards(id, name)");
    if ("id" in data) query = query.eq("id", data.id);
    else query = query.eq("slug", data.slug!);
    const { data: row, error } = await query.single();
    if (error) throw new Error(error.message);
    return mapGroup(row);
  });

export const saveGroup = createServerFn({ method: "POST" })
  .validator((data: unknown) => groupUpsertSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    const db = await admin();
    const slug = slugify(data.name);
    const savingsDisplay = data.savingsDisplay ?? formatSavings(data.savingsTotal);
    const cycleLabel = data.cycleLabel ?? `Cycle ${data.cycleNumber}`;

    const payload = {
      name: data.name,
      slug,
      ward_id: data.wardId,
      focus: data.focus,
      tier: data.tier,
      cycle_number: data.cycleNumber,
      cycle_label: cycleLabel,
      savings_total: data.savingsTotal,
      savings_display: savingsDisplay,
      readiness_score: data.readinessScore,
      repayment_rate: data.repaymentRate,
      status: data.status,
      mentor_name: data.mentorName ?? null,
      meeting_day: data.meetingDay ?? null,
      formed_year: data.formedYear ?? null,
      contact_phone: data.contactPhone ?? null,
      loan_balance_display: data.loanBalanceDisplay ?? null,
      next_disbursement: data.nextDisbursement ?? null,
    };

    if (data.id) {
      const { data: row, error } = await db
        .from("groups")
        .update(payload)
        .eq("id", data.id)
        .select("*, wards(id, name)")
        .single();
      if (error) throw new Error(error.message);
      await logAuditEvent({
        actorId: session.userId,
        action: "group.update",
        entityType: "group",
        entityId: data.id,
      });
      return mapGroup(row);
    }

    const { data: row, error } = await db
      .from("groups")
      .insert({ ...payload, member_count: 0 })
      .select("*, wards(id, name)")
      .single();
    if (error) throw new Error(error.message);
    await logAuditEvent({
      actorId: session.userId,
      action: "group.create",
      entityType: "group",
      entityId: row.id,
    });
    return mapGroup(row);
  });

export const deleteGroup = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    const db = await admin();
    const { error } = await db.from("groups").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAuditEvent({
      actorId: session.userId,
      action: "group.delete",
      entityType: "group",
      entityId: data.id,
    });
    return { success: true };
  });

export const listMembers = createServerFn({ method: "GET" })
  .validator((data: unknown) => groupIdSchema.parse(data))
  .handler(async ({ data }) => {
    await requireStaff();
    const db = await admin();
    const { data: rows, error } = await db
      .from("group_members")
      .select("*")
      .eq("group_id", data.groupId)
      .order("full_name");
    if (error) throw new Error(error.message);
    return (rows ?? []).map((m) => ({
      id: m.id,
      groupId: m.group_id,
      fullName: m.full_name,
      age: m.age,
      sex: m.sex as "F" | "M",
      memberRole: m.member_role,
      education: m.education,
      contributionAmount: Math.round(Number(m.contribution_amount) / 1000),
      contributionDisplay: m.contribution_display,
    }));
  });

export const saveMember = createServerFn({ method: "POST" })
  .validator((data: unknown) => memberUpsertSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    await assertActiveMemberRole(data.memberRole);
    await assertActiveEducationLevel(data.education);
    const db = await admin();
    const contributionDisplay = `TZS ${data.contributionAmount}K`;
    const payload = {
      group_id: data.groupId,
      full_name: data.fullName,
      age: data.age,
      sex: data.sex,
      member_role: data.memberRole,
      education: data.education,
      contribution_amount: data.contributionAmount * 1000,
      contribution_display: contributionDisplay,
    };

    if (data.id) {
      const { data: row, error } = await db
        .from("group_members")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      await syncMemberCount(data.groupId);
      return row;
    }

    const { data: row, error } = await db
      .from("group_members")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await syncMemberCount(data.groupId);
    await logAuditEvent({
      actorId: session.userId,
      action: "member.create",
      entityType: "group_member",
      entityId: row.id,
    });
    return row;
  });

export const deleteMember = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    const db = await admin();
    const { data: member } = await db
      .from("group_members")
      .select("group_id")
      .eq("id", data.id)
      .single();
    const { error } = await db.from("group_members").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (member) await syncMemberCount(member.group_id);
    await logAuditEvent({
      actorId: session.userId,
      action: "member.delete",
      entityType: "group_member",
      entityId: data.id,
    });
    return { success: true };
  });

export const listTrainingModules = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff();
  const db = await admin();
  const { data, error } = await db.from("training_modules").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listTrainingCompletions = createServerFn({ method: "GET" })
  .validator((data: unknown) => groupIdSchema.parse(data))
  .handler(async ({ data }) => {
    await requireStaff();
    const db = await admin();
    const { data: rows, error } = await db
      .from("training_completions")
      .select("*, training_modules(name)")
      .eq("group_id", data.groupId)
      .order("completed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      groupId: r.group_id,
      moduleId: r.module_id,
      moduleName: (r.training_modules as { name: string })?.name ?? "",
      membersCompleted: r.members_completed,
      completedAt: r.completed_at,
    }));
  });

export const saveTrainingCompletion = createServerFn({ method: "POST" })
  .validator((data: unknown) => trainingCompletionSchema.parse(data))
  .handler(async ({ data }) => {
    await requireStaff();
    const db = await admin();
    const payload = {
      group_id: data.groupId,
      module_id: data.moduleId,
      members_completed: data.membersCompleted,
      completed_at: data.completedAt,
    };
    if (data.id) {
      const { error } = await db.from("training_completions").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await db
      .from("training_completions")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteTrainingCompletion = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    await requireStaff();
    const db = await admin();
    const { error } = await db.from("training_completions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const listSavingsRecords = createServerFn({ method: "GET" })
  .validator((data: unknown) => groupIdSchema.parse(data))
  .handler(async ({ data }) => {
    await requireStaff();
    const db = await admin();
    const { data: rows, error } = await db
      .from("savings_records")
      .select("*")
      .eq("group_id", data.groupId)
      .order("meeting_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      groupId: r.group_id,
      meetingDate: r.meeting_date,
      amount: Number(r.amount),
      notes: r.notes ?? "",
    }));
  });

export const saveSavingsRecord = createServerFn({ method: "POST" })
  .validator((data: unknown) => savingsRecordSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    const db = await admin();
    const payload = {
      group_id: data.groupId,
      meeting_date: data.meetingDate,
      amount: data.amount,
      notes: data.notes ?? null,
      recorded_by: session.userId,
    };
    if (data.id) {
      const { error } = await db.from("savings_records").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await db
      .from("savings_records")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteSavingsRecord = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    await requireStaff();
    const db = await admin();
    const { error } = await db.from("savings_records").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
