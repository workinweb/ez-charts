"use client";

import { create } from "zustand";
import type { ChartTypeKey } from "@/components/rosencharts";
import type { UserChart } from "@/lib/charts-data";
import { chartTypeToIcon } from "@/lib/charts-data";

export interface ChartFromTool {
  chartType: ChartTypeKey;
  title: string;
  data: unknown;
}

function chartFromToolToUserChart(tool: ChartFromTool, id: string): UserChart {
  return {
    id,
    title: tool.title,
    chartType: tool.chartType,
    data: tool.data,
    source: "From chat",
    date: "Just now",
    favorited: false,
    withTooltip: true,
    withAnimation: true,
    ...chartTypeToIcon(tool.chartType),
  };
}

let nextUnsavedId = 1;

interface ChartsState {
  /** Unsaved charts from AI (not yet persisted to Convex) */
  unsavedCharts: UserChart[];
  lastEditedChartId: string | null;
  previewChartId: string | null;
  chartsSearch: string;
  favoritesSearch: string;
  addChartFromTool: (tool: ChartFromTool) => string;
  removeUnsavedChart: (id: string) => void;
  setLastEditedChartId: (id: string | null) => void;
  setPreviewChartId: (id: string | null) => void;
  setChartsSearch: (value: string) => void;
  setFavoritesSearch: (value: string) => void;
}

export const useChartsStore = create<ChartsState>((set) => ({
  unsavedCharts: [],
  lastEditedChartId: null,
  previewChartId: null,
  chartsSearch: "",
  favoritesSearch: "",

  addChartFromTool: (tool) => {
    const id = `unsaved-${Date.now()}-${nextUnsavedId++}`;
    const chart = chartFromToolToUserChart(tool, id);
    set((s) => ({ unsavedCharts: [...s.unsavedCharts, chart] }));
    return id;
  },

  removeUnsavedChart: (id) =>
    set((s) => ({
      unsavedCharts: s.unsavedCharts.filter((c) => c.id !== id),
    })),

  setLastEditedChartId: (id) => set({ lastEditedChartId: id }),
  setPreviewChartId: (id) => set({ previewChartId: id }),
  setChartsSearch: (value) => set({ chartsSearch: value }),
  setFavoritesSearch: (value) => set({ favoritesSearch: value }),
}));

/** Get an unsaved chart by ID (for new section, edit before save) */
export function useUnsavedChartById(id: string | undefined): UserChart | undefined {
  const unsavedCharts = useChartsStore((s) => s.unsavedCharts);
  if (!id) return undefined;
  return unsavedCharts.find((c) => c.id === id);
}
