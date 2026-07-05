import { FileText, ScrollText, File } from "lucide-react";
import type { DocumentType } from "@/lib/documents/types";

export function DocumentTypeIcon({
  type,
  className = "h-5 w-5",
}: {
  type: DocumentType;
  className?: string;
}) {
  switch (type) {
    case "constitution":
      return <ScrollText className={className} />;
    case "registration_certificate":
      return <FileText className={className} />;
    default:
      return <File className={className} />;
  }
}
