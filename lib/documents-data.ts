import { savedDocumentsFixture } from "@/fixtures/saved-documents";

/** Saved document from chat attachments (when Save documents on DB is enabled) */
export interface SavedDocument {
  id: string;
  name: string;
  size: number;
  /** MIME type or extension hint */
  type: string;
  /** Parsed/text content for download */
  content: string;
  createdAt: string;
}

export const savedDocuments: SavedDocument[] = [...savedDocumentsFixture];

export function getDocumentById(id: string): SavedDocument | undefined {
  return savedDocuments.find((d) => d.id === id);
}
