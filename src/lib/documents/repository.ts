import type { GroupDocument } from "./types";
import {
  createDownloadRequest,
  deleteDocument,
  getDocumentById,
  getDownloadRequestByToken,
  getGroupDocuments,
  listAllDocuments,
  makeDocumentId,
  upsertDocument,
} from "./store";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function mapDbDocument(row: Record<string, unknown>): GroupDocument {
  return {
    id: row.id as string,
    groupSlug: row.group_slug as string,
    groupName: row.group_name as string,
    type: row.type as GroupDocument["type"],
    title: row.title as string,
    fileName: row.file_name as string,
    fileUrl: row.file_url as string,
    mimeType: row.mime_type as string,
    fileSizeBytes: Number(row.file_size_bytes ?? 0),
    uploadedAt: row.uploaded_at as string,
    isPublic: row.is_public as boolean,
  };
}

export async function repoGetGroupDocuments(groupSlug: string): Promise<GroupDocument[]> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("documents")
        .select("*")
        .eq("group_slug", groupSlug)
        .eq("is_public", true)
        .order("type");
      if (!error && data?.length) return data.map(mapDbDocument);
    }
  }
  return getGroupDocuments(groupSlug);
}

export async function repoListAllDocuments(): Promise<GroupDocument[]> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { data, error } = await admin.from("documents").select("*").order("group_name");
      if (!error && data?.length) return data.map(mapDbDocument);
    }
  }
  return listAllDocuments();
}

export async function repoGetDocumentById(id: string): Promise<GroupDocument | undefined> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { data } = await admin.from("documents").select("*").eq("id", id).maybeSingle();
      if (data) return mapDbDocument(data);
    }
  }
  return getDocumentById(id);
}

export async function repoUpsertDocument(
  doc: Omit<GroupDocument, "uploadedAt"> & { uploadedAt?: string },
): Promise<GroupDocument> {
  const record: GroupDocument = {
    ...doc,
    uploadedAt: doc.uploadedAt ?? new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("documents")
        .upsert({
          id: record.id,
          group_slug: record.groupSlug,
          group_name: record.groupName,
          type: record.type,
          title: record.title,
          file_name: record.fileName,
          file_url: record.fileUrl,
          mime_type: record.mimeType,
          file_size_bytes: record.fileSizeBytes,
          is_public: record.isPublic,
          uploaded_at: record.uploadedAt,
        })
        .select("*")
        .single();
      if (!error && data) return mapDbDocument(data);
    }
  }

  return upsertDocument(record);
}

export async function repoDeleteDocument(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { error } = await admin.from("documents").delete().eq("id", id);
      if (!error) return true;
    }
  }
  return deleteDocument(id);
}

export async function repoCreateDownloadRequest(
  documentId: string,
  email: string,
  token: string,
  expiresAt: string,
) {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      await admin.from("document_download_requests").insert({
        document_id: documentId,
        email,
        token,
        expires_at: expiresAt,
      });
      return;
    }
  }
  createDownloadRequest(documentId, email, token, expiresAt);
}

export async function repoGetDownloadRequestByToken(token: string) {
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { data } = await admin
        .from("document_download_requests")
        .select("*")
        .eq("token", token)
        .maybeSingle();
      if (data) {
        if (new Date(data.expires_at) < new Date()) return undefined;
        return {
          id: data.id,
          documentId: data.document_id,
          email: data.email,
          token: data.token,
          createdAt: data.created_at,
          expiresAt: data.expires_at,
        };
      }
    }
  }
  return getDownloadRequestByToken(token);
}

export { makeDocumentId };
