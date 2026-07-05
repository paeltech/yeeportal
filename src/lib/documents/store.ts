import { seedGroupDocuments } from "./seed";
import type { DocumentType, DownloadRequest, GroupDocument } from "./types";

const documents = new Map<string, GroupDocument>();
const downloadRequests = new Map<string, DownloadRequest>();

for (const doc of seedGroupDocuments()) {
  documents.set(doc.id, doc);
}

export function getDocumentById(id: string): GroupDocument | undefined {
  return documents.get(id);
}

export function getGroupDocuments(groupSlug: string): GroupDocument[] {
  return [...documents.values()]
    .filter((d) => d.groupSlug === groupSlug && d.isPublic)
    .sort((a, b) => a.type.localeCompare(b.type));
}

export function listAllDocuments(): GroupDocument[] {
  return [...documents.values()].sort((a, b) => a.groupName.localeCompare(b.groupName));
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
): DownloadRequest {
  const request: DownloadRequest = {
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

export function getDownloadRequestByToken(token: string): DownloadRequest | undefined {
  const request = downloadRequests.get(token);
  if (!request) return undefined;
  if (new Date(request.expiresAt) < new Date()) {
    downloadRequests.delete(token);
    return undefined;
  }
  return request;
}

export function makeDocumentId(groupSlug: string, type: DocumentType): string {
  if (type === "constitution") return `${groupSlug}-constitution`;
  if (type === "registration_certificate") return `${groupSlug}-registration`;
  return `${groupSlug}-${type}-${Date.now()}`;
}
