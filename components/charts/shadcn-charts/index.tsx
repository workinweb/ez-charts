"use client";

import type { JSX } from "react";
import { ShadcnAreaChart } from "./AreaChart";
import { ShadcnBarChart } from "./BarChart";
import { ShadcnHorizontalBarChart } from "./HorizontalBarChart";
import { ShadcnLineChart } from "./LineChart";
import { ShadcnDonutChart } from "./DonutChart";
import { ShadcnPieChart } from "./PieChart";
import { ShadcnPieStackedChart } from "./PieStackedChart";
import { ShadcnRadarChart } from "./RadarChart";
import { ShadcnRadialChart } from "./RadialChart";
import { inferCartesianConfig, inferPieConfig, inferStackedPieConfig } from "./utils";

export { SHADCN_CHART_TYPES } from "./utils";
export type { ShadcnChartTypeKey } from "./utils";
export {
  ShadcnAreaChart,
  ShadcnBarChart,
  ShadcnDonutChart,
  ShadcnHorizontalBarChart,
  ShadcnLineChart,
  ShadcnPieChart,
  ShadcnPieStackedChart,
  ShadcnRadarChart,
  ShadcnRadialChart,
};

export type ShadcnChartData =
  | Record<string, string | number>[] // Cartesian
  | Array<{ name: string; value: number; fill?: string }> // pie
  | Array<{ name: string; value: number }>; // radial

export type ShadcnChartOptions = {
  className?: string;
  seriesColors?: Record<string, string>;
  /** Category key from data (e.g. "key" from _data, "month", "subject"). Inferred from data when not provided. */
  categoryKey?: string;
  /** Full display config: withTooltip, withAnimation, withLabels, lineType, etc. */
  chartSettings?: Record<string, unknown>;
  /** Donut: when provided, legend items are clickable to select active segment. */
  onActiveIndexChange?: (index: number) => void;
};

/**
 * Render a shadcn chart by type key.
 * Data shape varies: Cartesian uses [{ month, desktop, mobile }], Pie/Radial use [{ name, value }].
 * seriesColors optionally overrides inferred config colors (e.g. from StyleEditor).
 */
