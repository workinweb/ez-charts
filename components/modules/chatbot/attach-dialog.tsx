"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FileSpreadsheet,
  FileText,
  Loader2,
  Link2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useChatbotStore } from "@/stores/chatbot-store";
import { cn } from "@/lib/utils";

const ACCEPTED_FILE_TYPES =
  ".csv,.xlsx,.xls,.pdf,.json,.txt,.tsv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,application/json,text/plain,text/tab-separated-values";

interface PendingItem {
  type: "local" | "url";
  name: string;
  size: number;
  content: string;
  error?: string;
  parsing?: boolean;
  /** For local: the File for re-parse if needed */
  file?: File;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls" || ext === "csv" || ext === "tsv")
    return FileSpreadsheet;
  return FileText;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttachDialog({ open, onOpenChange }: AttachDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingItem[]>([]);

  const addFileFromParsedContent = useChatbotStore(
    (s) => s.addFileFromParsedContent,
  );

  const hasPending = pending.length > 0;
  const hasReady = pending.some((p) => p.content && !p.error && !p.parsing);
  const hasParsing = pending.some((p) => p.parsing);

  const handleLocalSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    e.target.value = "";

    for (const file of Array.from(files)) {
      const placeholder: PendingItem = {
        type: "local",
        name: file.name,
        size: file.size,
        content: "",
        parsing: true,
        file,
      };
      setPending((prev) => [...prev, placeholder]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/parse-file", {
          method: "POST",
          body: formData,
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            typeof data?.error === "string"
              ? data.error
              : res.status === 413
                ? "File too large (max 10 MB)"
                : `Failed to parse (${res.status})`,
          );
        }

        const { textContent, size } = data as { textContent: string; size: number };
        setPending((prev) =>
          prev.map((p) =>
            p.file === file
              ? { ...p, content: textContent, size, parsing: false }
              : p,
          ),
        );
      } catch (err) {
        setPending((prev) =>
          prev.map((p) =>
            p.file === file
              ? {
                  ...p,
                  parsing: false,
                  error: err instanceof Error ? err.message : "Failed to parse",
                }
              : p,
          ),
        );
      }
    }
  };

  const handleUrlImport = async () => {
    const url = urlInput.trim();
    if (!url) {
      setUrlError("Enter a URL");
      return;
    }
    setUrlError(null);

    const placeholder: PendingItem = {
      type: "url",
      name: url,
      size: 0,
      content: "",
      parsing: true,
    };
    setPending((prev) => [...prev, placeholder]);
    setUrlInput("");

    try {
      const res = await fetch("/api/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : `Failed to import (${res.status})`,
        );
      }

      const { fileName, textContent, size } = data as {
        fileName: string;
        textContent: string;
        size: number;
      };

      setPending((prev) =>
        prev.map((p) =>
          p.name === url && p.type === "url"
            ? { ...p, name: fileName, content: textContent, size, parsing: false }
            : p,
        ),
      );
    } catch (err) {
      setPending((prev) =>
        prev.map((p) =>
          p.name === url && p.type === "url"
            ? {
                ...p,
                parsing: false,
                error:
                  err instanceof Error ? err.message : "Failed to import from URL",
              }
            : p,
        ),
      );
    }
  };

  const removePending = (index: number) => {
    setPending((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAccept = () => {
    const ready = pending.filter((p) => p.content && !p.error && !p.parsing);
    if (ready.length === 0) return;

    for (const p of ready) {
      addFileFromParsedContent(p.name, p.size, p.content, p.type);
    }
    setPending([]);
    setUrlInput("");
    setUrlError(null);
    onOpenChange(false);
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      setPending([]);
      setUrlInput("");
      setUrlError(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-[24px] border-0 bg-white p-6 shadow-xl sm:max-w-xl sm:p-8 lg:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg font-semibold text-[#3D4035] sm:text-xl">
            Import data
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-[13px] text-[#3D4035]/60 sm:text-[14px]">
            Add spreadsheets, documents, or PDFs from your device or a URL.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-4 sm:gap-8">
          {/* Local file */}
          <div className="space-y-3">
            <label className="text-[14px] font-medium text-[#3D4035]">
              Local file
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES}
              className="hidden"
              onChange={handleLocalSelect}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-2 border-2 border-dashed border-[#6C5DD3]/40 bg-[#6C5DD3]/5 py-5 text-[14px] font-medium text-[#6C5DD3] hover:bg-[#6C5DD3]/10 hover:border-[#6C5DD3]/60 sm:py-6"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              Choose files
            </Button>
          </div>

          {/* URL import */}
          <div className="space-y-3">
            <label className="text-[14px] font-medium text-[#3D4035]">
              Import from URL
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Paste URL to spreadsheet, PDF, or document"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUrlImport();
                }}
                className="flex-1 rounded-xl border-sidebar-border text-[14px]"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleUrlImport}
                className="shrink-0 gap-1.5 rounded-lg bg-[#6C5DD3] text-white hover:bg-[#5a4dbf]"
              >
                <Link2 className="size-3.5" />
                Import
              </Button>
            </div>
            {urlError && (
              <p className="text-[12px] text-red-600">{urlError}</p>
            )}
          </div>

          {/* Pending list with errors */}
          {hasPending && (
            <div className="min-h-0 flex-1 space-y-3">
              <label className="text-[14px] font-medium text-[#3D4035]">
                Pending ({pending.length})
              </label>
              <div className="min-h-[160px] max-h-[40vh] space-y-2 overflow-y-auto rounded-xl border border-sidebar-border bg-sidebar-foreground/2 p-3 sm:min-h-[200px] sm:p-4">
                {pending.map((p, idx) => {
                  const Icon = getFileIcon(p.name);
                  return (
                    <div
                      key={`${p.name}-${idx}`}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px]",
                        p.error
                          ? "border border-red-200 bg-red-50/80"
                          : "bg-white",
                      )}
                    >
                      {p.parsing ? (
                        <Loader2 className="size-3.5 shrink-0 animate-spin text-sidebar-foreground/50" />
                      ) : (
                        <Icon className="size-3.5 shrink-0 text-sidebar-foreground/60" />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="truncate font-medium">{p.name}</span>
                        {p.size > 0 && (
                          <span className="ml-1.5 text-sidebar-foreground/50">
                            {formatFileSize(p.size)}
                          </span>
                        )}
                        {p.error && (
                          <p className="mt-0.5 text-[11px] text-red-600">
                            {p.error}
                          </p>
                        )}
                        {process.env.NEXT_PUBLIC_IS_DEV_MODE &&
                          p.content &&
                          !p.error && (
                            <details className="mt-2">
                              <summary className="cursor-pointer select-none text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground/70">
                                View imported content
                              </summary>
                              <pre className="mt-1.5 max-h-32 overflow-auto rounded-lg bg-sidebar-foreground/5 p-2 text-[10px] leading-relaxed text-sidebar-foreground/70">
                                {p.content.slice(0, 2000)}
                                {p.content.length > 2000 && "…"}
                              </pre>
                            </details>
                          )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePending(idx)}
                        className="rounded-full p-1 transition-colors hover:bg-sidebar-foreground/10"
                        aria-label={`Remove ${p.name}`}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 shrink-0 gap-3 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!hasReady || hasParsing}
            className="bg-[#6C5DD3] text-white hover:bg-[#5a4dbf]"
          >
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
