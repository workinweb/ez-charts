"use client";

import type { JSX } from "react";
import { getChartTypeByName } from "@/components/charts/rosencharts";
import { getShadcnChartByName } from "@/components/charts/shadcn-charts";
import { unwrapShadcnData } from "@/lib/chart/shadcn-chart-data";

/** Chart-like object with optional top-level withTooltip/withAnimation (Convex) and chartSettings */
interface ChartLike {
  withTooltip?: boolean;
  withAnimation?: boolean;
  chartSettings?: Record<string, unknown>;
}

/**
 * Merge chartSettings from chart. Top-level withTooltip/withAnimation (Convex) are folded in.
 * chartSettings is the single source; top-level values are fallbacks when chartSettings omits them.
 */
export function getMergedChartSettings(chart: ChartLike | null | undefined): Record<string, unknown> {
  const base = chart?.chartSettings ?? {};
  return {
    withTooltip: (base.withTooltip as boolean | undefined) ?? chart?.withTooltip ?? true,
    withAnimation: (base.withAnimation as boolean | undefined) ?? chart?.withAnimation ?? true,
    ...base,
  };
}

/**
 * Unified chart renderer: routes to Rosencharts or Shadcn based on chartType.
 * All display options (withTooltip, withAnimation, etc.) come from chartSettings.
 * - Rosencharts: horizontal-bar, pie, line, etc.
 * - Shadcn: shadcn:bar, shadcn:area, shadcn:line, shadcn:pie, shadcn:radar, shadcn:radial
 * @param options.chartSettings - Full display config (withTooltip, withAnimation, withLabels, lineType, etc.)
 * @param options.presentationMode - When true, charts fill available space (for /present)
 */
export function renderChart(
  data: unknown,
  chartType: string,
  options?: {
    className?: string;
    presentationMode?: boolean;
    chartSettings?: Record<string, unknown>;
    /** Donut: when provided, legend items are clickable to select active segment. */
    onActiveIndexChange?: (index: number) => void;
  },
): JSX.Element | null {
  if (!data || !chartType) return null;

  const chartClassName = options?.presentationMode
    ? "min-h-[280px] h-full w-full max-h-none"
    : options?.className;

  const chartSettings = options?.chartSettings ?? {
    withTooltip: true,
    withAnimation: true,
  };

  if (chartType.startsWith("shadcn:")) {
    const { rows, seriesColors, categoryKey } = unwrapShadcnData(
      data,
      chartType,
    );
    return getShadcnChartByName(
      rows as Parameters<typeof getShadcnChartByName>[0],
      chartType,
      {
        className: chartClassName ?? options?.className,
        seriesColors,
        categoryKey,
        chartSettings,
        onActiveIndexChange: options?.onActiveIndexChange,
      },
    );
  }

  return getChartTypeByName(
    data as Parameters<typeof getChartTypeByName>[0],
    chartType,
    {
      className: chartClassName ?? options?.className,
      chartSettings,
    },
  );
}
