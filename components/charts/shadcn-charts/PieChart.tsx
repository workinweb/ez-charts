"use client";

import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ShadcnPieChartProps {
  data: { name: string; value: number; fill?: string }[];
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

export function ShadcnPieChart({ data, config, className }: ShadcnPieChartProps) {
  const dataWithFill = data.map((item, i) => ({
    ...item,
    fill: item.fill ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));
  return (
    <ChartContainer config={config} className={className}>
      <RechartsPieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie
          data={dataWithFill}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius="80%"
          paddingAngle={2}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {dataWithFill.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
}
