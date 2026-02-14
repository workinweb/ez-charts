import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Grid3X3,
  ScatterChart as ScatterIcon,
  type LucideIcon,
} from "lucide-react";
import type { ChartTypeKey } from "@/components/rosencharts";
import { userChartsFixture } from "@/fixtures/user-charts";

export interface UserChart {
  id: string;
  title: string;
  chartType: ChartTypeKey;
  data: unknown;
  source: string;
  date: string;
  favorited: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  withTooltip?: boolean;
  withAnimation?: boolean;
}

export function chartTypeToIcon(chartType: ChartTypeKey): {
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
  if (chartType.includes("line")) {
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
  return { icon: TrendingUp, iconColor: style, iconBg: "bg-[#6C5DD3]/30" };
}

export const userCharts: UserChart[] = userChartsFixture.map((c) => ({
  ...c,
  ...chartTypeToIcon(c.chartType),
}));

export function getChartById(
  id: string,
  dynamicCharts?: UserChart[],
): UserChart | undefined {
  const fromDynamic = dynamicCharts?.find((c) => c.id === id);
  if (fromDynamic) return fromDynamic;
  return userCharts.find((c) => c.id === id);
}
