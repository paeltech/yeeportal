import { z } from "zod";
import { DOCUMENT_TYPES } from "@/lib/documents/types";

export const documentDownloadSchema = z.object({
  documentId: z.string().min(1, "Document is required"),
  email: z.string().email("Please enter a valid email address"),
});

export type DocumentDownloadInput = z.infer<typeof documentDownloadSchema>;

export const documentUpsertSchema = z.object({
  id: z.string().optional(),
  groupSlug: z.string().min(1),
  groupName: z.string().min(1),
  type: z.enum(DOCUMENT_TYPES),
  title: z.string().min(1, "Title is required"),
  fileName: z.string().min(1),
  fileUrl: z.string().url("File URL must be valid"),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().int().nonnegative(),
  isPublic: z.boolean().default(true),
});

export type DocumentUpsertInput = z.infer<typeof documentUpsertSchema>;

export const documentDeleteSchema = z.object({
  id: z.string().min(1),
});
