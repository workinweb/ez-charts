import { barChartData } from "./bar";
import { barChartMultiData, barChartStackedData } from "./bar";
import { areaChartData } from "./area";
import { lineChartData } from "./line";
import { pieChartData } from "./pie";
import { pieStackedChartData } from "./pie-stacked";
import { donutChartData } from "./donut";
import { radarChartData } from "./radar";
import { radialChartData } from "./radial";

export const shadcnExampleData = [
  // ── Bar ─────────────────────────────────────────────────────
  { id: "sc-bar", name: "Bar Chart", chartType: "shadcn:bar", data: barChartData },
  { id: "sc-bar-multi", name: "Bar (Multi Series)", chartType: "shadcn:bar", data: barChartMultiData },
  { id: "sc-bar-nolabel", name: "Bar (No Labels)", chartType: "shadcn:bar", data: barChartData, withLabels: false },
  { id: "sc-bar-h", name: "Bar (Horizontal)", chartType: "shadcn:bar-horizontal", data: barChartMultiData },
  { id: "sc-bar-h-outside", name: "Bar (H — Outside Labels)", chartType: "shadcn:bar-horizontal", data: barChartMultiData, categoryLabelPosition: "outside" },
  { id: "sc-bar-stacked", name: "Bar (Stacked)", chartType: "shadcn:bar-stacked", data: barChartStackedData },

  // ── Area ────────────────────────────────────────────────────
  { id: "sc-area", name: "Area Chart", chartType: "shadcn:area", data: areaChartData },

  // ── Line ────────────────────────────────────────────────────
  { id: "sc-line-curved", name: "Line (Curved)", chartType: "shadcn:line", data: lineChartData, lineType: "curved" },
  { id: "sc-line-linear", name: "Line (Linear)", chartType: "shadcn:line", data: lineChartData, lineType: "linear" },
  { id: "sc-line-step", name: "Line (Step)", chartType: "shadcn:line", data: lineChartData, lineType: "step" },

  // ── Pie ─────────────────────────────────────────────────────
  { id: "sc-pie", name: "Pie Chart", chartType: "shadcn:pie", data: pieChartData },
  { id: "sc-pie-stacked", name: "Pie (Stacked)", chartType: "shadcn:pie-stacked", data: pieStackedChartData },

  // ── Donut ───────────────────────────────────────────────────
  { id: "sc-donut", name: "Donut Chart", chartType: "shadcn:donut", data: donutChartData },
  { id: "sc-donut-center", name: "Donut (Center Total)", chartType: "shadcn:donut", data: donutChartData, withCenterText: true, centerTextMode: "total" },
  { id: "sc-donut-active", name: "Donut (Active Sector)", chartType: "shadcn:donut", data: donutChartData, withActiveSector: true, activeIndex: 0 },

  // ── Radar ───────────────────────────────────────────────────
  { id: "sc-radar", name: "Radar (Polygon)", chartType: "shadcn:radar", data: radarChartData, radarGridType: "polygon" },
  { id: "sc-radar-circle", name: "Radar (Circle)", chartType: "shadcn:radar", data: radarChartData, radarGridType: "circle" },
  { id: "sc-radar-filled", name: "Radar (Filled)", chartType: "shadcn:radar", data: radarChartData, radarGridType: "filled" },
  { id: "sc-radar-lines", name: "Radar (Lines Only)", chartType: "shadcn:radar", data: radarChartData, radarLinesOnly: true },

  // ── Radial ──────────────────────────────────────────────────
  { id: "sc-radial", name: "Radial Chart", chartType: "shadcn:radial", data: radialChartData },
  { id: "sc-radial-labels", name: "Radial (Labels)", chartType: "shadcn:radial", data: radialChartData, withLabels: true },
  { id: "sc-radial-grid", name: "Radial (Grid)", chartType: "shadcn:radial", data: radialChartData, withGrid: true },
];
