import { z } from "zod";

export const interestApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(9, "Phone number is required"),
  ward: z.string().min(1, "Ward is required"),
  age: z.coerce.number().int().min(16).max(35),
  focusArea: z.string().min(1, "Focus area is required"),
  motivation: z.string().min(20, "Tell us a bit more about your motivation"),
});

export const memberRegistrationSchema = z.object({
  groupId: z.string().uuid().optional(),
  groupSlug: z.string().optional(),
  fullName: z.string().min(2),
  age: z.coerce.number().int().min(16).max(35),
  sex: z.enum(["F", "M"]),
  education: z.string().min(1),
  memberRole: z.string().default("Member"),
  contributionAmount: z.coerce.number().nonnegative().default(0),
});

export const savingsMeetingSchema = z.object({
  groupId: z.string().uuid(),
  meetingDate: z.string().min(1),
  amount: z.coerce.number().positive(),
  notes: z.string().optional(),
});

export const trainingCompletionSchema = z.object({
  groupId: z.string().uuid(),
  moduleName: z.string().min(1),
  membersCompleted: z.coerce.number().int().positive(),
  completedAt: z.string().min(1),
});

export const reviewSubmissionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  reviewNotes: z.string().optional(),
});

export type InterestApplication = z.infer<typeof interestApplicationSchema>;
export type MemberRegistration = z.infer<typeof memberRegistrationSchema>;
export type SavingsMeeting = z.infer<typeof savingsMeetingSchema>;
export type TrainingCompletion = z.infer<typeof trainingCompletionSchema>;
