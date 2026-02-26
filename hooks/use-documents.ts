"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCallback, useState } from "react";

/** Document from Convex, normalized for UI. */
export interface DocumentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  createdAt: number;
  storageId?: Id<"_storage">;
}

function convexDocToItem(doc: {
  _id: Id<"documents">;
  name: string;
  size: number;
  mimeType: string;
  content: string;
  createdAt: number;
  storageId?: Id<"_storage">;
}): DocumentItem {
  return {
    id: doc._id,
    name: doc.name,
    size: doc.size,
    type: doc.mimeType,
    content: doc.content,
    createdAt: doc.createdAt,
    storageId: doc.storageId,
  };
}

/** List of documents from Convex for the authenticated user. */
export function useDocumentsList(): DocumentItem[] {
  const list = useQuery(api.documents.documents.list);
  return list?.map(convexDocToItem) ?? [];
}

/** Download URL for a document (from Convex storage). Null if no storageId. */
export function useDocumentDownloadUrl(id: Id<"documents"> | undefined) {
  return useQuery(
    api.documents.documents.getDownloadUrl,
    id ? { id } : "skip"
  );
}

/** Upload a file: parse, store in Convex storage, create document. */
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

export interface UseDocumentsMutationsResult {
  uploadFiles: (files: FileList | File[]) => Promise<void>;
  removeDocument: (id: Id<"documents">) => Promise<void>;
  uploading: boolean;
  uploadError: string | null;
}

/**
 * Mutations for documents. Must be used within a component that has
 * access to Convex (e.g. inside ConvexProvider). Upload flow:
 * 1. Parse file via /api/parse-file
 * 2. Generate Convex upload URL
 * 3. POST file to URL → get storageId
 * 4. Create document with storageId + content
 */
export function useDocumentsMutations(): UseDocumentsMutationsResult {
  const createDoc = useMutation(api.documents.documents.create);
  const removeDoc = useMutation(api.documents.documents.remove);
  const generateUploadUrl = useMutation(api.documents.documents.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      setUploadError(null);
      try {
        const fileArray = Array.from(files);
        for (const file of fileArray) {
          const { fileName, mimeType, size, textContent } = await parseFile(file);

          const uploadUrl = await generateUploadUrl();
          const res = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type || mimeType },
            body: file,
          });
          if (!res.ok) {
            throw new Error("Failed to upload file to storage");
          }
          const { storageId } = await res.json();

          await createDoc({
            name: fileName,
            size,
            mimeType,
            content: textContent,
            storageId,
          });
        }
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "Failed to upload"
        );
      } finally {
        setUploading(false);
      }
    },
    [createDoc, generateUploadUrl]
  );

  const removeDocument = useCallback(
    async (id: Id<"documents">) => {
      await removeDoc({ id });
    },
    [removeDoc]
  );

  return {
    uploadFiles,
    removeDocument,
    uploading,
    uploadError,
  };
}
