"use client";

import { create } from "zustand";
import { DEFAULT_CHART_KEY } from "@/lib/chart/chart-registry";

export interface AttachedFile {
  file: File;
  name: string;
  size: number;
  parsedContent?: string;
  parsing: boolean;
  error?: string;
  /** Set after successfully saving to DB; skip re-save on later sends */
  savedToDb?: boolean;
  /** Vercel Blob URL; deleted when file is removed or conversation ends */
  blobUrl?: string;
}

export type ChatSidebarView = "chat" | "settings";

export interface AttachedChartContext {
  title: string;
  chartType: string;
  data: unknown;
}

/** Document from DB loaded as context for the AI chat */
export interface LoadedDocument {
  id: string;
  name: string;
  content: string;
}

interface ChatbotState {
  input: string;
  attachedFiles: AttachedFile[];
  attachedChartContext: AttachedChartContext | null;
  /** Documents loaded from the documents list for chat context */
  loadedDocuments: LoadedDocument[];
  selectedChartKey: string | null;
  chatSidebarView: ChatSidebarView;
  /** Save attached documents to DB (default: disabled) */
  saveDocumentsOnDb: boolean;
  /** Chart feedback by message id (Conversation+Message+Result) */
  chartFeedbackMap: Record<string, "liked" | "disliked">;
  /** Convex conversation id; null = new conversation */
  conversationId: string | null;

  setInput: (value: string) => void;
  setConversationId: (id: string | null) => void;
  setChartFeedback: (
    messageId: string,
    value: "liked" | "disliked" | null,
  ) => void;
  clearChartFeedback: () => void;
  clearConversation: () => void;
  addFiles: (files: FileList | File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  markFileSavedToDb: (file: File) => void;
  setAttachedChartContext: (context: AttachedChartContext | null) => void;
  addLoadedDocument: (doc: LoadedDocument) => void;
  removeLoadedDocument: (id: string) => void;
  clearLoadedDocuments: () => void;
  setSelectedChartKey: (key: string | null) => void;
  toggleSelectedChartKey: (key: string) => void;
  setChatSidebarView: (view: ChatSidebarView) => void;
  toggleChatSidebarView: () => void;
  setSaveDocumentsOnDb: (value: boolean) => void;
}

/** Upload to Blob and parse; returns { textContent, blobUrl } */
async function uploadAndParseFile(
  file: File,
): Promise<{ textContent: string; blobUrl: string }> {
  const uploadRes = await fetch("/api/blob/upload", {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "x-file-name": encodeURIComponent(file.name),
      "x-file-type": file.type || "application/octet-stream",
    },
    body: file,
  });

  const uploadData = await uploadRes.json().catch(() => ({}));

  if (!uploadRes.ok) {
    throw new Error(
      uploadData?.error ?? `Upload failed (${uploadRes.status})`,
    );
  }

  const blobUrl = uploadData.url as string;

  const res = await fetch("/api/parse-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blobUrl,
      fileName: file.name,
      mimeType: file.type || "",
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof data?.error === "string"
        ? data.error
        : res.status === 413
          ? "File too large (max 10 MB)"
          : `Failed to parse file (${res.status})`;
    throw new Error(msg);
  }

  return {
    textContent: (data as { textContent: string }).textContent,
    blobUrl,
  };
}

function deleteBlobs(urls: string[]): void {
  if (urls.length === 0) return;
  fetch("/api/blob/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  }).catch(() => {});
}

/** Call on page unload (beforeunload/pagehide) to delete orphaned blobs. Uses sendBeacon for reliability during unload. */
export function deleteAttachedBlobsOnUnload(): void {
  const urls = useChatbotStore
    .getState()
    .attachedFiles.map((f) => f.blobUrl)
    .filter((u): u is string => !!u);
  if (urls.length > 0 && typeof navigator?.sendBeacon === "function") {
    navigator.sendBeacon(
      "/api/blob/delete",
      new Blob([JSON.stringify({ urls })], { type: "application/json" }),
    );
  }
}

export const useChatbotStore = create<ChatbotState>((set) => ({
  input: "",
  attachedFiles: [],
  attachedChartContext: null,
  loadedDocuments: [],
  selectedChartKey: DEFAULT_CHART_KEY,
  chatSidebarView: "chat",
  saveDocumentsOnDb: false,
  chartFeedbackMap: {},
  conversationId: null,

  setInput: (value) => set({ input: value }),

  setConversationId: (id) => set({ conversationId: id }),

  setChartFeedback: (messageId, value) =>
    set((s) => {
      const next = { ...s.chartFeedbackMap };
      if (value) next[messageId] = value;
      else delete next[messageId];
      return { chartFeedbackMap: next };
    }),

  clearChartFeedback: () => set({ chartFeedbackMap: {} }),

  clearConversation: () => set({ conversationId: null, chartFeedbackMap: {} }),

  addFiles: (files) => {
    const newFiles = Array.from(files).map((file) => ({
      file,
      name: file.name,
      size: file.size,
      parsing: true,
    }));

    set((s) => ({ attachedFiles: [...s.attachedFiles, ...newFiles] }));

    newFiles.forEach(async (af) => {
      try {
        const { textContent, blobUrl } = await uploadAndParseFile(af.file);
        set((s) => ({
          attachedFiles: s.attachedFiles.map((f) =>
            f.file === af.file
              ? {
                  ...f,
                  parsedContent: textContent,
                  blobUrl,
                  parsing: false,
                }
              : f,
          ),
        }));
      } catch (err) {
        set((s) => ({
          attachedFiles: s.attachedFiles.map((f) =>
            f.file === af.file
              ? {
                  ...f,
                  parsing: false,
                  error:
                    err instanceof Error ? err.message : "Failed to parse file",
                }
              : f,
          ),
        }));
      }
    });
  },

  removeFile: (index) =>
    set((s) => {
      const file = s.attachedFiles[index];
      if (file?.blobUrl) deleteBlobs([file.blobUrl]);
      return {
        attachedFiles: s.attachedFiles.filter((_, i) => i !== index),
      };
    }),

  clearFiles: () =>
    set((s) => {
      const urls = s.attachedFiles
        .map((f) => f.blobUrl)
        .filter((u): u is string => !!u);
      if (urls.length > 0) deleteBlobs(urls);
      return { attachedFiles: [] };
    }),

  markFileSavedToDb: (file) =>
    set((s) => ({
      attachedFiles: s.attachedFiles.map((f) =>
        f.file === file ? { ...f, savedToDb: true } : f,
      ),
    })),

  setAttachedChartContext: (context) => set({ attachedChartContext: context }),

  addLoadedDocument: (doc) =>
    set((s) => ({
      loadedDocuments: s.loadedDocuments.some((d) => d.id === doc.id)
        ? s.loadedDocuments
        : [...s.loadedDocuments, doc],
    })),

  removeLoadedDocument: (id) =>
    set((s) => ({
      loadedDocuments: s.loadedDocuments.filter((d) => d.id !== id),
    })),

  clearLoadedDocuments: () => set({ loadedDocuments: [] }),

  setSelectedChartKey: (key) => set({ selectedChartKey: key }),

  toggleSelectedChartKey: (key) => set({ selectedChartKey: key }),

  setChatSidebarView: (view) => set({ chatSidebarView: view }),

  toggleChatSidebarView: () =>
    set((s) => ({
      chatSidebarView: s.chatSidebarView === "chat" ? "settings" : "chat",
    })),

  setSaveDocumentsOnDb: (value) => set({ saveDocumentsOnDb: value }),
}));
