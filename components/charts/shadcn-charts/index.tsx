"use client";

import type { JSX } from "react";
import { ShadcnAreaChart } from "./AreaChart";
import { ShadcnBarChart } from "./BarChart";
import { ShadcnLineChart } from "./LineChart";
import { ShadcnPieChart } from "./PieChart";
import { ShadcnRadarChart } from "./RadarChart";
import { ShadcnRadialChart } from "./RadialChart";
import { inferCartesianConfig, inferPieConfig } from "./utils";

export { SHADCN_CHART_TYPES } from "./utils";
export type { ShadcnChartTypeKey } from "./utils";
export { ShadcnAreaChart, ShadcnBarChart, ShadcnLineChart, ShadcnPieChart, ShadcnRadarChart, ShadcnRadialChart };

export type ShadcnChartData =
  | Record<string, string | number>[] // Cartesian
  | Array<{ name: string; value: number; fill?: string }> // pie
  | Array<{ name: string; value: number }>; // radial

/**
 * Render a shadcn chart by type key.
 * Data shape varies: Cartesian uses [{ month, desktop, mobile }], Pie/Radial use [{ name, value }].
 */
export function getShadcnChartByName(
  data: ShadcnChartData,
  chartType: string,
  options?: { className?: string }
): JSX.Element | null {
  const arr = Array.isArray(data) ? data : [];
  const className = options?.className ?? "min-h-[200px] w-full";

  switch (chartType) {
    case "shadcn:bar": {
      const d = arr as Record<string, string | number>[];
      const config = inferCartesianConfig(d as Record<string, unknown>[], "month");
      return <ShadcnBarChart data={d} config={config} className={className} />;
    }
    case "shadcn:area": {
      const d = arr as Record<string, string | number>[];
      const config = inferCartesianConfig(d as Record<string, unknown>[], "month");
      return <ShadcnAreaChart data={d} config={config} className={className} />;
    }
    case "shadcn:line": {
      const d = arr as Record<string, string | number>[];
      const config = inferCartesianConfig(d as Record<string, unknown>[], "month");
      return <ShadcnLineChart data={d} config={config} className={className} />;
    }
    case "shadcn:pie": {
      const d = arr as { name: string; value: number; fill?: string }[];
      const config = inferPieConfig(d);
      return <ShadcnPieChart data={d} config={config} className={className} />;
    }
    case "shadcn:radar": {
      const d = arr as Record<string, string | number>[];
      const config = inferCartesianConfig(d as Record<string, unknown>[], "subject");
      return <ShadcnRadarChart data={d} config={config} className={className} />;
    }
    case "shadcn:radial": {
      const d = arr as { name: string; value: number }[];
      const config = inferPieConfig(d);
      return <ShadcnRadialChart data={d} config={config} className={className} />;
    }
    default:
      return null;
  }
}
