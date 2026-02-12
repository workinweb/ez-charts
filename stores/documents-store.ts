"use client";

import { create } from "zustand";
import type { SavedDocument } from "@/lib/documents-data";
import { savedDocuments as initialDocs } from "@/lib/documents-data";

interface DocumentsState {
  documents: SavedDocument[];
  addDocument: (doc: Omit<SavedDocument, "id" | "createdAt">) => void;
  removeDocument: (id: string) => void;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  documents: initialDocs,

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
}));
