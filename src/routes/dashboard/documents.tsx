import { createFileRoute } from "@tanstack/react-router";
import { DocumentsManager } from "@/components/admin/documents-manager";

export const Route = createFileRoute("/dashboard/documents")({
  component: PublicDocumentsPage,
});

function PublicDocumentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-clay">Programme</p>
        <h1 className="mt-2 font-display text-4xl">Public documents</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Programme-wide documents not tied to a specific group — policies, guides, and other public
          resources. Group constitutions and certificates are managed under each group.
        </p>
      </div>

      <DocumentsManager scope="site" />
    </div>
  );
}
