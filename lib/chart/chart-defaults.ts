/**
 * Default chart data for each chart type.
 * Used when creating new charts or switching to incompatible chart types.
 * Shadcn uses canonical { _data, _seriesColors } format.
 */

import { wrapShadcnData } from "./shadcn-chart-data";

export const DEFAULT_CHART_TYPE = "shadcn:bar" as const;

/** Default data for Shadcn Cartesian (bar, area, line) — canonical wrapped format */
export const SHADCN_CARTESIAN_DEFAULT = wrapShadcnData(
  [
    { month: "Jan", series1: 186, series2: 80, series3: 45 },
    { month: "Feb", series1: 305, series2: 200, series3: 120 },
    { month: "Mar", series1: 237, series2: 120, series3: 85 },
  ],
  { chartType: "shadcn:bar" },
);

/** Default data for Shadcn bar-horizontal — single series only */
export const SHADCN_BAR_HORIZONTAL_DEFAULT = wrapShadcnData(
  [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
  ],
  { chartType: "shadcn:bar-horizontal" },
);

/** Default data for Shadcn pie/radial — canonical wrapped format */
export const SHADCN_PIE_DEFAULT = wrapShadcnData(
  [
    { name: "Technology", value: 548 },
    { name: "Utilities", value: 412 },
    { name: "Materials", value: 287 },
  ],
  { chartType: "shadcn:pie" },
);

