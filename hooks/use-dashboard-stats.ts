"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface DashboardStats {
  totalCharts: number;
  chartsThisMonth: number;
  chartsThisWeek: number;
  favoritesCount: number;
  monthlyData: { month: string; charts: number }[];
  chartTypes: { name: string; value: number }[];
  dataSources: { name: string; count: number }[];
}

export function useDashboardStats(): {
  stats: DashboardStats;
  isLoading: boolean;
} {
  const result = useQuery(api.charts.charts.dashboardStats);
  const isLoading = result === undefined;
  const stats: DashboardStats = result ?? {
    totalCharts: 0,
    chartsThisMonth: 0,
    chartsThisWeek: 0,
    favoritesCount: 0,
    monthlyData: [],
    chartTypes: [],
    dataSources: [],
  };
  return { stats, isLoading };
}
