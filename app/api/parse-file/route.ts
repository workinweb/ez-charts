import { parseFromBuffer } from "@/lib/parse-file-buffer";
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export const maxDuration = 30;
/** Force Node.js runtime; pdf-parse and xlsx require it (not Edge) */
export const runtime = "nodejs";
/** Prevent static optimization; required for POST to work on Vercel */
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await req.json()) as {
        blobUrl?: string;
        fileName?: string;
        mimeType?: string;
      };
      const blobUrl = body.blobUrl;
      const fileName = body.fileName ?? "";
      if (!blobUrl || !fileName) {
        return NextResponse.json(
          { error: "blobUrl and fileName required" },
          { status: 400 },
        );
      }
      const result = await get(blobUrl, { access: "private" });
      if (!result || result.statusCode !== 200 || !result.stream) {
        return NextResponse.json(
          { error: "Failed to fetch file from blob" },
          { status: 400 },
        );
      }
      const buffer = await new Response(result.stream).arrayBuffer();
      if (buffer.byteLength > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large (max 10 MB)" },
          { status: 400 },
        );
      }
      const textContent = await parseFromBuffer(
        buffer,
        fileName,
        body.mimeType ?? "",
      );
      return NextResponse.json({
        fileName,
        mimeType: body.mimeType,
        size: buffer.byteLength,
        textContent,
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 400 },
      );
    }

    const mimeType = file.type || "";
    const buffer = await file.arrayBuffer();
    const textContent = await parseFromBuffer(buffer, file.name, mimeType);

    return NextResponse.json({
      fileName: file.name,
      mimeType,
      size: file.size,
      textContent,
    });
  } catch (error) {
    console.error("Error parsing file:", error);
    return NextResponse.json(
      { error: "Failed to parse file. Please try a different format." },
      { status: 500 },
    );
  }
}
