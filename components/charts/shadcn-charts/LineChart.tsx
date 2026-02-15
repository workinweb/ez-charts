"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ShadcnLineChartProps {
  data: Record<string, string | number>[];
  config: ChartConfig;
  className?: string;
  categoryKey?: string;
  seriesKeys?: string[];
}

function getSeriesKeys(data: Record<string, string | number>[], categoryKey: string): string[] {
  if (!data[0]) return [];
  return Object.keys(data[0]).filter((k) => k !== categoryKey && typeof data[0]![k] === "number");
}

export function ShadcnLineChart({
  data,
  config,
  className,
  categoryKey = "month",
  seriesKeys,
}: ShadcnLineChartProps) {
  const keys = seriesKeys ?? getSeriesKeys(data, categoryKey);
  return (
    <ChartContainer config={config} className={className}>
      <RechartsLineChart data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={categoryKey}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => String(value).slice(0, 3)}
        />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {keys.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={{ fill: `var(--color-${key})` }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}
