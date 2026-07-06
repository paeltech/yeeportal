import { createServerFn } from "@tanstack/react-start";
import {
  documentDownloadSchema,
  documentDeleteSchema,
  documentUpsertSchema,
} from "@/lib/schemas/document";
import {
  makeDocumentId,
  repoCreateDownloadRequest,
  repoDeleteDocument,
  repoGetDocumentById,
  repoGetDownloadRequestByToken,
  repoGetGroupDocuments,
  repoListGroupDocumentsAdmin,
  repoListSiteDocuments,
  repoUpsertDocument,
} from "@/lib/documents/repository";
import { buildDownloadUrl, sendDocumentDownloadEmail } from "@/lib/email/send-document-link";
import { getAuthSession } from "@/lib/auth/auth-fns";
import { canManageDocuments } from "@/lib/auth/permissions";
import { logAuditEvent } from "@/lib/audit/log";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export const requestDocumentDownload = createServerFn({ method: "POST" })
  .validator((data: unknown) => documentDownloadSchema.parse(data))
  .handler(async ({ data }) => {
    const document = await repoGetDocumentById(data.documentId);
    if (!document || !document.isPublic) {
      throw new Error("Document not found");
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
    await repoCreateDownloadRequest(document.id, data.email, token, expiresAt);

    const downloadUrl = buildDownloadUrl(token);
    const emailResult = await sendDocumentDownloadEmail({
      to: data.email,
      documentTitle: document.title,
      groupName: document.groupName ?? "YEE Tanzania",
      downloadUrl,
    });

    await logAuditEvent({
      action: "document.download_request",
      entityType: "document",
      entityId: document.id,
      metadata: { email: data.email },
    });

    return {
      downloadUrl,
      fileName: document.fileName,
      emailed: emailResult.sent,
      emailNote: emailResult.sent
        ? "We've sent the download link to your email."
        : "Email delivery is not configured — use the link below to download.",
    };
  });

export const resolveDocumentDownload = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null || !("token" in data)) {
      throw new Error("Token is required");
    }
    const token = (data as { token: string }).token;
    if (!token) throw new Error("Token is required");
    return { token };
  })
  .handler(async ({ data }) => {
    const request = await repoGetDownloadRequestByToken(data.token);
    if (!request) {
      throw new Error("Download link is invalid or has expired");
    }

    const document = await repoGetDocumentById(request.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    return {
      fileUrl: document.fileUrl,
      fileName: document.fileName,
      mimeType: document.mimeType,
      title: document.title,
    };
  });

export const fetchSiteDocuments = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuthSession();
  if (!session || !canManageDocuments(session.profile.role)) {
    throw new Error("Unauthorized");
  }
  return repoListSiteDocuments();
});

export const fetchGroupDocumentsAdmin = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null || !("groupSlug" in data)) {
      throw new Error("groupSlug is required");
    }
    return { groupSlug: String((data as { groupSlug: string }).groupSlug) };
  })
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    if (!session || !canManageDocuments(session.profile.role)) {
      throw new Error("Unauthorized");
    }
    return repoListGroupDocumentsAdmin(data.groupSlug);
  });

/** @deprecated Use fetchSiteDocuments or fetchGroupDocumentsAdmin */
export const fetchAllDocuments = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuthSession();
  if (!session || !canManageDocuments(session.profile.role)) {
    throw new Error("Unauthorized");
  }
  return repoListSiteDocuments();
});

export const saveDocument = createServerFn({ method: "POST" })
  .validator((data: unknown) => documentUpsertSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    if (!session || !canManageDocuments(session.profile.role)) {
      throw new Error("Unauthorized");
    }

    const groupSlug = data.groupSlug ?? null;
    const groupName = data.groupName ?? null;
    const id = data.id ?? makeDocumentId(groupSlug, data.type);

    const doc = await repoUpsertDocument({
      id,
      groupSlug,
      groupName,
      type: data.type,
      title: data.title,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      mimeType: data.mimeType,
      fileSizeBytes: data.fileSizeBytes,
      isPublic: data.isPublic,
    });

    await logAuditEvent({
      actorId: session.userId,
      action: data.id ? "document.update" : "document.create",
      entityType: "document",
      entityId: doc.id,
    });

    return doc;
  });

export const removeDocument = createServerFn({ method: "POST" })
  .validator((data: unknown) => documentDeleteSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    if (!session || !canManageDocuments(session.profile.role)) {
      throw new Error("Unauthorized");
    }

    const deleted = await repoDeleteDocument(data.id);
    if (!deleted) throw new Error("Document not found");

    await logAuditEvent({
      actorId: session.userId,
      action: "document.delete",
      entityType: "document",
      entityId: data.id,
    });

    return { success: true };
  });

export const fetchGroupDocuments = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null || !("groupSlug" in data)) {
      throw new Error("groupSlug is required");
    }
    return { groupSlug: String((data as { groupSlug: string }).groupSlug) };
  })
  .handler(async ({ data }) => repoGetGroupDocuments(data.groupSlug));
