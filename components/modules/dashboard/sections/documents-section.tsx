"use client";

import { useState, useMemo, useRef } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  Download,
  Trash2,
  Plus,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { PageSearchBar } from "@/components/layout/page-search-bar";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  useDocumentsList,
  useDocumentsMutations,
  useDocumentDownloadUrl,
  type DocumentItem,
} from "@/hooks/use-documents";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { TIER_LIMITS } from "@/lib/tiers/tier-limits";
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
import { useChatbotStore } from "@/stores/chatbot-store";

const ACCEPTED_FILE_TYPES =
  ".csv,.xlsx,.xls,.pdf,.json,.txt,.tsv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,application/json,text/plain,text/tab-separated-values";

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

function formatCreatedAt(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const docDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (docDay.getTime() === today.getTime()) return "Today";
  if (docDay.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function downloadFromContent(doc: {
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

function DocumentRow({
  doc,
  onDelete,
  onLoadToChat,
}: {
  doc: DocumentItem;
  onDelete: (id: string, name: string) => void;
  onLoadToChat: (doc: DocumentItem) => void;
}) {
  const downloadUrl = useDocumentDownloadUrl(doc.id as Id<"documents">);

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = doc.name;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    } else {
      downloadFromContent(doc);
    }
  };

  const Icon = getFileIcon(doc.name);
  const canDownload = !!downloadUrl || !doc.storageId;

  const controlButtonClass =
    "shrink-0 rounded-full p-2 text-[#3D4035]/30 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[28px] p-3 transition-colors hover:bg-black/[0.02] sm:gap-6">
      <div
        className={cn(
          "flex size-16 shrink-0 items-center justify-center rounded-[24px]",
          "bg-[#6CB4EE]/30",
        )}
      >
        <Icon className="size-7 text-[#3D4035]" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1 basis-32">
        <p className="text-[17px] font-medium text-[#3D4035]">{doc.name}</p>
        <p className="text-[13px] text-[#3D4035]/50">
          {formatSize(doc.size)} · {formatCreatedAt(doc.createdAt)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-0.5 sm:gap-1 min-[1441px]:gap-2">
          <button
            type="button"
            onClick={() => onDelete(doc.id, doc.name)}
            className={cn(
              controlButtonClass,
              "hover:bg-red-50 hover:text-red-500",
            )}
            aria-label={`Delete ${doc.name}`}
            title={`Delete ${doc.name}`}
          >
            <Trash2 className="size-4" />
          </button>

          <div className="hidden min-[1441px]:flex min-[1441px]:items-center min-[1441px]:gap-2">
            <button
              type="button"
              onClick={() => onLoadToChat(doc)}
              className="flex items-center gap-2 rounded-xl bg-[#94B49F]/20 px-4 py-2.5 text-[13px] font-semibold text-[#3D4035] transition-colors hover:bg-[#94B49F]/30"
              aria-label={`Load ${doc.name} to chat`}
              title={`Load ${doc.name} to chat`}
            >
              <MessageSquare className="size-4" />
              Load to chat
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!canDownload}
              className="flex items-center gap-2 rounded-xl bg-[#6C5DD3]/15 px-4 py-2.5 text-[13px] font-semibold text-[#6C5DD3] transition-colors hover:bg-[#6C5DD3]/25 disabled:opacity-50"
              aria-label={`Download ${doc.name}`}
              title={`Download ${doc.name}`}
            >
              <Download className="size-4" />
              Download
            </button>
          </div>

          <div className="flex items-center gap-0.5 min-[1441px]:hidden">
            <IconButton
              label={`Load ${doc.name} to chat`}
              icon={<MessageSquare className="size-4" />}
              onClick={() => onLoadToChat(doc)}
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-full border-0 bg-transparent",
                "hover:bg-[#94B49F]/20 hover:text-[#3D4035]",
              )}
            />
            <IconButton
              label={`Download ${doc.name}`}
              icon={<Download className="size-4" />}
              onClick={handleDownload}
              disabled={!canDownload}
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-full border-0 bg-transparent",
                "hover:bg-[#6C5DD3]/15 hover:text-[#6C5DD3] disabled:opacity-50",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocumentsSection() {
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLoadedDocument = useChatbotStore((s) => s.addLoadedDocument);
  const documents = useDocumentsList();
  const settings = useQuery(api.userSettings.get);
  const planTier = (settings?.planTier ?? "free") as "free" | "pro" | "max";
  const canUploadDocuments = TIER_LIMITS[planTier].maxDocuments > 0;

  const { uploadFiles, removeDocument, uploading, uploadError } =
    useDocumentsMutations();

  const filtered = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase().trim();
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.content.toLowerCase().includes(q),
    );
  }, [documents, search]);

  const handleRemove = async () => {
    if (deleteTarget) {
      await removeDocument(deleteTarget.id as Id<"documents">);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />
      <PageSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search documents…"
        count={filtered.length}
        countLabel={filtered.length === 1 ? "document" : "documents"}
        addButton={
          canUploadDocuments ? (
            <Button
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 rounded-xl bg-[#6C5DD3] text-[12px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              Add new
            </Button>
          ) : (
            <span className="text-[12px] text-[#3D4035]/50">
              Upgrade to Pro to upload documents
            </span>
          )
        }
      />
      {uploadError && <p className="text-[13px] text-red-600">{uploadError}</p>}

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
              ? canUploadDocuments
                ? 'Click "Add new" to upload CSV, Excel, PDF, JSON, or text files.'
                : "Upgrade to Pro to upload and save documents. Free plan: use files in chat only."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
          <div className="flex flex-col gap-5">
            {filtered.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onDelete={(id, name) => setDeleteTarget({ id, name })}
                onLoadToChat={(d) =>
                  addLoadedDocument({
                    id: d.id,
                    name: d.name,
                    content: d.content,
                  })
                }
              />
            ))}
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
              onClick={handleRemove}
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
