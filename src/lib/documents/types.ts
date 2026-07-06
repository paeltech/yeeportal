export const DOCUMENT_TYPES = ["constitution", "registration_certificate", "other"] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type GroupDocument = {
  id: string;
  groupSlug: string | null;
  groupName: string | null;
  type: DocumentType;
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  isPublic: boolean;
};

export function isSiteDocument(doc: GroupDocument): boolean {
  return doc.groupSlug == null;
}

export type DownloadRequest = {
  id: string;
  documentId: string;
  email: string;
  token: string;
  createdAt: string;
  expiresAt: string;
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  constitution: "Group constitution",
  registration_certificate: "Registration certificate",
  other: "Other document",
};
