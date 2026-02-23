"use client";

import { create } from "zustand";
import { DEFAULT_CHART_KEY } from "@/lib/chart-registry";

export interface AttachedFile {
  file: File;
  name: string;
  size: number;
  parsedContent?: string;
  parsing: boolean;
  error?: string;
  /** Set after successfully saving to DB; skip re-save on later sends */
  savedToDb?: boolean;
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
  setChartFeedback: (messageId: string, value: "liked" | "disliked" | null) => void;
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

async function parseFile(file: File): Promise<{ textContent: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/parse-file", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to parse file");
  }

  return res.json();
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

  clearConversation: () =>
    set({ conversationId: null, chartFeedbackMap: {} }),

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
        const data = await parseFile(af.file);
        set((s) => ({
          attachedFiles: s.attachedFiles.map((f) =>
            f.file === af.file
              ? { ...f, parsedContent: data.textContent, parsing: false }
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
    set((s) => ({
      attachedFiles: s.attachedFiles.filter((_, i) => i !== index),
    })),

  clearFiles: () => set({ attachedFiles: [] }),

  markFileSavedToDb: (file) =>
    set((s) => ({
      attachedFiles: s.attachedFiles.map((f) =>
        f.file === file ? { ...f, savedToDb: true } : f,
      ),
    })),

  setAttachedChartContext: (context) =>
    set({ attachedChartContext: context }),

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
