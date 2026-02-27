import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = [
  "text/csv",
  "application/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/pdf",
  "application/json",
  "text/plain",
  "text/tab-separated-values",
  "application/octet-stream",
];

const MAX_SIZE = 10 * 1024 * 1024;

export const runtime = "nodejs"; // ensure Node.js runtime, not Edge

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured." },
      { status: 503 },
    );
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      file = formData.get("file") as File | null;
    } else {
      // Fallback: treat body as raw file, get metadata from headers
      const fileName = decodeURIComponent(
        request.headers.get("x-file-name") ?? "upload",
      );
      const mimeType =
        request.headers.get("x-file-type") ?? "application/octet-stream";
      const blob = await request.blob();
      file = new File([blob], fileName, { type: mimeType });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 413 },
      );
    }

    const pathname = `chat/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const blobResult = await put(pathname, file, {
      access: "private",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blobResult.url });
  } catch (error) {
    console.error("[blob/upload] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
