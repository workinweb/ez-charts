/**
 * Chart library + type handling.
 * chartLibrary: "shadcn" | "rosencharts"
 * chartType: type key within library (e.g. "bar", "horizontal-bar")
 */

export type ChartLibrary = "shadcn" | "rosencharts";

export const DEFAULT_CHART_LIBRARY: ChartLibrary = "shadcn";
export const DEFAULT_CHART_TYPE = "bar";

/** Full key for renderChart: "shadcn:bar" or "horizontal-bar" */
export function toChartKey(
  chartLibrary: ChartLibrary,
  chartType: string
): string {
  if (chartLibrary === "shadcn") {
    return `shadcn:${chartType}`;
  }
  return chartType;
}

/** Parse full key or legacy chartType into library + type */
export function fromChartKey(key: string): { chartLibrary: ChartLibrary; chartType: string } {
  if (key.startsWith("shadcn:")) {
    return { chartLibrary: "shadcn", chartType: key.slice(7) };
  }
  return { chartLibrary: "rosencharts", chartType: key };
}

/** Normalize chart from DB: supports legacy (chartType only) or new (chartLibrary + chartType) */
export function normalizeChartForRender(chart: {
  chartType: string;
  chartLibrary?: ChartLibrary;
}): string {
  if (chart.chartLibrary) {
    return toChartKey(chart.chartLibrary, chart.chartType);
  }
  return chart.chartType;
}
