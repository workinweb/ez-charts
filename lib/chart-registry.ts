/**
 * Unified chart registry: Rosencharts + Shadcn.
 * Provides hierarchical chart type selection (library → chart type).
 */

import type { LucideIcon } from "lucide-react";
import { Layers, Sparkles } from "lucide-react";
import { chartTypes } from "@/components/charts/rosencharts";
import type { ChartTypeKey } from "@/components/charts/rosencharts";
import { SHADCN_CHART_TYPES } from "@/components/charts/shadcn-charts";
import type { ShadcnChartTypeKey } from "@/components/charts/shadcn-charts";

export const CHART_LIBRARIES = [
  { id: "rosencharts", label: "Rosencharts", icon: Layers },
  { id: "shadcn", label: "Shadcn", icon: Sparkles },
] as const;

export type ChartLibraryId = (typeof CHART_LIBRARIES)[number]["id"];

export interface ChartTypeEntry {
  key: string;
  label: string;
  category: string;
  icon: LucideIcon;
  library: ChartLibraryId;
}

/** All chart types with library prefix for hierarchical selection */
export const allChartTypes: ChartTypeEntry[] = [
  ...chartTypes.map((ct) => ({
    ...ct,
    library: "rosencharts" as const,
  })),
  ...SHADCN_CHART_TYPES.map((ct) => ({
    ...ct,
    library: "shadcn" as const,
  })),
];

export type AnyChartTypeKey = ChartTypeKey | ShadcnChartTypeKey;

/** Check if chart type belongs to shadcn */
export function isShadcnChartType(key: string): key is ShadcnChartTypeKey {
  return key.startsWith("shadcn:");
}

/** Chart types grouped by library */
export function getChartTypesByLibrary(): Record<
  ChartLibraryId,
  ChartTypeEntry[]
> {
  const byLib: Record<ChartLibraryId, ChartTypeEntry[]> = {
    rosencharts: [],
    shadcn: [],
  };
  for (const ct of allChartTypes) {
    byLib[ct.library].push(ct);
  }
  return byLib;
}
