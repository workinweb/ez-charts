"use client";

import { create } from "zustand";

export interface AttachedFile {
  file: File;
  name: string;
  size: number;
  parsedContent?: string;
  parsing: boolean;
  error?: string;
}

export type ChatSidebarView = "chat" | "settings";

export interface AttachedChartContext {
  title: string;
  chartType: string;
  data: unknown;
}

interface ChatbotState {
  input: string;
  attachedFiles: AttachedFile[];
  attachedChartContext: AttachedChartContext | null;
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
  setAttachedChartContext: (context: AttachedChartContext | null) => void;
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
  selectedChartKey: null,
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

  setAttachedChartContext: (context) =>
    set({ attachedChartContext: context }),

  setSelectedChartKey: (key) => set({ selectedChartKey: key }),

  toggleSelectedChartKey: (key) =>
    set((s) => ({
      selectedChartKey: s.selectedChartKey === key ? null : key,
    })),

  setChatSidebarView: (view) => set({ chatSidebarView: view }),

  toggleChatSidebarView: () =>
    set((s) => ({
      chatSidebarView: s.chatSidebarView === "chat" ? "settings" : "chat",
    })),

  setSaveDocumentsOnDb: (value) => set({ saveDocumentsOnDb: value }),
}));
