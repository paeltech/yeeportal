import { useState } from "react";
import { Eye, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { GroupDocument } from "@/lib/documents/types";
import { DOCUMENT_TYPE_LABELS } from "@/lib/documents/types";
import { requestDocumentDownload } from "@/lib/documents/document-fns";
import { DocumentTypeIcon } from "./document-utils";
import { formatFileSize } from "@/lib/documents/format";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type DownloadEmailDialogProps = {
  document: GroupDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DownloadEmailDialog({ document, open, onOpenChange }: DownloadEmailDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [emailNote, setEmailNote] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setDownloadUrl(null);
    setEmailNote(null);
    setLoading(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const result = await requestDocumentDownload({
        data: { documentId: document.id, email: email.trim() },
      });
      setDownloadUrl(result.downloadUrl);
      setEmailNote(result.emailNote);
      toast.success(result.emailed ? "Download link sent to your email" : "Download link ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Download document</DialogTitle>
          <DialogDescription>
            Enter your email to receive <strong>{document.title}</strong>. You'll also get a direct
            download link here.
          </DialogDescription>
        </DialogHeader>

        {downloadUrl ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{emailNote}</p>
            <a
              href={downloadUrl}
              download={document.fileName}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-ink/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download {document.fileName}
            </a>
            <p className="text-xs text-muted-foreground text-center">Link expires in 24 hours</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="download-email">Email address</Label>
              <Input
                id="download-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send &amp; download
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

type DocumentCardProps = {
  document: GroupDocument;
};

export function DocumentCard({ document }: DocumentCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-ink">
            <DocumentTypeIcon type={document.type} />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-clay">
              {DOCUMENT_TYPE_LABELS[document.type]}
            </p>
            <h3 className="mt-1 font-medium text-foreground">{document.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF · {formatFileSize(document.fileSizeBytes)} · Updated{" "}
              {new Date(document.uploadedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setDownloadOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream hover:bg-ink/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      <DocumentPreviewDialog document={document} open={previewOpen} onOpenChange={setPreviewOpen} />
      <DownloadEmailDialog document={document} open={downloadOpen} onOpenChange={setDownloadOpen} />
    </>
  );
}
