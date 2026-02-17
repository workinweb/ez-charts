/**
 * Load chart-type-specific prompt content for the LLM.
 * Loads only the .md for the chart type being used (reduces tokens).
 */
import fs from "fs";
import path from "path";

const PROMPTS_ROOT = path.join(process.cwd(), "prompts");

/**
 * Get the file path for a chart type's prompt.
 * - Rosencharts: prompts/rosencharts/{chartType}.md (e.g. horizontal-bar.md)
 * - Shadcn: prompts/shadcn/{name}.md (e.g. bar.md for shadcn:bar)
 */
function getChartPromptPath(chartType: string): string {
  if (chartType.startsWith("shadcn:")) {
    const name = chartType.slice(7); // "shadcn:bar" -> "bar"
    return path.join(PROMPTS_ROOT, "shadcn", `${name}.md`);
  }
  return path.join(PROMPTS_ROOT, "rosencharts", `${chartType}.md`);
}

/**
 * Load the markdown content for a chart type. Returns empty string if file not found.
 */
export function getChartPromptContent(chartType: string): string {
  const filePath = getChartPromptPath(chartType);
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8").trim();
    }
  } catch {
    // ignore
  }
  return "";
}
