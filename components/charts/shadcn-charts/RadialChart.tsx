"use client";

import { RadialBar, RadialBarChart as RechartsRadialBarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ShadcnRadialChartProps {
  data: { name: string; value: number }[];
  config: ChartConfig;
  className?: string;
}

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ShadcnRadialChart({ data, config, className }: ShadcnRadialChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const dataWithFill = data.map((item, i) => ({
    ...item,
    fill: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    full: max,
  }));
  return (
    <ChartContainer config={config} className={className}>
      <RechartsRadialBarChart
        data={dataWithFill}
        cx="50%"
        cy="50%"
        innerRadius="60%"
        outerRadius="90%"
        barCategoryGap="10%"
      >
        <ChartTooltip content={<ChartTooltipContent />} />
        <RadialBar dataKey="value" cornerRadius={4} />
      </RechartsRadialBarChart>
    </ChartContainer>
  );
}
