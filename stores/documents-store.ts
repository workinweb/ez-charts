"use client";

import { create } from "zustand";
import type { SavedDocument } from "@/lib/documents-data";
import { savedDocuments as initialDocs } from "@/lib/documents-data";

interface DocumentsState {
  documents: SavedDocument[];
  /** Search query for documents page */
  search: string;
  /** Whether a file upload is in progress */
  uploading: boolean;
  /** Error message from last upload attempt */
  uploadError: string | null;
  addDocument: (doc: Omit<SavedDocument, "id" | "createdAt">) => void;
  removeDocument: (id: string) => void;
  setSearch: (value: string) => void;
  /** Upload files: parse via API and add to store */
  uploadFiles: (files: FileList | File[]) => Promise<void>;
}

async function parseFile(file: File): Promise<{
  fileName: string;
  mimeType: string;
  size: number;
  textContent: string;
}> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/parse-file", { method: "POST", body: formData });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to parse file");
  }
  return res.json();
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: initialDocs,
  search: "",
  uploading: false,
  uploadError: null,

  addDocument: (doc) =>
    set((s) => ({
      documents: [
        ...s.documents,
        {
          ...doc,
          id: `doc-${Date.now()}`,
          createdAt: "Just now",
        },
      ],
    })),

  removeDocument: (id) =>
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
    })),

  setSearch: (value) => set({ search: value }),

  uploadFiles: async (files) => {
    set({ uploading: true, uploadError: null });
    try {
      for (const file of Array.from(files)) {
        const { fileName, mimeType, size, textContent } = await parseFile(file);
        get().addDocument({
          name: fileName,
          size,
          type: mimeType,
          content: textContent,
        });
      }
    } catch (err) {
      set({
        uploadError: err instanceof Error ? err.message : "Failed to upload",
      });
    } finally {
      set({ uploading: false });
    }
  },
}));
