import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Radar,
  Gauge,
} from "lucide-react";

export const SHADCN_CHART_TYPES = [
  { key: "shadcn:bar", label: "Bar", category: "bar", icon: BarChart3 },
  { key: "shadcn:bar-horizontal", label: "Bar (Horizontal)", category: "bar", icon: BarChart3 },
  { key: "shadcn:bar-stacked", label: "Bar (Stacked)", category: "bar", icon: BarChart3 },
  { key: "shadcn:area", label: "Area", category: "area", icon: Activity },
  { key: "shadcn:line", label: "Line", category: "line", icon: LineChartIcon },
  { key: "shadcn:pie", label: "Pie", category: "pie", icon: PieChartIcon },
  { key: "shadcn:pie-stacked", label: "Pie (Stacked)", category: "pie", icon: PieChartIcon },
  { key: "shadcn:donut", label: "Donut", category: "pie", icon: PieChartIcon },
  { key: "shadcn:radar", label: "Radar", category: "radar", icon: Radar },
  { key: "shadcn:radial", label: "Radial", category: "radial", icon: Gauge },
] as const;

export type ShadcnChartTypeKey = (typeof SHADCN_CHART_TYPES)[number]["key"];

/** Infer chartConfig from data shape for Cartesian charts (bar, area, line) */
export function inferCartesianConfig(
  data: Record<string, unknown>[],
  categoryKey = "month"
): Record<string, { label: string; color: string }> {
  const config: Record<string, { label: string; color: string }> = {};
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  if (!data[0]) return config;
  let i = 0;
  for (const k of Object.keys(data[0])) {
    if (k !== categoryKey && typeof (data[0] as Record<string, unknown>)[k] === "number") {
      config[k] = { label: k.charAt(0).toUpperCase() + k.slice(1), color: colors[i % colors.length] };
      i++;
    }
  }
  return config;
}

/** Infer chartConfig from pie/radial data. Uses item.fill when present for custom colors. */
export function inferPieConfig(
  data: { name: string; value: number; fill?: string }[],
): Record<string, { label: string; color: string }> {
  const config: Record<string, { label: string; color: string }> = {};
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  data.forEach((item, i) => {
    config[item.name] = {
      label: item.name,
      color: item.fill ?? colors[i % colors.length],
    };
  });
  return config;
}

/** Infer chartConfig for stacked pie: categories get colors, series get labels. */
export function inferStackedPieConfig(
  data: Record<string, unknown>[],
  categoryKey = "month",
): Record<string, { label: string; color: string }> {
  const config: Record<string, { label: string; color: string }> = {};
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  const first = data[0];
  if (!first) return config;
  let colorIdx = 0;
  for (const row of data) {
    const catVal = (row as Record<string, unknown>)[categoryKey];
    if (catVal != null && !(String(catVal) in config)) {
      config[String(catVal)] = {
        label: String(catVal),
        color: colors[colorIdx % colors.length],
      };
      colorIdx++;
    }
  }
  for (const k of Object.keys(first)) {
    if (k !== categoryKey && typeof (first as Record<string, unknown>)[k] === "number") {
      config[k] = {
        label: k.charAt(0).toUpperCase() + k.slice(1),
        color: colors[0],
      };
    }
  }
  return config;
}
