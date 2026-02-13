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
  /** Static chart IDs the user has deleted (soft delete) */
  removedChartIds: Set<string>;
  addChartFromTool: (tool: ChartFromTool) => string;
  toggleFavorite: (id: string) => void;
  /** Update a dynamic chart's title (e.g. after Save Chart) */
  updateChartTitle: (id: string, title: string) => void;
  /** Remove a chart (dynamic: hard delete; static: soft delete) */
  removeChart: (id: string) => void;
  /** Duplicate a chart (creates a new dynamic chart) */
  duplicateChart: (id: string) => string | null;
  /** Update a chart's editable properties (creates a dynamic copy for static charts) */
  updateChart: (
    id: string,
    patch: Partial<Pick<UserChart, "title" | "data" | "chartType" | "withTooltip" | "withAnimation">>,
  ) => string;
  /** Create a new chart from scratch (no AI) */
  addChart: (input: {
    title: string;
    chartType: ChartTypeKey;
    data: unknown;
    withTooltip?: boolean;
    withAnimation?: boolean;
  }) => string;
}

let nextId = 1;

const initialFavoritedIds = new Set(
  userCharts.filter((c) => c.favorited).map((c) => c.id),
);

export const useChartsStore = create<ChartsState>((set, get) => ({
  dynamicCharts: [],
  favoritedIds: initialFavoritedIds,
  removedChartIds: new Set<string>(),

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

  removeChart: (id) =>
    set((s) => {
      const isDynamic = s.dynamicCharts.some((c) => c.id === id);
      if (isDynamic) {
        return {
          dynamicCharts: s.dynamicCharts.filter((c) => c.id !== id),
          favoritedIds: (() => {
            const next = new Set(s.favoritedIds);
            next.delete(id);
            return next;
          })(),
        };
      }
      const next = new Set(s.removedChartIds);
      next.add(id);
      const nextFav = new Set(s.favoritedIds);
      nextFav.delete(id);
      return { removedChartIds: next, favoritedIds: nextFav };
    }),

  duplicateChart: (id) => {
    const s = get();
    if (s.removedChartIds.has(id)) return null;
    const chart = getChartById(id, s.dynamicCharts);
    if (!chart) return null;
    const newId = `chat-${Date.now()}-${nextId++}`;
    const duplicate: UserChart = {
      ...chart,
      id: newId,
      title: `${chart.title} (copy)`,
      date: "Just now",
    };
    set((state) => ({
      dynamicCharts: [...state.dynamicCharts, duplicate],
    }));
    return newId;
  },

  updateChart: (id, patch) => {
    const s = get();
    const isDynamic = s.dynamicCharts.some((c) => c.id === id);
    if (isDynamic) {
      // Update the dynamic chart in-place
      set((state) => ({
        dynamicCharts: state.dynamicCharts.map((c) => {
          if (c.id !== id) return c;
          const updated = { ...c, ...patch, date: "Just now" };
          // Re-compute icon if chart type changed
          if (patch.chartType && patch.chartType !== c.chartType) {
            Object.assign(updated, chartTypeToIcon(patch.chartType));
          }
          return updated;
        }),
      }));
      return id;
    }
    // Static chart: create a dynamic copy with the edits applied
    const chart = getChartById(id, s.dynamicCharts);
    if (!chart) return id;
    const newId = `edit-${Date.now()}-${nextId++}`;
    const edited: UserChart = {
      ...chart,
      ...patch,
      id: newId,
      date: "Just now",
      ...(patch.chartType && patch.chartType !== chart.chartType
        ? chartTypeToIcon(patch.chartType)
        : {}),
    };
    // Soft-delete the static original and add the new dynamic copy
    set((state) => {
      const nextRemoved = new Set(state.removedChartIds);
      nextRemoved.add(id);
      return {
        dynamicCharts: [...state.dynamicCharts, edited],
        removedChartIds: nextRemoved,
      };
    });
    return newId;
  },

  addChart: ({ title, chartType, data, withTooltip = true, withAnimation = true }) => {
    const id = `edit-${Date.now()}-${nextId++}`;
    const chart: UserChart = {
      id,
      title,
      chartType,
      data,
      source: "Manual",
      date: "Just now",
      favorited: false,
      withTooltip,
      withAnimation,
      ...chartTypeToIcon(chartType),
    };
    set((s) => ({
      dynamicCharts: [...s.dynamicCharts, chart],
    }));
    return id;
  },
}));

/** Merged list: static userCharts + dynamic charts from chat, with favorite state */
export function useAllCharts(): UserChart[] {
  const dynamicCharts = useChartsStore((s) => s.dynamicCharts);
  const favoritedIds = useChartsStore((s) => s.favoritedIds);
  const removedChartIds = useChartsStore((s) => s.removedChartIds);
  const all = [...userCharts, ...dynamicCharts].filter(
    (c) => !removedChartIds.has(c.id),
  );
  return all.map((c) => ({
    ...c,
    favorited: favoritedIds.has(c.id),
  }));
}

/** Get a chart by ID (static or dynamic) */
export function useChartById(id: string | undefined): UserChart | undefined {
  const dynamicCharts = useChartsStore((s) => s.dynamicCharts);
  const removedChartIds = useChartsStore((s) => s.removedChartIds);
  const chart = getChartById(id ?? "", dynamicCharts);
  if (!chart || removedChartIds.has(chart.id)) return undefined;
  return chart;
}
