import { GROUPS, slugify } from "@/lib/groups-data";
import type { GroupDocument } from "./types";

/** Sample PDF served from /public for preview and download demos */
export const SAMPLE_PDF_URL = "/documents/sample-yee-document.pdf";

export function seedGroupDocuments(): GroupDocument[] {
  const docs: GroupDocument[] = [];
  const now = new Date().toISOString();

  for (const group of GROUPS) {
    const slug = slugify(group.name);
    docs.push(
      {
        id: `${slug}-constitution`,
        groupSlug: slug,
        groupName: group.name,
        type: "constitution",
        title: `${group.name} — Group Constitution`,
        fileName: `${slug}-constitution.pdf`,
        fileUrl: SAMPLE_PDF_URL,
        mimeType: "application/pdf",
        fileSizeBytes: 132_640,
        uploadedAt: now,
        isPublic: true,
      },
      {
        id: `${slug}-registration`,
        groupSlug: slug,
        groupName: group.name,
        type: "registration_certificate",
        title: `${group.name} — Registration Certificate`,
        fileName: `${slug}-registration-certificate.pdf`,
        fileUrl: SAMPLE_PDF_URL,
        mimeType: "application/pdf",
        fileSizeBytes: 98_304,
        uploadedAt: now,
        isPublic: true,
      },
    );
  }

  return docs;
}
