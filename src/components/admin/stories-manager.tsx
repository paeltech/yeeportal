import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Story } from "@/lib/data/stories";
import {
  deleteStory,
  listStoriesAdmin,
  saveStory,
  uploadStoryPhoto,
} from "@/lib/admin/story-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StoryFormState = {
  id?: string;
  title: string;
  excerpt: string;
  wardLabel: string;
  imageUrl: string;
  storagePath?: string;
  sortOrder: number;
  isPublished: boolean;
};

const emptyForm = (): StoryFormState => ({
  title: "",
  excerpt: "",
  wardLabel: "",
  imageUrl: "",
  sortOrder: 0,
  isPublished: true,
});

function storyToForm(story: Story): StoryFormState {
  return {
    id: story.id,
    title: story.title,
    excerpt: story.excerpt,
    wardLabel: story.wardLabel,
    imageUrl: story.imageUrl,
    storagePath: story.storagePath ?? undefined,
    sortOrder: story.sortOrder,
    isPublished: story.isPublished,
  };
}

export function StoriesManager() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<StoryFormState>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["admin-stories"],
    queryFn: () => listStoriesAdmin(),
  });

  const saveMutation = useMutation({
    mutationFn: saveStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      toast.success("Story saved");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      toast.success("Story deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const openCreate = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (story: Story) => {
    setForm(storyToForm(story));
    setDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] ?? "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { imageUrl, storagePath } = await uploadStoryPhoto({
        data: { fileName: file.name, mimeType: file.type, base64 },
      });

      setForm((f) => ({ ...f, imageUrl, storagePath }));
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    saveMutation.mutate({ data: form });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {stories.length} {stories.length === 1 ? "story" : "stories"}
        </p>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add story
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading stories…
        </div>
      ) : stories.length === 0 ? (
        <p className="text-muted-foreground py-8">No stories yet. Add one to show on the homepage.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <article
              key={story.id}
              className="rounded-xl border bg-card overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/5] bg-muted relative">
                {story.imageUrl ? (
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                {!story.isPublished && (
                  <span className="absolute top-2 left-2 rounded bg-foreground/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
                    Draft
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-clay">
                  {story.wardLabel}
                </p>
                <h3 className="mt-2 font-display text-lg leading-snug">{story.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">
                  {story.excerpt}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(story)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm("Delete this story?")) {
                        deleteMutation.mutate({ data: { id: story.id } });
                      }
                    }}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit story" : "New story"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="story-title">Title</Label>
              <Input
                id="story-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="story-ward">Ward label</Label>
              <Input
                id="story-ward"
                placeholder="e.g. Kinondoni Ward"
                value={form.wardLabel}
                onChange={(e) => setForm((f) => ({ ...f, wardLabel: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="story-excerpt">Excerpt</Label>
              <Textarea
                id="story-excerpt"
                rows={4}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Photo</Label>
              {form.imageUrl ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <Input
                placeholder="Or paste image URL"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="story-sort">Sort order</Label>
              <Input
                id="story-sort"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="story-published">Published on homepage</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unpublished stories are hidden from the public site.
                </p>
              </div>
              <Switch
                id="story-published"
                checked={form.isPublished}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isPublished: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending || !form.imageUrl}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
