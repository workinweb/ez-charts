"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
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

/** Data: [{ month, desktop, mobile }] or any category + series keys */
export interface ShadcnBarChartProps {
  data: Record<string, string | number>[];
  config: ChartConfig;
  className?: string;
  categoryKey?: string;
  /** Keys for numeric series, e.g. ["desktop", "mobile"] */
  seriesKeys?: string[];
}

function getSeriesKeys(data: Record<string, string | number>[], categoryKey: string): string[] {
  if (!data[0]) return [];
  return Object.keys(data[0]).filter((k) => k !== categoryKey && typeof data[0]![k] === "number");
}

export function ShadcnBarChart({
  data,
  config,
  className,
  categoryKey = "month",
  seriesKeys,
}: ShadcnBarChartProps) {
  const keys = seriesKeys ?? getSeriesKeys(data, categoryKey);
  return (
    <ChartContainer config={config} className={className}>
      <RechartsBarChart data={data} margin={{ left: 12, right: 12 }}>
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
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={[4, 4, 0, 0]} />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}
