import { NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { PDFParse } from "pdf-parse";

export const maxDuration = 30;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  try {
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
    const fileName = file.name.toLowerCase();

    let textContent = "";

    // ── CSV ───────────────────────────────────────────────────────────
    if (mimeType === "text/csv" || fileName.endsWith(".csv")) {
      const raw = await file.text();
      const parsed = Papa.parse(raw, { header: true, skipEmptyLines: true });
      textContent = `CSV file "${file.name}" with ${parsed.data.length} rows and columns: ${(parsed.meta.fields ?? []).join(", ")}.\n\nData (first 50 rows):\n${JSON.stringify(parsed.data.slice(0, 50), null, 2)}`;
    }
    // ── Excel (xlsx / xls) ────────────────────────────────────────────
    else if (
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("ms-excel")
    ) {
      const buffer = await file.arrayBuffer();
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

      textContent = `Excel file "${file.name}" with ${workbook.SheetNames.length} sheet(s):\n\n${sheets.join("\n\n")}`;
    }
    // ── PDF ───────────────────────────────────────────────────────────
    else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      const fullText = textResult.text.slice(0, 15000);
      const pageCount = textResult.pages?.length ?? 0;
      await parser.destroy();
      textContent = `PDF file "${file.name}" with ${pageCount} page(s).\n\nExtracted text:\n${fullText}`;
    }
    // ── JSON ──────────────────────────────────────────────────────────
    else if (mimeType === "application/json" || fileName.endsWith(".json")) {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const preview = JSON.stringify(parsed, null, 2).slice(0, 15000);
      textContent = `JSON file "${file.name}".\n\nContent:\n${preview}`;
    }
    // ── Plain text / TSV ──────────────────────────────────────────────
    else if (
      mimeType.startsWith("text/") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".tsv")
    ) {
      const raw = await file.text();
      textContent = `Text file "${file.name}".\n\nContent:\n${raw.slice(0, 15000)}`;
    } else {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${mimeType || fileName}. Supported: CSV, Excel (.xlsx/.xls), PDF, JSON, TXT, TSV.`,
        },
        { status: 400 },
      );
    }

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
