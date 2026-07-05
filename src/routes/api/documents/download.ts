import { createFileRoute } from "@tanstack/react-router";
import { resolveDocumentDownload } from "@/lib/documents/document-fns";

export const Route = createFileRoute("/api/documents/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");

        if (!token) {
          return new Response("Missing download token", { status: 400 });
        }

        try {
          const result = await resolveDocumentDownload({ data: { token } });

          // Redirect to the actual file for direct download
          return Response.redirect(result.fileUrl, 302);
        } catch {
          return new Response("Download link is invalid or has expired", {
            status: 410,
          });
        }
      },
    },
  },
});
