import { z } from "zod";

export const groupUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  wardId: z.string().uuid("Select a ward"),
  focus: z.string().min(1, "Focus is required"),
  tier: z.enum(["A", "B", "C"]),
  cycleNumber: z.coerce.number().int().positive().default(1),
  cycleLabel: z.string().optional(),
  savingsTotal: z.coerce.number().nonnegative().default(0),
  savingsDisplay: z.string().optional(),
  readinessScore: z.coerce.number().int().min(0).max(100),
  repaymentRate: z.string().default("100%"),
  status: z.enum(["active", "pending", "inactive"]).default("active"),
  mentorName: z.string().optional(),
  meetingDay: z.string().optional(),
  formedYear: z.coerce.number().int().optional(),
  contactPhone: z.string().optional(),
  loanBalanceDisplay: z.string().optional(),
  nextDisbursement: z.string().optional(),
});

export const memberUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid(),
  fullName: z.string().min(1),
  age: z.coerce.number().int().min(16).max(35),
  sex: z.enum(["F", "M"]),
  memberRole: z.string().default("Member"),
  education: z.string().min(1),
  contributionAmount: z.coerce.number().nonnegative().default(0),
});

export const trainingCompletionSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid(),
  moduleId: z.string().uuid(),
  membersCompleted: z.coerce.number().int().positive(),
  completedAt: z.string().min(1),
});

export const savingsRecordSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid(),
  meetingDate: z.string().min(1),
  amount: z.coerce.number().positive(),
  notes: z.string().optional(),
});

export const idSchema = z.object({ id: z.string().uuid() });
export const groupIdSchema = z.object({ groupId: z.string().uuid() });

export const lookupOptionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required").max(100),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const lookupListSchema = z.object({
  includeInactive: z.boolean().optional().default(false),
});

export const storyUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  wardLabel: z.string().min(1, "Ward label is required"),
  imageUrl: z.string().url("Image URL must be valid"),
  storagePath: z.string().optional(),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
  isPublished: z.boolean().default(true),
});

export const storyPhotoUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  base64: z.string().min(1),
});

export type GroupUpsertInput = z.infer<typeof groupUpsertSchema>;
export type MemberUpsertInput = z.infer<typeof memberUpsertSchema>;
export type LookupOptionInput = z.infer<typeof lookupOptionSchema>;
