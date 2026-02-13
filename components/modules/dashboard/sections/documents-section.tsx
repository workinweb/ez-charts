"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  Download,
  Trash2,
} from "lucide-react";
import { PageSearchBar } from "@/components/layout/page-search-bar";
import { useDocumentsStore } from "@/stores/documents-store";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "csv" || ext === "xlsx" || ext === "xls") return FileSpreadsheet;
  if (ext === "json") return FileJson;
  return FileText;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadDocument(doc: {
  name: string;
  content: string;
  type: string;
}) {
  const mime =
    doc.type === "text/csv"
      ? "text/csv"
      : doc.type === "application/json"
        ? "application/json"
        : "text/plain";
  const blob = new Blob([doc.content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.name;
  a.click();
  URL.revokeObjectURL(url);
}

export function DocumentsSection() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const documents = useDocumentsStore((s) => s.documents);
  const removeDocument = useDocumentsStore((s) => s.removeDocument);

  const filtered = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase().trim();
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.content.toLowerCase().includes(q),
    );
  }, [documents, search]);

  return (
    <div className="flex flex-col gap-6">
      <PageSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search documents…"
        count={filtered.length}
        countLabel={filtered.length === 1 ? "document" : "documents"}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] bg-white/80 py-24 text-center shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px]">
          <FileText className="size-12 text-[#3D4035]/20" />
          <p className="text-[15px] font-medium text-[#3D4035]/70">
            {documents.length === 0
              ? "No documents saved yet"
              : "No matching documents"}
          </p>
          <p className="max-w-sm text-[13px] text-[#3D4035]/50">
            {documents.length === 0
              ? "Attach files in the chat and enable “Save documents on DB” in Chat settings to store them here."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
          <div className="flex flex-col gap-4">
            {filtered.map((doc) => {
              const Icon = getFileIcon(doc.name);
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-6 rounded-[28px] p-3 transition-colors hover:bg-black/[0.02]"
                >
                  <div
                    className={cn(
                      "flex size-16 shrink-0 items-center justify-center rounded-[24px]",
                      "bg-[#6CB4EE]/30",
                    )}
                  >
                    <Icon className="size-7 text-[#3D4035]" strokeWidth={2} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] font-medium text-[#3D4035]">
                      {doc.name}
                    </p>
                    <p className="text-[13px] text-[#3D4035]/50">
                      {formatSize(doc.size)} · {doc.createdAt}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ id: doc.id, name: doc.name })
                    }
                    className="shrink-0 rounded-full p-2 text-[#3D4035]/30 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete document"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadDocument(doc)}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-[#6C5DD3]/15 px-4 py-2.5 text-[13px] font-semibold text-[#6C5DD3] transition-colors hover:bg-[#6C5DD3]/25"
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download className="size-4" />
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently removed.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && removeDocument(deleteTarget.id)
              }
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
