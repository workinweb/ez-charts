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

export type ShadcnChartOptions = {
  className?: string;
  seriesColors?: Record<string, string>;
  withTooltip?: boolean;
  withAnimation?: boolean;
};

/**
 * Render a shadcn chart by type key.
 * Data shape varies: Cartesian uses [{ month, desktop, mobile }], Pie/Radial use [{ name, value }].
 * seriesColors optionally overrides inferred config colors (e.g. from StyleEditor).
 */
export function getShadcnChartByName(
  data: ShadcnChartData,
  chartType: string,
  options?: ShadcnChartOptions
): JSX.Element | null {
  const arr = Array.isArray(data) ? data : [];
  const className = options?.className ?? "min-h-[200px] w-full";
  const seriesColors = options?.seriesColors ?? {};
  const withTooltip = options?.withTooltip ?? true;
  const withAnimation = options?.withAnimation ?? true;

  const mergeConfig = (
    config: Record<string, { label: string; color: string }>,
    overrides: Record<string, string>,
  ) => {
    const out = { ...config };
    for (const [k, color] of Object.entries(overrides)) {
      if (out[k]) out[k] = { ...out[k], color };
      else out[k] = { label: k, color };
    }
    return out;
  };

  switch (chartType) {
    case "shadcn:bar": {
      const d = arr as Record<string, string | number>[];
      const config = mergeConfig(
        inferCartesianConfig(d as Record<string, unknown>[], "month"),
        seriesColors,
      );
      return (
        <ShadcnBarChart
          data={d}
          config={config}
          className={className}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
        />
      );
    }
    case "shadcn:area": {
      const d = arr as Record<string, string | number>[];
      const config = mergeConfig(
        inferCartesianConfig(d as Record<string, unknown>[], "month"),
        seriesColors,
      );
      return (
        <ShadcnAreaChart
          data={d}
          config={config}
          className={className}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
        />
      );
    }
    case "shadcn:line": {
      const d = arr as Record<string, string | number>[];
      const config = mergeConfig(
        inferCartesianConfig(d as Record<string, unknown>[], "month"),
        seriesColors,
      );
      return (
        <ShadcnLineChart
          data={d}
          config={config}
          className={className}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
        />
      );
    }
    case "shadcn:pie": {
      const d = arr as { name: string; value: number; fill?: string }[];
      const config = inferPieConfig(d);
      return (
        <ShadcnPieChart
          data={d}
          config={config}
          className={className}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
        />
      );
    }
    case "shadcn:radar": {
      const d = arr as Record<string, string | number>[];
      const config = mergeConfig(
        inferCartesianConfig(d as Record<string, unknown>[], "subject"),
        seriesColors,
      );
      return (
        <ShadcnRadarChart
          data={d}
          config={config}
          className={className}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
        />
      );
    }
    case "shadcn:radial": {
      const d = arr as { name: string; value: number; fill?: string }[];
      const config = inferPieConfig(d);
      return (
        <ShadcnRadialChart
          data={d}
          config={config}
          className={className}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
        />
      );
    }
    default:
      return null;
  }
}
