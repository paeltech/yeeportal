import { createFileRoute } from "@tanstack/react-router";
import { StoriesManager } from "@/components/admin/stories-manager";

export const Route = createFileRoute("/dashboard/stories")({
  component: StoriesPage,
});

function StoriesPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-clay">Homepage</p>
        <h1 className="mt-2 font-display text-4xl">Field stories</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Stories and photos shown in the &ldquo;Stories from the field&rdquo; section on the public
          homepage. Photos are stored in Supabase storage.
        </p>
      </div>

      <StoriesManager />
    </div>
  );
}
