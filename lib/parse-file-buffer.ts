/** Parse file buffer to text content. Used by parse-file and parse-url APIs. */
export async function parseFromBuffer(
  buffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
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
}
