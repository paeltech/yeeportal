import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/auth-fns";
import { isAdmin, isStaff } from "@/lib/auth/permissions";
import { logAuditEvent } from "@/lib/audit/log";
import { assertActiveEducationLevel, assertActiveMemberRole } from "@/lib/admin/lookup-fns";
import {
  interestApplicationSchema,
  memberRegistrationSchema,
  reviewSubmissionSchema,
  savingsMeetingSchema,
  trainingCompletionSchema,
} from "@/lib/schemas/forms";
import {
  addSubmission,
  listSubmissions,
  updateSubmissionStatus,
  type FormSubmission,
} from "@/lib/forms/store";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fetchGroupBySlug } from "@/lib/data/groups";

async function persistSubmission(
  formType: FormSubmission["formType"],
  payload: Record<string, unknown>,
  opts: { groupId?: string; submittedBy?: string },
): Promise<FormSubmission> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("form_submissions")
        .insert({
          form_type: formType,
          payload,
          group_id: opts.groupId ?? null,
          submitted_by: opts.submittedBy ?? null,
        })
        .select("*")
        .single();
      if (!error && data) {
        return {
          id: data.id,
          formType: data.form_type,
          status: data.status,
          payload: data.payload as Record<string, unknown>,
          groupId: data.group_id,
          submittedBy: data.submitted_by,
          createdAt: data.created_at,
          reviewNotes: data.review_notes,
        };
      }
    }
  }

  return addSubmission({
    formType,
    payload,
    groupId: opts.groupId ?? null,
    submittedBy: opts.submittedBy ?? null,
  });
}

async function fetchSubmissions(): Promise<FormSubmission[]> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("form_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((row) => ({
          id: row.id,
          formType: row.form_type,
          status: row.status,
          payload: row.payload as Record<string, unknown>,
          groupId: row.group_id,
          submittedBy: row.submitted_by,
          createdAt: row.created_at,
          reviewNotes: row.review_notes,
        }));
      }
    }
  }
  return listSubmissions();
}

export const submitInterestApplication = createServerFn({ method: "POST" })
  .validator((data: unknown) => interestApplicationSchema.parse(data))
  .handler(async ({ data }) => {
    const submission = await persistSubmission("interest_application", data, {});
    await logAuditEvent({
      action: "form.submit",
      entityType: "form_submission",
      entityId: submission.id,
      metadata: { formType: "interest_application" },
    });
    return { id: submission.id, message: "Application received. We'll be in touch soon." };
  });

export const submitMemberRegistration = createServerFn({ method: "POST" })
  .validator((data: unknown) => memberRegistrationSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    if (!session || !isStaff(session.profile.role)) {
      throw new Error("Unauthorized");
    }

    let groupId = data.groupId;
    if (!groupId && data.groupSlug) {
      const group = await fetchGroupBySlug(data.groupSlug);
      groupId = group?.id;
    }

    await assertActiveMemberRole(data.memberRole);
    await assertActiveEducationLevel(data.education);

    const admin = createSupabaseAdminClient();
    if (isSupabaseConfigured() && admin && groupId) {
      const { error } = await admin.from("group_members").insert({
        group_id: groupId,
        full_name: data.fullName,
        age: data.age,
        sex: data.sex,
        member_role: data.memberRole,
        education: data.education,
        contribution_amount: data.contributionAmount,
        contribution_display: `TZS ${data.contributionAmount}K`,
      });
      if (error) throw new Error(error.message);
    }

    const submission = await persistSubmission("member_registration", data, {
      groupId: groupId ?? undefined,
      submittedBy: session.userId,
    });

    await logAuditEvent({
      actorId: session.userId,
      action: "member.register",
      entityType: "group_member",
      entityId: submission.id,
    });

    return { id: submission.id };
  });

export const submitSavingsMeeting = createServerFn({ method: "POST" })
  .validator((data: unknown) => savingsMeetingSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    if (!session) throw new Error("Unauthorized");

    const admin = createSupabaseAdminClient();
    if (isSupabaseConfigured() && admin) {
      const { error } = await admin.from("savings_records").insert({
        group_id: data.groupId,
        meeting_date: data.meetingDate,
        amount: data.amount,
        notes: data.notes ?? null,
        recorded_by: session.userId,
      });
      if (error) throw new Error(error.message);
    }

    const submission = await persistSubmission("savings_meeting", data, {
      groupId: data.groupId,
      submittedBy: session.userId,
    });

    return { id: submission.id };
  });

export const submitTrainingCompletion = createServerFn({ method: "POST" })
  .validator((data: unknown) => trainingCompletionSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    if (!session || !isStaff(session.profile.role)) {
      throw new Error("Unauthorized");
    }

    const admin = createSupabaseAdminClient();
    if (isSupabaseConfigured() && admin) {
      let { data: module } = await admin
        .from("training_modules")
        .select("id")
        .eq("name", data.moduleName)
        .maybeSingle();

      if (!module) {
        const { data: created } = await admin
          .from("training_modules")
          .insert({ name: data.moduleName })
          .select("id")
          .single();
        module = created;
      }

      if (module) {
        await admin.from("training_completions").upsert({
          group_id: data.groupId,
          module_id: module.id,
          members_completed: data.membersCompleted,
          completed_at: data.completedAt,
          recorded_by: session.userId,
        });
      }
    }

    const submission = await persistSubmission("training_completion", data, {
      groupId: data.groupId,
      submittedBy: session.userId,
    });

    return { id: submission.id };
  });

export const getFormSubmissions = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuthSession();
  if (!session || !isAdmin(session.profile.role)) {
    throw new Error("Unauthorized");
  }
  return fetchSubmissions();
});

export const reviewFormSubmission = createServerFn({ method: "POST" })
  .validator((data: unknown) => reviewSubmissionSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    if (!session || !isAdmin(session.profile.role)) {
      throw new Error("Unauthorized");
    }

    if (isSupabaseConfigured()) {
      const admin = createSupabaseAdminClient();
      if (admin) {
        const { error } = await admin
          .from("form_submissions")
          .update({
            status: data.status,
            review_notes: data.reviewNotes ?? null,
            reviewed_by: session.userId,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", data.id);
        if (error) throw new Error(error.message);
      }
    } else {
      updateSubmissionStatus(data.id, data.status, data.reviewNotes);
    }

    await logAuditEvent({
      actorId: session.userId,
      action: `form.${data.status}`,
      entityType: "form_submission",
      entityId: data.id,
    });

    return { success: true };
  });

export const getPendingApplicationCount = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuthSession();
  if (!session || !isAdmin(session.profile.role)) return 0;
  const subs = await fetchSubmissions();
  return subs.filter((s) => s.formType === "interest_application" && s.status === "pending").length;
});
