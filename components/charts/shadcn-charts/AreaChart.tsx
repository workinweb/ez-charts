"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ShadcnAreaChartProps {
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

export function ShadcnAreaChart({
  data,
  config,
  className,
  categoryKey = "month",
  seriesKeys,
}: ShadcnAreaChartProps) {
  const keys = seriesKeys ?? getSeriesKeys(data, categoryKey);
  return (
    <ChartContainer config={config} className={className}>
      <RechartsAreaChart data={data} margin={{ left: 12, right: 12 }}>
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
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`var(--color-${key})`}
            fill={`var(--color-${key})`}
            fillOpacity={0.4}
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  );
}
