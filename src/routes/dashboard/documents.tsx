import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GROUPS, slugify } from "@/lib/groups-data";
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
  type GroupDocument,
} from "@/lib/documents/types";
import { fetchAllDocuments, removeDocument, saveDocument } from "@/lib/documents/document-fns";
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

export const Route = createFileRoute("/dashboard/documents")({
  component: DocumentsAdminPage,
});

type DocumentFormState = {
  id?: string;
  groupSlug: string;
  type: DocumentType;
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  isPublic: boolean;
};

const emptyForm = (): DocumentFormState => ({
  groupSlug: slugify(GROUPS[0]?.name ?? ""),
  type: "constitution",
  title: "",
  fileName: "",
  fileUrl: "/documents/sample-yee-document.pdf",
  mimeType: "application/pdf",
  fileSizeBytes: 0,
  isPublic: true,
});

function DocumentsAdminPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DocumentFormState>(emptyForm);
  const [filterGroup, setFilterGroup] = useState<string>("all");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: () => fetchAllDocuments(),
  });

  const saveMutation = useMutation({
    mutationFn: saveDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Document saved");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: removeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Document deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const filtered =
    filterGroup === "all" ? documents : documents.filter((d) => d.groupSlug === filterGroup);

  const openCreate = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (doc: GroupDocument) => {
    setForm({
      id: doc.id,
      groupSlug: doc.groupSlug,
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

  const handleGroupChange = (groupSlug: string) => {
    const group = GROUPS.find((g) => slugify(g.name) === groupSlug);
    setForm((f) => ({
      ...f,
      groupSlug,
      title: f.title || (group ? `${group.name} — ${DOCUMENT_TYPE_LABELS[f.type]}` : f.title),
      fileName:
        f.fileName ||
        `${groupSlug}-${f.type === "registration_certificate" ? "registration-certificate" : f.type}.pdf`,
    }));
  };

  const handleTypeChange = (type: DocumentType) => {
    const group = GROUPS.find((g) => slugify(g.name) === form.groupSlug);
    setForm((f) => ({
      ...f,
      type,
      title: group ? `${group.name} — ${DOCUMENT_TYPE_LABELS[type]}` : f.title,
      fileName: `${f.groupSlug}-${type === "registration_certificate" ? "registration-certificate" : type}.pdf`,
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
    const group = GROUPS.find((g) => slugify(g.name) === form.groupSlug);
    if (!group) {
      toast.error("Please select a group");
      return;
    }

    saveMutation.mutate({
      data: {
        id: form.id,
        groupSlug: form.groupSlug,
        groupName: group.name,
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-clay">Admin</p>
          <h1 className="mt-2 font-display text-4xl">Document management</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Manage group constitutions, registration certificates, and other public documents shown
            on group detail pages.
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Add document
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Label htmlFor="filter-group" className="sr-only">
          Filter by group
        </Label>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger id="filter-group" className="w-[220px]">
            <SelectValue placeholder="All groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {GROUPS.map((g) => (
              <SelectItem key={g.name} value={slugify(g.name)}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {filtered.length} document{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading documents…
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Document</th>
                <th className="px-5 py-3">Group</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Public</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className="border-t border-border">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <DocumentTypeIcon type={doc.type} className="h-4 w-4 text-clay" />
                      <span className="font-medium">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{doc.groupName}</td>
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
              <Label>Group</Label>
              <Select value={form.groupSlug} onValueChange={handleGroupChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUPS.map((g) => (
                    <SelectItem key={g.name} value={slugify(g.name)}>
                      {g.name} · {g.ward}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                <Label htmlFor="doc-public">Public on group page</Label>
                <p className="text-xs text-muted-foreground">Visible in the documents section</p>
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
    </div>
  );
}