/** Default data for Shadcn pie-stacked — Cartesian (category + 2 series) */
export const SHADCN_PIE_STACKED_DEFAULT = wrapShadcnData(
  [
    { month: "Jan", desktop: 186, mobile: 80 },
    { month: "Feb", desktop: 305, mobile: 200 },
    { month: "Mar", desktop: 237, mobile: 120 },
    { month: "Apr", desktop: 173, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
  ],
  { chartType: "shadcn:pie-stacked" },
);

/** Default data for Shadcn radar — canonical wrapped format */
export const SHADCN_RADAR_DEFAULT = wrapShadcnData(
  [
    { subject: "Math", A: 120, B: 110, C: 90 },
    { subject: "Chinese", A: 98, B: 130, C: 85 },
    { subject: "English", A: 86, B: 130, C: 95 },
  ],
  { chartType: "shadcn:radar" },
);

/** Default data for Rosencharts keyValue (horizontal-bar, gradient, thin, vertical-bar, breakdown, benchmark) */
export const ROSENCHARTS_KEYVALUE_DEFAULT = [
  { key: "Item 1", value: 186 },
  { key: "Item 2", value: 305 },
  { key: "Item 3", value: 237 },
];

/** Default data for Rosencharts bar-image */
export const ROSENCHARTS_BAR_IMAGE_DEFAULT = [
  { key: "Item 1", value: 186, image: "" },
];

/** Default data for Rosencharts bar-multi */
export const ROSENCHARTS_BAR_MULTI_DEFAULT = [
  { key: "Item 1", values: [10, 20, 30] },
];

/** Default data for Rosencharts line/area (single series) */
export const ROSENCHARTS_LINE_DEFAULT = [
  {
    data: [
      { date: "2024-01-01", value: 0 },
      { date: "2024-01-02", value: 10 },
      { date: "2024-01-03", value: 25 },
    ],
  },
];

/** Default data for Rosencharts pie/donut/fillable */
export const ROSENCHARTS_PIE_DEFAULT = [
  { name: "Slice 1", value: 30 },
  { name: "Slice 2", value: 70 },
];

/** Default data for Rosencharts treemap */
export const ROSENCHARTS_TREEMAP_DEFAULT = [
  {
    name: "Group 1",
    subtopics: [
      { key: "A", value: 40 },
      { key: "B", value: 60 },
    ],
  },
];

/** Default data for Rosencharts scatter */
export const ROSENCHARTS_SCATTER_DEFAULT = [
  { xValue: 10, yValue: 20, name: "Point 1" },
];

/** Default data for Rosencharts funnel */
export const ROSENCHARTS_FUNNEL_DEFAULT = [
  { key: "Visitors", value: 2840 },
  { key: "Sign-ups", value: 1920 },
  { key: "Trials", value: 847 },
  { key: "Paid", value: 520 },
  { key: "Churned", value: 180 },
];

/** Default data for Rosencharts bubble */
export const ROSENCHARTS_BUBBLE_DEFAULT = [
  { name: "Cloud", sector: "Tech", value: 2840 },
  { name: "Mobile", sector: "Tech", value: 1920 },
  { name: "Desktop", sector: "Tech", value: 847 },
  { name: "Solar", sector: "Energy", value: 1560 },
  { name: "Wind", sector: "Energy", value: 920 },
  { name: "Gas", sector: "Energy", value: 430 },
  { name: "Equities", sector: "Financials", value: 2130 },
  { name: "Fixed Income", sector: "Financials", value: 1180 },
  { name: "Cash", sector: "Financials", value: 340 },
  { name: "Healthcare", sector: "Industrials", value: 780 },
  { name: "Retail", sector: "Industrials", value: 520 },
];

/** Default data when creating a new chart (uses default chart type) */
export const DEFAULT_CREATE_DATA = SHADCN_CARTESIAN_DEFAULT;

/** Get default data for a chart type */
export function getDefaultDataForChartType(chartType: string): unknown[] {
  if (chartType.startsWith("shadcn:")) {
    if (
      chartType === "shadcn:pie" ||
      chartType === "shadcn:donut" ||
      chartType === "shadcn:radial"
    ) {
      return JSON.parse(JSON.stringify(SHADCN_PIE_DEFAULT));
    }
    if (chartType === "shadcn:pie-stacked") {
      return JSON.parse(JSON.stringify(SHADCN_PIE_STACKED_DEFAULT));
    }
    if (chartType === "shadcn:radar") {
      return JSON.parse(JSON.stringify(SHADCN_RADAR_DEFAULT));
    }
    if (chartType === "shadcn:bar-horizontal") {
      return JSON.parse(JSON.stringify(SHADCN_BAR_HORIZONTAL_DEFAULT));
    }
    return JSON.parse(JSON.stringify(SHADCN_CARTESIAN_DEFAULT));
  }

  // Rosencharts
  if (chartType === "horizontal-bar-image") {
    return JSON.parse(JSON.stringify(ROSENCHARTS_BAR_IMAGE_DEFAULT));
  }
  if (
    chartType === "horizontal-bar-multi" ||
    chartType === "vertical-bar-multi"
  ) {
    return JSON.parse(JSON.stringify(ROSENCHARTS_BAR_MULTI_DEFAULT));
  }
  if (
    chartType === "line" ||
    chartType === "line-multi" ||
    chartType === "line-curved" ||
    chartType === "area"
  ) {
    return JSON.parse(JSON.stringify(ROSENCHARTS_LINE_DEFAULT));
  }
  if (
    chartType.includes("pie") ||
    chartType.includes("donut") ||
    chartType.includes("fillable") ||
    chartType.includes("half")
  ) {
    return JSON.parse(JSON.stringify(ROSENCHARTS_PIE_DEFAULT));
  }
  if (chartType.includes("treemap")) {
    return JSON.parse(JSON.stringify(ROSENCHARTS_TREEMAP_DEFAULT));
  }
  if (chartType.includes("scatter")) {
    return JSON.parse(JSON.stringify(ROSENCHARTS_SCATTER_DEFAULT));
  }
  if (chartType.includes("bubble")) {
    return JSON.parse(JSON.stringify(ROSENCHARTS_BUBBLE_DEFAULT));
  }
  if (chartType.includes("funnel")) {
    return JSON.parse(JSON.stringify(ROSENCHARTS_FUNNEL_DEFAULT));
  }

  // horizontal-bar, horizontal-bar-gradient, horizontal-bar-thin, vertical-bar,
  // breakdown, breakdown-thin, benchmark
  return JSON.parse(JSON.stringify(ROSENCHARTS_KEYVALUE_DEFAULT));
}
