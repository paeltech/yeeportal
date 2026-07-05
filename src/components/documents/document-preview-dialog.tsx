import { ExternalLink } from "lucide-react";
import type { GroupDocument } from "@/lib/documents/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type DocumentPreviewDialogProps = {
  document: GroupDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DocumentPreviewDialog({
  document,
  open,
  onOpenChange,
}: DocumentPreviewDialogProps) {
  const isPdf = document.mimeType === "application/pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-4 pr-8">
            <DialogTitle className="font-display text-lg truncate">{document.title}</DialogTitle>
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline decoration-sun decoration-2 underline-offset-[6px] shrink-0"
            >
              Open in new tab
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 bg-secondary">
          {isPdf ? (
            <iframe
              src={`${document.fileUrl}#toolbar=1&navpanes=0`}
              title={document.title}
              className="w-full h-full border-0"
            />
          ) : (
            <div className="grid place-items-center h-full p-8 text-center">
              <p className="text-muted-foreground">Preview not available for this file type.</p>
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm font-semibold text-ink underline"
              >
                Open file
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
