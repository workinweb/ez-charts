import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Grid3X3,
  ScatterChart as ScatterIcon,
  type LucideIcon,
} from "lucide-react";
import { barVertical, dataHorizontal } from "@/components/rosencharts/fixture/BarCharts";
import { breakdownChartData } from "@/components/rosencharts/fixture/BreakdownCharts";
import {
  lineChartData,
  lineChartMultipleData,
} from "@/components/rosencharts/fixture/LineChart";
import { donutChartData, pieChartData } from "@/components/rosencharts/fixture/PieChart";
import { scatterChartData } from "@/components/rosencharts/fixture/ScatterChart";
import { treeMapChartData } from "@/components/rosencharts/fixture/TreemapCharts";
import type { ChartTypeKey } from "@/components/rosencharts";

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

/** Mock user charts - in production this would load from an API */
export const userCharts: UserChart[] = [
  {
    id: "1",
    title: "Sales by Region Q4",
    chartType: "horizontal-bar",
    data: dataHorizontal,
    source: "sales_data.csv",
    date: "Today",
    favorited: true,
    withTooltip: true,
    withAnimation: true,
    ...chartTypeToIcon("horizontal-bar"),
  },
  {
    id: "2",
    title: "Revenue Forecast",
    chartType: "line",
    data: lineChartData,
    source: "From prompt",
    date: "Yesterday",
    favorited: false,
    withTooltip: true,
    withAnimation: true,
    ...chartTypeToIcon("line"),
  },
  {
    id: "3",
    title: "Category Breakdown",
    chartType: "pie",
    data: pieChartData,
    source: "expenses.xlsx",
    date: "Jan 11",
    favorited: true,
    withTooltip: true,
    withAnimation: true,
    ...chartTypeToIcon("pie"),
  },
  {
    id: "4",
    title: "Monthly Trends",
    chartType: "line-multi",
    data: lineChartMultipleData,
    source: "From prompt",
    date: "Jan 09",
    favorited: false,
    withTooltip: true,
    withAnimation: true,
    ...chartTypeToIcon("line-multi"),
  },
  {
    id: "5",
    title: "Donut Portfolio",
    chartType: "donut",
    data: donutChartData,
    source: "portfolio.json",
    date: "Jan 08",
    favorited: true,
    withTooltip: true,
    withAnimation: true,
    ...chartTypeToIcon("donut"),
  },
  {
    id: "6",
    title: "Sector Allocation",
    chartType: "breakdown",
    data: breakdownChartData,
    source: "market_data.xlsx",
    date: "Jan 07",
    favorited: false,
    withTooltip: true,
    withAnimation: true,
    ...chartTypeToIcon("breakdown"),
  },
  {
    id: "7",
    title: "Hierarchy View",
    chartType: "treemap",
    data: treeMapChartData,
    source: "From prompt",
    date: "Jan 06",
    favorited: false,
    withTooltip: true,
    withAnimation: true,
    ...chartTypeToIcon("treemap"),
  },
  {
    id: "8",
    title: "Company Comparison",
    chartType: "scatter",
    data: scatterChartData,
    source: "analytics.csv",
    date: "Jan 05",
    favorited: true,
    withTooltip: true,
    withAnimation: true,
    ...chartTypeToIcon("scatter"),
  },
  {
    id: "9",
    title: "Vertical Bar Overview",
    chartType: "vertical-bar",
    data: barVertical,
    source: "From prompt",
    date: "Jan 04",
    favorited: false,
    withTooltip: true,
    withAnimation: true,
    ...chartTypeToIcon("vertical-bar"),
  },
];

export function getChartById(
  id: string,
  dynamicCharts?: UserChart[],
): UserChart | undefined {
  const fromDynamic = dynamicCharts?.find((c) => c.id === id);
  if (fromDynamic) return fromDynamic;
  return userCharts.find((c) => c.id === id);
}
