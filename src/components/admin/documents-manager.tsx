import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
  type GroupDocument,
} from "@/lib/documents/types";
import {
  fetchGroupDocumentsAdmin,
  fetchSiteDocuments,
  removeDocument,
  saveDocument,
} from "@/lib/documents/document-fns";
import { DocumentTypeIcon } from "@/components/documents/document-utils";
import { formatFileSize } from "@/lib/documents/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type DocumentFormState = {
  id?: string;
  type: DocumentType;
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  isPublic: boolean;
};

type DocumentsManagerProps =
  | {
      scope: "group";
      groupSlug: string;
      groupName: string;
    }
  | {
      scope: "site";
    };

const emptyForm = (type: DocumentType = "other"): DocumentFormState => ({
  type,
  title: "",
  fileName: "",
  fileUrl: "/documents/sample-yee-document.pdf",
  mimeType: "application/pdf",
  fileSizeBytes: 0,
  isPublic: true,
});

export function DocumentsManager(props: DocumentsManagerProps) {
  const isGroup = props.scope === "group";
  const groupSlug = isGroup ? props.groupSlug : undefined;
  const groupName = isGroup ? props.groupName : undefined;
  const queryKey = isGroup ? ["admin-group-documents", groupSlug] : ["admin-site-documents"];

  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DocumentFormState>(() =>
    emptyForm(isGroup ? "constitution" : "other"),
  );

  const { data: documents = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      isGroup
        ? fetchGroupDocumentsAdmin({ data: { groupSlug: groupSlug! } })
        : fetchSiteDocuments(),
  });

  const saveMutation = useMutation({
    mutationFn: saveDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Document saved");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: removeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Document deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const defaultTitle = (type: DocumentType) => {
    if (isGroup && groupName) return `${groupName} — ${DOCUMENT_TYPE_LABELS[type]}`;
    return DOCUMENT_TYPE_LABELS[type];
  };

  const defaultFileName = (type: DocumentType) => {
    const prefix = isGroup ? groupSlug! : "programme";
    const suffix = type === "registration_certificate" ? "registration-certificate" : type;
    return `${prefix}-${suffix}.pdf`;
  };

  const openCreate = () => {
    const type = isGroup ? "constitution" : "other";
    setForm({
      ...emptyForm(type),
      title: defaultTitle(type),
      fileName: defaultFileName(type),
    });
    setDialogOpen(true);
  };

  const openEdit = (doc: GroupDocument) => {
    setForm({
      id: doc.id,
      type: doc.type,
      title: doc.title,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      mimeType: doc.mimeType,
      fileSizeBytes: doc.fileSizeBytes,
      isPublic: doc.isPublic,
    });
    setDialogOpen(true);
  };

  const handleTypeChange = (type: DocumentType) => {
    setForm((f) => ({
      ...f,
      type,
      title: f.title || defaultTitle(type),
      fileName: f.fileName || defaultFileName(type),
    }));
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setForm((f) => ({
      ...f,
      fileName: file.name,
      mimeType: file.type || "application/pdf",
      fileSizeBytes: file.size,
      fileUrl: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      data: {
        id: form.id,
        ...(isGroup ? { groupSlug: groupSlug!, groupName: groupName! } : {}),
        type: form.type,
        title: form.title,
        fileName: form.fileName,
        fileUrl: form.fileUrl,
        mimeType: form.mimeType,
        fileSizeBytes: form.fileSizeBytes,
        isPublic: form.isPublic,
      },
    });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Add document
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading documents…
        </div>
      ) : documents.length === 0 ? (
        <p className="text-muted-foreground py-8">
          {isGroup
            ? "No documents for this group yet. Add a constitution, registration certificate, or other file."
            : "No programme-wide public documents yet."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Document</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Public</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-t border-border">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <DocumentTypeIcon type={doc.type} className="h-4 w-4 text-clay" />
                      <span className="font-medium">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {DOCUMENT_TYPE_LABELS[doc.type]}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatFileSize(doc.fileSizeBytes)}
                  </td>
                  <td className="px-5 py-3">
                    {doc.isPublic ? (
                      <span className="text-xs font-semibold text-green-700">Yes</span>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(doc)}
                        aria-label="Edit document"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Delete "${doc.title}"?`)) {
                            deleteMutation.mutate({ data: { id: doc.id } });
                          }
                        }}
                        aria-label="Delete document"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {form.id ? "Edit document" : "Add document"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Document type</Label>
              <Select value={form.type} onValueChange={(v) => handleTypeChange(v as DocumentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {DOCUMENT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-title">Title</Label>
              <Input
                id="doc-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-url">File URL</Label>
              <Input
                id="doc-url"
                type="url"
                value={form.fileUrl}
                onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                placeholder="/documents/my-file.pdf"
                required
              />
              <p className="text-xs text-muted-foreground">
                Upload to storage and paste the URL, or use a file in /public/documents/
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-file">Or upload file (local preview)</Label>
              <Input
                id="doc-file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <Label htmlFor="doc-public">Public</Label>
                <p className="text-xs text-muted-foreground">
                  {isGroup
                    ? "Visible on this group's public page"
                    : "Visible as a programme-wide public document"}
                </p>
              </div>
              <Switch
                id="doc-public"
                checked={form.isPublic}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isPublic: checked }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save document
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
