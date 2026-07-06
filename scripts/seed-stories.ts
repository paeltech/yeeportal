import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { requireSupabaseEnv } from "./load-env";

const { url, serviceRoleKey: key } = requireSupabaseEnv();
const supabase = createClient(url, key);

const BUCKET = "story-photos";

const STORIES = [
  {
    slug: "amina-kitenge",
    file: "story-1.jpg",
    wardLabel: "Kinondoni Ward",
    title: "From market stall to registered shop.",
    excerpt:
      "Amina turned a kitenge side-hustle into a registered enterprise after her group's first savings cycle.",
    sortOrder: 1,
  },
  {
    slug: "savings-six-months",
    file: "story-2.jpg",
    wardLabel: "Temeke Ward",
    title: "A savings group that paid for itself in six months.",
    excerpt:
      "How twelve members pooled weekly contributions to fund three new businesses in a single year.",
    sortOrder: 2,
  },
  {
    slug: "welding-workshop",
    file: "story-3.jpg",
    wardLabel: "Ilala Ward",
    title: "Sparks, steel and a workshop of their own.",
    excerpt:
      "Mentorship and seed funding gave a welding cooperative its first commercial contract.",
    sortOrder: 3,
  },
];

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "assets");

async function uploadPhoto(slug: string, fileName: string): Promise<{ imageUrl: string; storagePath: string } | null> {
  const localPath = join(assetsDir, fileName);
  if (!existsSync(localPath)) {
    console.warn(`  Skipping upload — file not found: ${localPath}`);
    return null;
  }

  const buffer = readFileSync(localPath);
  const storagePath = `${slug}.jpg`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) {
    console.error(`  Upload failed for ${fileName}:`, error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { imageUrl: data.publicUrl, storagePath };
}

export async function seedStories() {
  console.log("\nSeeding stories...");

  for (const story of STORIES) {
    const uploaded = await uploadPhoto(story.slug, story.file);
    if (!uploaded) {
      console.warn(`  Skipping story "${story.title}" — no photo uploaded`);
      continue;
    }

    const { data: existing } = await supabase
      .from("stories")
      .select("id")
      .eq("title", story.title)
      .maybeSingle();

    const payload = {
      title: story.title,
      excerpt: story.excerpt,
      ward_label: story.wardLabel,
      image_url: uploaded.imageUrl,
      storage_path: uploaded.storagePath,
      sort_order: story.sortOrder,
      is_published: true,
    };

    if (existing?.id) {
      const { error } = await supabase.from("stories").update(payload).eq("id", existing.id);
      if (error) console.error("  Update failed:", story.title, error.message);
      else console.log("  Updated:", story.title);
    } else {
      const { error } = await supabase.from("stories").insert(payload);
      if (error) console.error("  Insert failed:", story.title, error.message);
      else console.log("  Inserted:", story.title);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedStories().then(() => console.log("Stories seed done."));
}
