import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type Story = {
  id: string;
  title: string;
  excerpt: string;
  wardLabel: string;
  imageUrl: string;
  storagePath: string | null;
  sortOrder: number;
  isPublished: boolean;
};

function mapStory(row: Record<string, unknown>): Story {
  return {
    id: row.id as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    wardLabel: row.ward_label as string,
    imageUrl: row.image_url as string,
    storagePath: (row.storage_path as string | null) ?? null,
    sortOrder: row.sort_order as number,
    isPublished: row.is_published as boolean,
  };
}

function admin() {
  const client = createSupabaseAdminClient();
  if (!isSupabaseConfigured() || !client) {
    throw new Error("Database unavailable");
  }
  return client;
}

export async function fetchPublishedStories(): Promise<Story[]> {
  const db = admin();
  const { data, error } = await db
    .from("stories")
    .select("*")
    .eq("is_published", true)
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapStory);
}

export async function fetchAllStories(): Promise<Story[]> {
  const db = admin();
  const { data, error } = await db
    .from("stories")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapStory);
}
