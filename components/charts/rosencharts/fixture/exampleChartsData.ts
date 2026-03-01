import {
  barVertical,
  barVerticalMulti,
  dataGradient,
  dataHorizontal,
  dataImage,
  dataMulti,
  dataSVG,
  dataThin,
} from "./BarCharts";
import { breakdownChartData } from "./BreakdownCharts";
import {
  lineChartCurvedData,
  lineChartData,
  lineChartMultipleData,
} from "./LineChart";
import {
  donutChartData,
  filledDonutChartData,
  halfDonutChartData,
  pieChartData,
  pieChartImageData,
} from "./PieChart";
import { scatterChartData } from "./ScatterChart";
import { bubbleChartData } from "./BubbleChart";
import { funnelChartData } from "./FunnelChart";
import { treeMapChartData } from "./TreemapCharts";

export const data = [
  {
    id: "1",
    name: "Bar Chart",
    chartType: "horizontal-bar",
    data: dataHorizontal,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "2",
    name: "Bar Chart Horizontal Gradient",
    chartType: "horizontal-bar-gradient",
    data: dataGradient,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "3",
    name: "Bar Chart Horizontal Multi",
    chartType: "horizontal-bar-multi",
    data: dataMulti,
    withTooltip: true,
    withAnimation: true,
  },
  {
    id: "4",
    name: "Bar Chart Horizontal Image (SVG)",
    chartType: "horizontal-bar-image",
    data: dataSVG,
    withTooltip: true,
    withAnimation: true,
  },
  {
    id: "4.5",
    name: "Bar Chart Horizontal Image (IMG)",
    chartType: "horizontal-bar-image",
    data: dataImage,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "5",
    name: "Bar Chart Horizontal Thin",
    chartType: "horizontal-bar-thin",
    data: dataThin,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "6",
    name: "Bar Chart Vertical",
    chartType: "vertical-bar",
    data: barVertical,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "7",
    name: "Bar Chart Vertical Multi",
    chartType: "vertical-bar-multi",
    data: barVerticalMulti,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "8",
    name: "Breakdown",
    chartType: "breakdown",
    data: breakdownChartData,
    withTooltip: true,
    withAnimation: true,
  },
  {
    id: "9",
    name: "Breakdown Thin",
    chartType: "breakdown-thin",
    data: breakdownChartData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "10",
    name: "Lines Chart",
    chartType: "line",
    data: lineChartData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "12",
    name: "Lines Chart Curved",
    chartType: "line-curved",
    data: lineChartCurvedData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "11",
    name: "Lines Chart Multiple",
    chartType: "line-multi",
    data: lineChartMultipleData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "13",
    name: "Pie Chart",
    chartType: "pie",
    data: pieChartData,
    withTooltip: true,
    withAnimation: true,
  },
  {
    id: "15",
    name: "Pie Chart Image",
    chartType: "pie-image",
    data: pieChartImageData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "14",
    name: "Donut Chart",
    chartType: "donut",
    data: donutChartData,
    withTooltip: true,
    withAnimation: true,
  },
  {
    id: "17",
    name: "Filled Donut Chart ",
    chartType: "fillable-donut",
    data: filledDonutChartData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "18",
    name: "Half Donut Chart ",
    chartType: "half-donut",
    data: halfDonutChartData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "16",
    name: "Fillable Chart ",
    chartType: "fillable",
    data: filledDonutChartData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "19",
    name: "Benchmark Chart",
    chartType: "benchmark",
    data: breakdownChartData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "20",
    name: "TreeMap Chart",
    chartType: "treemap",
    data: treeMapChartData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "21",
    name: "Scatter Chart",
    chartType: "scatter",
    data: scatterChartData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "22",
    name: "Bubble Chart",
    chartType: "bubble",
    data: bubbleChartData,
    withTooltip: true,
    withAnimation: true,
  },

  {
    id: "23",
    name: "Funnel Chart",
    chartType: "funnel",
    data: funnelChartData,
    withTooltip: true,
    withAnimation: true,
  },
];
