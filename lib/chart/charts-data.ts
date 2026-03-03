import {
  BarChart3,
  Circle,
  Filter,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Grid3X3,
  ScatterChart as ScatterIcon,
  type LucideIcon,
} from "lucide-react";
export interface UserChart {
  id: string;
  title: string;
  chartType: string;
  data: unknown;
  source: string;
  date: string;
  favorited: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  withTooltip?: boolean;
  withAnimation?: boolean;
  chartSettings?: Record<string, unknown>;
}

export function chartTypeToIcon(chartType: string): {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
} {
  const style = "text-[#3D4035]";
  if (
    chartType.includes("bar") ||
    chartType.includes("breakdown") ||
    chartType.includes("benchmark")
  ) {
    return { icon: BarChart3, iconColor: style, iconBg: "bg-[#94B49F]/30" };
  }
  if (chartType.includes("line") || chartType.includes("area")) {
    return { icon: LineChartIcon, iconColor: style, iconBg: "bg-[#B5B2F2]/30" };
  }
  if (
    chartType.includes("pie") ||
    chartType.includes("donut") ||
    chartType.includes("fillable") ||
    chartType.includes("half")
  ) {
    return { icon: PieChartIcon, iconColor: style, iconBg: "bg-[#6CB4EE]/30" };
  }
  if (chartType.includes("treemap")) {
    return { icon: Grid3X3, iconColor: style, iconBg: "bg-[#6C5DD3]/20" };
  }
  if (chartType.includes("scatter")) {
    return { icon: ScatterIcon, iconColor: style, iconBg: "bg-[#e87c5c]/20" };
  }
  if (chartType.includes("bubble")) {
    return { icon: Circle, iconColor: style, iconBg: "bg-[#ec4899]/20" };
  }
  if (chartType.includes("funnel")) {
    return { icon: Filter, iconColor: style, iconBg: "bg-[#8b5cf6]/20" };
  }
  if (chartType.includes("shadcn:area")) {
    return { icon: TrendingUp, iconColor: style, iconBg: "bg-[#94B49F]/30" };
  }
  if (chartType.includes("shadcn:radar")) {
    return { icon: Grid3X3, iconColor: style, iconBg: "bg-[#6C5DD3]/20" };
  }
  if (chartType.includes("shadcn:radial") || chartType.includes("shadcn:donut")) {
    return { icon: PieChartIcon, iconColor: style, iconBg: "bg-[#6CB4EE]/30" };
  }
  return { icon: TrendingUp, iconColor: style, iconBg: "bg-[#6C5DD3]/30" };
}

/** Look up a chart by ID from a list (e.g. from useChartsList). */
export function getChartById(
  id: string,
  charts: UserChart[],
): UserChart | undefined {
  return charts.find((c) => c.id === id);
}
