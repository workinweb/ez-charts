"use client";

import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { convexChartToUserChart } from "@/lib/chart/chart-utils";
import { fromChartKey } from "@/lib/chart/chart-keys";
import type { UserChart } from "@/lib/chart/charts-data";
import { useChartsStore } from "@/stores/charts-store";

const PAGE_SIZE = 12;

/** Paginated charts list from Convex. Per-user. */
export function useChartsPaginated() {
  const result = usePaginatedQuery(
    api.charts.charts.listPaginated,
    {},
    { initialNumItems: PAGE_SIZE },
  );
  return {
    ...result,
    charts: result.results.map(convexChartToUserChart),
  };
}

/** Single chart by ID from Convex (for persisted charts). */
export function useChartFromConvex(
  id: Id<"charts"> | string | undefined,
): UserChart | undefined {
  const chart = useQuery(
    api.charts.charts.get,
    id && typeof id === "string" && !id.startsWith("unsaved-")
      ? { id: id as Id<"charts"> }
      : "skip",
  );
  return chart ? convexChartToUserChart(chart) : undefined;
}

/** All charts (non-paginated) for components that need full list (slides, recent). */
export function useChartsList() {
  const list = useQuery(api.charts.charts.list);
  return list?.map(convexChartToUserChart) ?? [];
}

/** Chart by ID — checks unsaved first, then Convex. Use for edit/view. */
export function useChartById(id: string | undefined): UserChart | undefined {
  const unsaved = useChartsStore((s) =>
    id ? s.unsavedCharts.find((c) => c.id === id) : undefined,
  );
  const convexChart = useChartFromConvex(id);
  return unsaved ?? convexChart ?? undefined;
}

/** Chart by ID with loading status (for edit page). */
export function useChartByIdWithStatus(id: string | undefined): {
  chart: UserChart | undefined;
  isLoading: boolean;
  isNotFound: boolean;
} {
  const unsaved = useChartsStore((s) =>
    id ? s.unsavedCharts.find((c) => c.id === id) : undefined,
  );
  const convexResult = useQuery(
    api.charts.charts.get,
    id && typeof id === "string" && !id.startsWith("unsaved-")
      ? { id: id as Id<"charts"> }
      : "skip",
  );
  const isConvexId = !!id && !id.startsWith("unsaved-");
  const isLoading = isConvexId && convexResult === undefined;
  const isNotFound = isConvexId && convexResult === null;
  const chart =
    unsaved ??
    (convexResult ? convexChartToUserChart(convexResult) : undefined);
  return { chart, isLoading, isNotFound };
}

/** Favorited charts list from Convex. */
export function useChartsFavorites(): {
  items: ReturnType<typeof convexChartToUserChart>[];
  isLoading: boolean;
} {
  const list = useQuery(api.charts.charts.listFavorites);
  const items = list?.map(convexChartToUserChart) ?? [];
  const isLoading = list === undefined;
  return { items, isLoading };
}

/** Chart mutations: create, update, remove, toggleFavorite, duplicate. */
export function useChartsMutations() {
  const createMutation = useMutation(api.charts.charts.create);
  const updateMutation = useMutation(api.charts.charts.update);
  const removeMutation = useMutation(api.charts.charts.remove);
  const toggleFavoriteMutation = useMutation(api.charts.charts.toggleFavorite);
  const duplicateMutation = useMutation(api.charts.charts.duplicate);

  return {
    create: async (input: {
      title: string;
      chartType: string;
      chartLibrary?: "shadcn" | "rosencharts";
      data: unknown;
      source?: string;
      favorited?: boolean;
      withTooltip?: boolean;
      withAnimation?: boolean;
      chartSettings?: Record<string, unknown>;
    }) => {
      const { chartLibrary, chartType } =
        input.chartLibrary !== undefined
          ? { chartLibrary: input.chartLibrary, chartType: input.chartType }
          : fromChartKey(input.chartType);
      return createMutation({
        title: input.title,
        chartLibrary,
        chartType,
        data: input.data,
        source: input.source ?? "Manual",
        favorited: input.favorited,
        withTooltip: input.withTooltip,
        withAnimation: input.withAnimation,
        chartSettings: input.chartSettings,
      });
    },
    update: async (
      id: Id<"charts">,
      patch: {
        title?: string;
        chartType?: string;
        chartLibrary?: "shadcn" | "rosencharts";
        data?: unknown;
        withTooltip?: boolean;
        withAnimation?: boolean;
        chartSettings?: Record<string, unknown>;
      },
    ) => {
      const { chartType: patchType, ...rest } = patch;
      const updates: Record<string, unknown> = { id, ...rest };
      if (patchType !== undefined) {
        const parsed = fromChartKey(patchType);
        updates.chartLibrary = parsed.chartLibrary;
        updates.chartType = parsed.chartType;
      }
      await updateMutation(updates as Parameters<typeof updateMutation>[0]);
    },
    remove: async (id: Id<"charts">) => {
      await removeMutation({ id });
    },
    toggleFavorite: async (id: Id<"charts">) => {
      await toggleFavoriteMutation({ id });
    },
    duplicate: async (id: Id<"charts">) => {
      return duplicateMutation({ id });
    },
  };
}
