import { createServerFn } from "@tanstack/react-start";
import { getAuthSession } from "@/lib/auth/auth-fns";
import { isStaff } from "@/lib/auth/permissions";
import { logAuditEvent } from "@/lib/audit/log";
import { slugify } from "@/lib/groups-data";
import { fetchAllStories, fetchPublishedStories } from "@/lib/data/stories";
import { idSchema, storyPhotoUploadSchema, storyUpsertSchema } from "@/lib/schemas/admin";

const STORY_PHOTOS_BUCKET = "story-photos";

async function requireStaff() {
  const session = await getAuthSession();
  if (!session || !isStaff(session.profile.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function admin() {
  const { createSupabaseAdminClient } = await import("@/lib/supabase/server");
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Database unavailable");
  return client;
}

export const listPublishedStories = createServerFn({ method: "GET" }).handler(async () =>
  fetchPublishedStories(),
);

export const listStoriesAdmin = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff();
  return fetchAllStories();
});

export const saveStory = createServerFn({ method: "POST" })
  .validator((data: unknown) => storyUpsertSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    const db = await admin();
    const payload = {
      title: data.title,
      excerpt: data.excerpt,
      ward_label: data.wardLabel,
      image_url: data.imageUrl,
      storage_path: data.storagePath ?? null,
      sort_order: data.sortOrder,
      is_published: data.isPublished,
    };

    if (data.id) {
      const { data: row, error } = await db
        .from("stories")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      await logAuditEvent({
        actorId: session.userId,
        action: "story.update",
        entityType: "story",
        entityId: data.id,
      });
      return row;
    }

    const { data: row, error } = await db.from("stories").insert(payload).select("*").single();
    if (error) throw new Error(error.message);
    await logAuditEvent({
      actorId: session.userId,
      action: "story.create",
      entityType: "story",
      entityId: row.id,
    });
    return row;
  });

export const deleteStory = createServerFn({ method: "POST" })
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await requireStaff();
    const db = await admin();

    const { data: story } = await db
      .from("stories")
      .select("storage_path")
      .eq("id", data.id)
      .single();

    const { error } = await db.from("stories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    if (story?.storage_path) {
      await db.storage.from(STORY_PHOTOS_BUCKET).remove([story.storage_path]);
    }

    await logAuditEvent({
      actorId: session.userId,
      action: "story.delete",
      entityType: "story",
      entityId: data.id,
    });
    return { success: true };
  });

export const uploadStoryPhoto = createServerFn({ method: "POST" })
  .validator((data: unknown) => storyPhotoUploadSchema.parse(data))
  .handler(async ({ data }) => {
    await requireStaff();
    const db = await admin();

    const ext = data.fileName.split(".").pop()?.toLowerCase() || "jpg";
    const baseName = slugify(data.fileName.replace(/\.[^.]+$/, "")) || "story";
    const storagePath = `${baseName}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(data.base64, "base64");

    const { error } = await db.storage.from(STORY_PHOTOS_BUCKET).upload(storagePath, buffer, {
      contentType: data.mimeType,
      upsert: true,
    });
    if (error) throw new Error(error.message);

    const { data: urlData } = db.storage.from(STORY_PHOTOS_BUCKET).getPublicUrl(storagePath);
    return { imageUrl: urlData.publicUrl, storagePath };
  });
