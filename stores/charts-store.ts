"use client";

import { create } from "zustand";
import type { ChartTypeKey } from "@/components/rosencharts";
import type { UserChart } from "@/lib/charts-data";
import {
  chartTypeToIcon,
  getChartById,
  userCharts,
} from "@/lib/charts-data";

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

interface ChartsState {
  /** Dynamic charts created via chat createChart tool */
  dynamicCharts: UserChart[];
  /** Chart IDs the user has favorited */
  favoritedIds: Set<string>;
  addChartFromTool: (tool: ChartFromTool) => string;
  toggleFavorite: (id: string) => void;
  /** Update a dynamic chart's title (e.g. after Save Chart) */
  updateChartTitle: (id: string, title: string) => void;
}

let nextId = 1;

const initialFavoritedIds = new Set(
  userCharts.filter((c) => c.favorited).map((c) => c.id),
);

export const useChartsStore = create<ChartsState>((set) => ({
  dynamicCharts: [],
  favoritedIds: initialFavoritedIds,

  addChartFromTool: (tool) => {
    const id = `chat-${Date.now()}-${nextId++}`;
    const chart = chartFromToolToUserChart(tool, id);
    set((s) => ({
      dynamicCharts: [...s.dynamicCharts, chart],
    }));
    return id;
  },

  toggleFavorite: (id) =>
    set((s) => {
      const next = new Set(s.favoritedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { favoritedIds: next };
    }),

  updateChartTitle: (id, title) =>
    set((s) => ({
      dynamicCharts: s.dynamicCharts.map((c) =>
        c.id === id ? { ...c, title } : c,
      ),
    })),
}));

/** Merged list: static userCharts + dynamic charts from chat, with favorite state */
export function useAllCharts(): UserChart[] {
  const dynamicCharts = useChartsStore((s) => s.dynamicCharts);
  const favoritedIds = useChartsStore((s) => s.favoritedIds);
  const all = [...userCharts, ...dynamicCharts];
  return all.map((c) => ({
    ...c,
    favorited: favoritedIds.has(c.id),
  }));
}

/** Get a chart by ID (static or dynamic) */
export function useChartById(id: string | undefined): UserChart | undefined {
  const dynamicCharts = useChartsStore((s) => s.dynamicCharts);
  return getChartById(id ?? "", dynamicCharts);
}
