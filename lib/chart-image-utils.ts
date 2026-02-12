/**
 * Generate a small placeholder image URL for chart items (bars, pie slices).
 * Uses UI Avatars API - no API key required. Good for company logos, categories.
 */

const UI_AVATARS_BASE = "https://ui-avatars.com/api/";
const DEFAULT_SIZE = 64;

/** Create a small avatar/placeholder image URL from a label (e.g. "Apple", "Germany") */
export function generateChartImageUrl(
  label: string,
  size: number = DEFAULT_SIZE,
): string {
  const name = (label || "?").trim().slice(0, 2).toUpperCase() || "?";
  const params = new URLSearchParams({
    name,
    size: String(size),
    background: "6C5DD3",
    color: "ffffff",
    bold: "true",
  });
  return `${UI_AVATARS_BASE}?${params.toString()}`;
}
