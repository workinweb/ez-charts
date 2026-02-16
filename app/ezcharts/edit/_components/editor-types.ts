/* ─────────────────────────────────────────────────────────────────────────
 * Shared types & utilities for the chart editor
 * ────────────────────────────────────────────────────────────────────── */

import {
  DEFAULT_CHART_TYPE as DEFAULT_CHART_TYPE_IMPORT,
  DEFAULT_CREATE_DATA as DEFAULT_CREATE_DATA_IMPORT,
  getDefaultDataForChartType as getDefaultDataForChartTypeImport,
} from "@/lib/chart-defaults";

export type EditorShape =
  | "keyValue" // { key, value, color? }
  | "bar-image" // { key, value, color?, image }
  | "bar-multi" // { key, values[], multipleColors[] }
  | "line" // series → { data: [{ date, value }], color }
  | "pie" // { name, value, colorFrom?, colorTo?, logo? }
  | "treemap" // { name, subtopics, colorFrom?, colorTo? }
  | "scatter" // { xValue, yValue, name, color? }
  | "shadcnCartesian"; // { month, desktop, mobile } — shadcn bar/area/line

export type EditorTab = "data" | "style" | "settings";

export interface EditorProps {
  shape: EditorShape;
  data: unknown;
  onChange: (data: unknown) => void;
}

export function getEditorShape(chartType: string): EditorShape {
  if (chartType.startsWith("shadcn:")) {
    if (chartType === "shadcn:pie" || chartType === "shadcn:radial") return "pie";
    if (chartType === "shadcn:radar") return "shadcnCartesian";
    if (["shadcn:bar", "shadcn:area", "shadcn:line"].includes(chartType)) return "shadcnCartesian";
    return "shadcnCartesian";
  }
  if (chartType === "horizontal-bar-image") return "bar-image";
  if (
    chartType === "horizontal-bar-multi" ||
    chartType === "vertical-bar-multi"
  )
    return "bar-multi";
  if (chartType.includes("line")) return "line";
  if (
    chartType.includes("pie") ||
    chartType.includes("donut") ||
    chartType.includes("fillable") ||
    chartType.includes("half")
  )
    return "pie";
  if (chartType.includes("treemap")) return "treemap";
  if (chartType.includes("scatter")) return "scatter";
  return "keyValue";
}

/** Deep-clone unknown data (JSON-safe) */
export function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export const DEFAULT_CHART_TYPE = DEFAULT_CHART_TYPE_IMPORT;
export const DEFAULT_CREATE_DATA = DEFAULT_CREATE_DATA_IMPORT;
export const getDefaultDataForChartType = getDefaultDataForChartTypeImport;
