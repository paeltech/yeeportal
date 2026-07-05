export type FormSubmission = {
  id: string;
  formType:
    | "interest_application"
    | "group_registration"
    | "member_registration"
    | "savings_meeting"
    | "training_completion";
  status: "pending" | "approved" | "rejected";
  payload: Record<string, unknown>;
  groupId: string | null;
  submittedBy: string | null;
  createdAt: string;
  reviewNotes: string | null;
};

const submissions = new Map<string, FormSubmission>();

export function listSubmissions(filter?: {
  status?: FormSubmission["status"];
  formType?: FormSubmission["formType"];
}): FormSubmission[] {
  let list = [...submissions.values()];
  if (filter?.status) list = list.filter((s) => s.status === filter.status);
  if (filter?.formType) list = list.filter((s) => s.formType === filter.formType);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSubmission(id: string): FormSubmission | undefined {
  return submissions.get(id);
}

export function addSubmission(
  sub: Omit<FormSubmission, "id" | "createdAt" | "status" | "reviewNotes">,
): FormSubmission {
  const record: FormSubmission = {
    ...sub,
    id: crypto.randomUUID(),
    status: "pending",
    reviewNotes: null,
    createdAt: new Date().toISOString(),
  };
  submissions.set(record.id, record);
  return record;
}

export function updateSubmissionStatus(
  id: string,
  status: "approved" | "rejected",
  reviewNotes?: string,
): FormSubmission | undefined {
  const sub = submissions.get(id);
  if (!sub) return undefined;
  const updated = { ...sub, status, reviewNotes: reviewNotes ?? null };
  submissions.set(id, updated);
  return updated;
}
