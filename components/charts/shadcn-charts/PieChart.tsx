"use client";

import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ShadcnPieChartProps {
  data: { name: string; value: number; fill?: string }[];
  config: ChartConfig;
  className?: string;
  withTooltip?: boolean;
  withAnimation?: boolean;
  withLegend?: boolean;
}

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ShadcnPieChart({
  data,
  config,
  className,
  withTooltip = true,
  withAnimation = true,
  withLegend = true,
}: ShadcnPieChartProps) {
  const dataWithFill = data.map((item, i) => ({
    ...item,
    fill: item.fill ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));
  return (
    <ChartContainer config={config} className={className}>
      <RechartsPieChart>
        {withTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        <Pie
          data={dataWithFill}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius="70%"
          paddingAngle={2}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          isAnimationActive={withAnimation}
        >
          {dataWithFill.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        {withLegend && (
          <ChartLegend
            content={<ChartLegendContent nameKey="name" />}
            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
          />
        )}
      </RechartsPieChart>
    </ChartContainer>
  );
}
