"use client";

import type { JSX } from "react";
import { getChartTypeByName } from "@/components/charts/rosencharts";
import { getShadcnChartByName } from "@/components/charts/shadcn-charts";

/**
 * Unified chart renderer: routes to Rosencharts or Shadcn based on chartType.
 * - Rosencharts: horizontal-bar, pie, line, etc.
 * - Shadcn: shadcn:bar, shadcn:area, shadcn:line, shadcn:pie, shadcn:radar, shadcn:radial
 */
export function renderChart(
  data: unknown,
  chartType: string,
  options?: {
    withTooltip?: boolean;
    withAnimation?: boolean;
    className?: string;
  },
): JSX.Element | null {
  if (!data || !chartType) return null;

  if (chartType.startsWith("shadcn:")) {
    const arr = Array.isArray(data) ? data : [];
    return getShadcnChartByName(
      arr as Parameters<typeof getShadcnChartByName>[0],
      chartType,
      {
        className: options?.className,
      },
    );
  }

  return getChartTypeByName(
    data as Parameters<typeof getChartTypeByName>[0],
    chartType,
    {
      withTooltip: options?.withTooltip,
      withAnimation: options?.withAnimation,
      className: options?.className,
    },
  );
}
