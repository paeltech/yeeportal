import type { GroupDocument } from "./types";

const documents = new Map<string, GroupDocument>();
const downloadRequests = new Map<string, import("./types").DownloadRequest>();

export function getDocumentById(id: string): GroupDocument | undefined {
  return documents.get(id);
}

export function getGroupDocuments(groupSlug: string): GroupDocument[] {
  return [...documents.values()]
    .filter((d) => d.groupSlug === groupSlug && d.isPublic)
    .sort((a, b) => a.type.localeCompare(b.type));
}

export function listAllDocuments(): GroupDocument[] {
  return [...documents.values()].sort((a, b) =>
    (a.groupName ?? "").localeCompare(b.groupName ?? ""),
  );
}

export function listSiteDocuments(): GroupDocument[] {
  return [...documents.values()]
    .filter((d) => d.groupSlug == null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function listGroupDocumentsAdmin(groupSlug: string): GroupDocument[] {
  return [...documents.values()]
    .filter((d) => d.groupSlug === groupSlug)
    .sort((a, b) => a.type.localeCompare(b.type));
}

export function upsertDocument(doc: GroupDocument): GroupDocument {
  documents.set(doc.id, doc);
  return doc;
}

export function deleteDocument(id: string): boolean {
  return documents.delete(id);
}

export function createDownloadRequest(
  documentId: string,
  email: string,
  token: string,
  expiresAt: string,
): import("./types").DownloadRequest {
  const request = {
    id: crypto.randomUUID(),
    documentId,
    email,
    token,
    createdAt: new Date().toISOString(),
    expiresAt,
  };
  downloadRequests.set(token, request);
  return request;
}

export function getDownloadRequestByToken(
  token: string,
): import("./types").DownloadRequest | undefined {
  const request = downloadRequests.get(token);
  if (!request) return undefined;
  if (new Date(request.expiresAt) < new Date()) {
    downloadRequests.delete(token);
    return undefined;
  }
  return request;
}

export function makeDocumentId(groupSlug: string | null, type: GroupDocument["type"]): string {
  const prefix = groupSlug ?? "site";
  if (type === "constitution") return `${prefix}-constitution`;
  if (type === "registration_certificate") return `${prefix}-registration`;
  return `${prefix}-${type}-${Date.now()}`;
}
