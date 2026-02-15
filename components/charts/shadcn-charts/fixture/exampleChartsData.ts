import { barChartData } from "./bar";
import { areaChartData } from "./area";
import { lineChartData } from "./line";
import { pieChartData } from "./pie";
import { radarChartData } from "./radar";
import { radialChartData } from "./radial";

export const shadcnExampleData = [
  { id: "sc-1", name: "Bar Chart", chartType: "shadcn:bar", data: barChartData },
  { id: "sc-2", name: "Area Chart", chartType: "shadcn:area", data: areaChartData },
  { id: "sc-3", name: "Line Chart", chartType: "shadcn:line", data: lineChartData },
  { id: "sc-4", name: "Pie Chart", chartType: "shadcn:pie", data: pieChartData },
  { id: "sc-5", name: "Radar Chart", chartType: "shadcn:radar", data: radarChartData },
  { id: "sc-6", name: "Radial Chart", chartType: "shadcn:radial", data: radialChartData },
];
