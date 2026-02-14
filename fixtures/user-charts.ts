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

export interface UserChartFixture {
  id: string;
  title: string;
  chartType: ChartTypeKey;
  data: unknown;
  source: string;
  date: string;
  favorited: boolean;
  withTooltip?: boolean;
  withAnimation?: boolean;
}

/** Mock user charts — in production this would load from an API */
export const userChartsFixture: UserChartFixture[] = [
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
  },
];
