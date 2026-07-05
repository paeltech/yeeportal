import type { GroupDocument } from "@/lib/documents/types";
import { DocumentCard } from "./document-card";

type GroupDocumentsSectionProps = {
  documents: GroupDocument[];
  groupName: string;
};

export function GroupDocumentsSection({ documents, groupName }: GroupDocumentsSectionProps) {
  if (documents.length === 0) {
    return (
      <section className="mt-12">
        <p className="eyebrow text-clay">Documents</p>
        <h2 className="mt-2 font-display text-3xl">Group documents</h2>
        <p className="mt-4 text-muted-foreground">
          No public documents are available for {groupName} yet.
        </p>
      </section>
    );
  }

  const constitution = documents.find((d) => d.type === "constitution");
  const registration = documents.find((d) => d.type === "registration_certificate");
  const other = documents.filter(
    (d) => d.type !== "constitution" && d.type !== "registration_certificate",
  );

  return (
    <section className="mt-12 space-y-6">
      <div>
        <p className="eyebrow text-clay">Documents</p>
        <h2 className="mt-2 font-display text-3xl">Group documents</h2>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Official records for {groupName}. Preview documents inline or download — we'll ask for
          your email and send you a direct link.
        </p>
      </div>

      <div className="space-y-4">
        {constitution && <DocumentCard document={constitution} />}
        {registration && <DocumentCard document={registration} />}
        {other.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </section>
  );
}
