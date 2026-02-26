import type { Id } from "@/convex/_generated/dataModel";
import type { Doc } from "@/convex/_generated/dataModel";
import type { UserChart } from "@/lib/chart/charts-data";
import { chartTypeToIcon } from "@/lib/chart/charts-data";
import { normalizeChartForRender } from "@/lib/chart/chart-keys";

export function formatChartDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24 && d.getDate() === new Date().getDate()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffHours < 48) {
    return `Yesterday ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function convexChartToUserChart(chart: Doc<"charts">): UserChart {
  const chartTypeKey = normalizeChartForRender(chart);
  return {
    id: chart._id as string,
    title: chart.title,
    chartType: chartTypeKey,
    data: chart.data,
    source: chart.source,
    date: formatChartDate(chart.updatedAt),
    favorited: chart.favorited,
    withTooltip: chart.withTooltip,
    withAnimation: chart.withAnimation,
    ...chartTypeToIcon(chartTypeKey),
  };
}

export function isValidChartId(id: string): id is Id<"charts"> {
  return typeof id === "string" && id.length > 0;
}
