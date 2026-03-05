import { parseFromBuffer } from "@/lib/parse-file-buffer";
import { NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/** Resolve Google Docs/Sheets/Drive URLs to direct download/export URLs */
function resolveDownloadUrl(
  url: string,
): { url: string; fileName: string; mimeType: string } | null {
  try {
    const parsed = new URL(url);

    // Google Docs: /document/d/{id}/edit or /view
    const docsMatch = parsed.hostname === "docs.google.com" &&
      parsed.pathname.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docsMatch) {
      const id = docsMatch[1];
      return {
        url: `https://docs.google.com/document/d/${id}/export?format=txt`,
        fileName: "document.txt",
        mimeType: "text/plain",
      };
    }

    // Google Sheets: /spreadsheets/d/{id}/edit or /view
    const sheetsMatch = parsed.hostname === "docs.google.com" &&
      parsed.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheetsMatch) {
      const id = sheetsMatch[1];
      return {
        url: `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`,
        fileName: "spreadsheet.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }

    // Google Drive file: /file/d/{id}/view or /open?id={id}
    const pathMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const queryId = parsed.searchParams.get("id");
    const driveId = pathMatch?.[1] ?? (parsed.hostname === "drive.google.com" ? queryId : null);
    if (parsed.hostname === "drive.google.com" && driveId) {
      return {
        url: `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`,
        fileName: "document",
        mimeType: "application/octet-stream",
      };
    }

    return null;
  } catch {
    return null;
  }
}

/** Derive filename from URL (pathname) */
function fileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").filter(Boolean).pop();
    return segment && /\.\w+$/.test(segment)
      ? decodeURIComponent(segment)
      : "document";
  } catch {
    return "document";
  }
}

/** Derive mime type from filename or Content-Type */
function mimeFromFilename(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    csv: "text/csv",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    pdf: "application/pdf",
    json: "application/json",
    txt: "text/plain",
    tsv: "text/tab-separated-values",
  };
  return map[ext ?? ""] ?? "application/octet-stream";
}

/** Check if response is HTML (web page, not document) */
function isHtmlResponse(contentType: string, buffer: ArrayBuffer): boolean {
  const ct = contentType.toLowerCase();
  if (ct.includes("text/html")) return true;
  const start = new TextDecoder().decode(buffer.slice(0, 200));
  return /^\s*<!DOCTYPE\s+html/i.test(start) || /^\s*<html/i.test(start);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    const url = body.url?.trim();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only http and https URLs are supported" },
        { status: 400 },
      );
    }

    // Resolve Google Docs/Sheets/Drive to direct download URLs
    const resolved = resolveDownloadUrl(url);
    const fetchUrl = resolved?.url ?? url;
    let fileName = resolved?.fileName ?? fileNameFromUrl(url);
    let mimeType = resolved?.mimeType ?? "";

    const res = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Ez2Chart/1.0; data-import)",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${res.status} ${res.statusText}` },
        { status: 400 },
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    const responseMime = contentType.split(";")[0]?.trim();
    if (!mimeType || mimeType === "application/octet-stream") {
      mimeType = responseMime || mimeFromFilename(fileName);
    }

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 413 },
      );
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 413 },
      );
    }

    // Reject HTML (web page) - user likely pasted a viewer link instead of direct file
    if (isHtmlResponse(contentType, buffer)) {
      return NextResponse.json(
        {
          error:
            "This URL returns a web page, not a document. For Google Docs or Sheets, use the share link (e.g. docs.google.com/document/d/.../edit). For PDFs, use a direct file link.",
        },
        { status: 400 },
      );
    }

    // Get filename from Content-Disposition if available (e.g. Google Drive)
    const disposition = res.headers.get("content-disposition");
    if (disposition) {
      const filenameMatch = disposition.match(/filename[*]?=(?:UTF-8'')?"?([^";\n]+)"?/i);
      if (filenameMatch?.[1]) {
        fileName = decodeURIComponent(filenameMatch[1].trim());
      }
    }

    // Ensure filename has correct extension for parser (e.g. Drive PDFs)
    if (!fileName.includes(".") && mimeType) {
      const extMap: Record<string, string> = {
        "application/pdf": "pdf",
        "text/plain": "txt",
        "text/csv": "csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
      };
      const ext = extMap[mimeType];
      if (ext) fileName = `${fileName}.${ext}`;
    }

    const textContent = await parseFromBuffer(buffer, fileName, mimeType);

    return NextResponse.json({
      fileName,
      mimeType,
      size: buffer.byteLength,
      textContent,
    });
  } catch (error) {
    console.error("Error parsing URL:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to fetch or parse URL";
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    );
  }
}
