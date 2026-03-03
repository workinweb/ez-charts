"use client";

import type { JSX } from "react";
import { getChartTypeByName } from "@/components/charts/rosencharts";
import { getShadcnChartByName } from "@/components/charts/shadcn-charts";
import { unwrapShadcnData } from "@/lib/chart/shadcn-chart-data";

/**
 * Unified chart renderer: routes to Rosencharts or Shadcn based on chartType.
 * - Rosencharts: horizontal-bar, pie, line, etc.
 * - Shadcn: shadcn:bar, shadcn:area, shadcn:line, shadcn:pie, shadcn:radar, shadcn:radial
 * @param options.presentationMode - When true, charts fill available space (for /present)
 */
export function renderChart(
  data: unknown,
  chartType: string,
  options?: {
    withTooltip?: boolean;
    withAnimation?: boolean;
    className?: string;
    presentationMode?: boolean;
    chartSettings?: Record<string, unknown>;
  },
): JSX.Element | null {
  if (!data || !chartType) return null;

  const chartClassName = options?.presentationMode
    ? "min-h-[280px] h-full w-full max-h-none"
    : options?.className;

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
        withTooltip: options?.withTooltip,
        withAnimation: options?.withAnimation,
        chartSettings: options?.chartSettings,
      },
    );
  }

  return getChartTypeByName(
    data as Parameters<typeof getChartTypeByName>[0],
    chartType,
    {
      withTooltip: options?.withTooltip,
      withAnimation: options?.withAnimation,
      className: chartClassName ?? options?.className,
      chartSettings: options?.chartSettings,
    },
  );
}
