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

function parseFromBuffer(
  buffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  return (async () => {
    const raw = new TextDecoder().decode(buffer);
    const fileNameLower = fileName.toLowerCase();
    if (mimeType === "text/csv" || fileNameLower.endsWith(".csv")) {
      const Papa = (await import("papaparse")).default;
      const parsed = Papa.parse(raw, { header: true, skipEmptyLines: true });
      return `CSV file "${fileName}" with ${parsed.data.length} rows and columns: ${(parsed.meta.fields ?? []).join(", ")}.\n\nData (first 50 rows):\n${JSON.stringify(parsed.data.slice(0, 50), null, 2)}`;
    }
    if (
      fileNameLower.endsWith(".xlsx") ||
      fileNameLower.endsWith(".xls") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("ms-excel")
    ) {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheets: string[] = [];
      for (const sheetName of workbook.SheetNames.slice(0, 5)) {
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const headers = json.length > 0 ? Object.keys(json[0] as object) : [];
        sheets.push(
          `Sheet "${sheetName}" with ${json.length} rows and columns: ${headers.join(", ")}.\nData (first 50 rows):\n${JSON.stringify(json.slice(0, 50), null, 2)}`,
        );
      }
      return `Excel file "${fileName}" with ${workbook.SheetNames.length} sheet(s):\n\n${sheets.join("\n\n")}`;
    }
    if (mimeType === "application/pdf" || fileNameLower.endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      const fullText = textResult.text.slice(0, 15000);
      const pageCount = textResult.pages?.length ?? 0;
      await parser.destroy();
      return `PDF file "${fileName}" with ${pageCount} page(s).\n\nExtracted text:\n${fullText}`;
    }
    if (mimeType === "application/json" || fileNameLower.endsWith(".json")) {
      const parsed = JSON.parse(raw);
      const preview = JSON.stringify(parsed, null, 2).slice(0, 15000);
      return `JSON file "${fileName}".\n\nContent:\n${preview}`;
    }
    if (
      mimeType.startsWith("text/") ||
      fileNameLower.endsWith(".txt") ||
      fileNameLower.endsWith(".tsv")
    ) {
      return `Text file "${fileName}".\n\nContent:\n${raw.slice(0, 15000)}`;
    }
    throw new Error(
      `Unsupported file type: ${mimeType || fileNameLower}. Supported: CSV, Excel (.xlsx/.xls), PDF, JSON, TXT, TSV.`,
    );
  })();
}

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
