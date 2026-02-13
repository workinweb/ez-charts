/* ─────────────────────────────────────────────────────────────────────────
 * Shared types & utilities for the chart editor
 * ────────────────────────────────────────────────────────────────────── */

export type EditorShape =
  | "keyValue" // { key, value, color? }
  | "bar-image" // { key, value, color?, image }
  | "bar-multi" // { key, values[], multipleColors[] }
  | "line" // series → { data: [{ date, value }], color }
  | "pie" // { name, value, colorFrom?, colorTo?, logo? }
  | "treemap" // { name, subtopics, colorFrom?, colorTo? }
  | "scatter"; // { xValue, yValue, name, color? }

export type EditorTab = "data" | "style" | "settings";

export interface EditorProps {
  shape: EditorShape;
  data: unknown;
  onChange: (data: unknown) => void;
}

export function getEditorShape(chartType: string): EditorShape {
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

export const DEFAULT_CHART_TYPE = "horizontal-bar" as const;

export const DEFAULT_CREATE_DATA = [
  { key: "Item 1", value: 0 },
  { key: "Item 2", value: 10 },
  { key: "Item 3", value: 25 },
];

/** Default data for a chart type when switching to an incompatible type */
export function getDefaultDataForChartType(chartType: string): unknown[] {
  if (chartType === "horizontal-bar-image") {
    return [{ key: "Item 1", value: 0, image: "" }];
  }
  if (
    chartType === "horizontal-bar-multi" ||
    chartType === "vertical-bar-multi"
  ) {
    return [{ key: "Item 1", values: [10, 20, 30] }];
  }
  if (chartType.includes("line")) {
    return [
      {
        data: [
          { date: "2024-01-01", value: 0 },
          { date: "2024-01-02", value: 10 },
        ],
      },
    ];
  }
  if (
    chartType.includes("pie") ||
    chartType.includes("donut") ||
    chartType.includes("fillable") ||
    chartType.includes("half")
  ) {
    return [
      { name: "Slice 1", value: 30 },
      { name: "Slice 2", value: 70 },
    ];
  }
  if (chartType.includes("treemap")) {
    return [{ name: "Group 1", subtopics: [{ A: 40, B: 60 }] }];
  }
  if (chartType.includes("scatter")) {
    return [{ xValue: 10, yValue: 20, name: "Point 1" }];
  }
  return cloneData(DEFAULT_CREATE_DATA);
}