export function getShadcnChartByName(
  data: ShadcnChartData,
  chartType: string,
  options?: ShadcnChartOptions,
): JSX.Element | null {
  const arr = Array.isArray(data) ? data : [];
  const className = options?.className ?? "min-h-[200px] w-full";
  const seriesColors = options?.seriesColors ?? {};
  const categoryKey =
    options?.categoryKey ??
    (arr[0] && typeof arr[0] === "object" && arr[0] !== null
      ? (Object.keys(arr[0] as object).find(
          (k) => typeof (arr[0] as Record<string, unknown>)[k] === "string",
        ) ?? "month")
      : "month");
  const chartSettings = options?.chartSettings ?? {};
  const withTooltip =
    (chartSettings.withTooltip as boolean | undefined) ?? true;
  const withAnimation =
    (chartSettings.withAnimation as boolean | undefined) ?? true;
  const withLegend =
    (chartSettings.withLegend as boolean | undefined) ?? true;

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
    case "shadcn:bar":
    case "shadcn:bar-stacked": {
      const d = arr as Record<string, string | number>[];
      const config = mergeConfig(
        inferCartesianConfig(d as Record<string, unknown>[], categoryKey),
        seriesColors,
      );
      const variant =
        chartType === "shadcn:bar-stacked" ? "stacked" : "default";
      const withLabels =
        (chartSettings.withLabels as boolean | undefined) ?? true;
      return (
        <ShadcnBarChart
          data={d}
          config={config}
          variant={variant}
          className={className}
          categoryKey={categoryKey}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
          withLabels={withLabels}
          withLegend={withLegend}
        />
      );
    }
    case "shadcn:bar-horizontal": {
      const d = arr as Record<string, string | number>[];
      const config = mergeConfig(
        inferCartesianConfig(d as Record<string, unknown>[], categoryKey),
        seriesColors,
      );
      const withLabels =
        (chartSettings.withLabels as boolean | undefined) ?? true;
      const categoryLabelPosition =
        (chartSettings.categoryLabelPosition as "inside" | "outside") ??
        "inside";
      return (
        <ShadcnHorizontalBarChart
          data={d}
          config={config}
          className={className}
          categoryKey={categoryKey}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
          withLabels={withLabels}
          categoryLabelPosition={categoryLabelPosition}
        />
      );
    }
    case "shadcn:area": {
      const d = arr as Record<string, string | number>[];
      const config = mergeConfig(
        inferCartesianConfig(d as Record<string, unknown>[], categoryKey),
        seriesColors,
      );
      return (
        <ShadcnAreaChart
          data={d}
          config={config}
          className={className}
          categoryKey={categoryKey}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
        />
      );
    }
    case "shadcn:line": {
      const d = arr as Record<string, string | number>[];
      const config = mergeConfig(
        inferCartesianConfig(d as Record<string, unknown>[], categoryKey),
        seriesColors,
      );
      const lineType =
        (chartSettings.lineType as "curved" | "linear" | "step") ?? "curved";
      return (
        <ShadcnLineChart
          data={d}
          config={config}
          className={className}
          categoryKey={categoryKey}
          lineType={lineType}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
        />
      );
    }
    case "shadcn:pie-stacked": {
      const d = arr as Record<string, string | number>[];
      const stackedConfig = inferStackedPieConfig(
        d as Record<string, unknown>[],
        categoryKey,
      ) as Record<string, { label: string; color: string }>;
      const config = mergeConfig(stackedConfig, seriesColors);
      return (
        <ShadcnPieStackedChart
          data={d}
          config={config}
          className={className}
          categoryKey={categoryKey}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
          withLegend={withLegend}
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
          withLegend={withLegend}
        />
      );
    }
    case "shadcn:donut": {
      const d = arr as { name: string; value: number; fill?: string }[];
      const config = inferPieConfig(d);
      const withCenterText =
        (chartSettings.withCenterText as boolean | undefined) ?? false;
      const centerTextMode =
        (chartSettings.centerTextMode as "total" | "active") ?? "total";
      const activeIndex =
        (chartSettings.activeIndex as number | undefined) ?? -1;
      const withActiveSector =
        (chartSettings.withActiveSector as boolean | undefined) ??
        (activeIndex >= 0);
      const onActiveIndexChange = options?.onActiveIndexChange;
      return (
        <ShadcnDonutChart
          data={d}
          config={config}
          className={className}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
          withLegend={withLegend}
          withCenterText={withCenterText}
          centerTextMode={centerTextMode}
          withActiveSector={withActiveSector}
          activeIndex={activeIndex}
          onActiveIndexChange={onActiveIndexChange}
        />
      );
    }
    case "shadcn:radar": {
      const d = arr as Record<string, string | number>[];
      const config = mergeConfig(
        inferCartesianConfig(d as Record<string, unknown>[], categoryKey),
        seriesColors,
      );
      const radarGridType =
        (chartSettings.radarGridType as
          | "polygon"
          | "polygon-no-lines"
          | "circle"
          | "circle-no-lines"
          | "filled"
          | "circle-filled"
          | "none") ?? "polygon";
      const radarLinesOnly =
        (chartSettings.radarLinesOnly as boolean | undefined) ?? false;
      const radarWithLegend =
        (chartSettings.withLegend as boolean | undefined) ?? false;
      return (
        <ShadcnRadarChart
          data={d}
          config={config}
          className={className}
          categoryKey={categoryKey}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
          radarGridType={radarGridType}
          radarLinesOnly={radarLinesOnly}
          withLegend={radarWithLegend}
        />
      );
    }
    case "shadcn:radial": {
      const d = arr as { name: string; value: number; fill?: string }[];
      const config = inferPieConfig(d);
      const radialWithLabels =
        (chartSettings.withLabels as boolean | undefined) ?? false;
      const radialWithGrid =
        (chartSettings.withGrid as boolean | undefined) ?? false;
      return (
        <ShadcnRadialChart
          data={d}
          config={config}
          className={className}
          withTooltip={withTooltip}
          withAnimation={withAnimation}
          withLabels={radialWithLabels}
          withGrid={radialWithGrid}
        />
      );
    }
    default:
      return null;
  }
}
