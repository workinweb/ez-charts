"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { toChartColorVar } from "@/lib/utils";

export type ShadcnBarVariant = "default" | "stacked";

/** Data: [{ month, desktop, mobile }] or any category + series keys. Vertical bars only. */
export interface ShadcnBarChartProps {
  data: Record<string, string | number>[];
  config: ChartConfig;
  variant?: ShadcnBarVariant;
  className?: string;
  categoryKey?: string;
  seriesKeys?: string[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  withLabels?: boolean;
  withLegend?: boolean;
}

function getSeriesKeys(
  data: Record<string, string | number>[],
  categoryKey: string,
): string[] {
  if (!data[0]) return [];
  return Object.keys(data[0]).filter(
    (k) => k !== categoryKey && typeof data[0]![k] === "number",
  );
}

export function ShadcnBarChart({
  data,
  config,
  variant = "default",
  className,
  categoryKey = "month",
  seriesKeys,
  withTooltip = true,
  withAnimation = true,
  withLabels = true,
  withLegend = true,
}: ShadcnBarChartProps) {
  const keys = seriesKeys ?? getSeriesKeys(data, categoryKey);
  const isStacked = variant === "stacked";

  return (
    <ChartContainer config={config} className={className}>
      <RechartsBarChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: withLabels ? 20 : 12,
          bottom: 12,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={categoryKey}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => String(value).slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
        />
        {withTooltip && (
          <ChartTooltip cursor content={<ChartTooltipContent hideLabel />} />
        )}
        {isStacked && withLegend && (
          <ChartLegend content={<ChartLegendContent />} />
        )}
        {keys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            stackId={isStacked ? "a" : undefined}
            fill={`var(--color-${toChartColorVar(key)})`}
            radius={
              isStacked ? (i === 0 ? [0, 0, 4, 4] : [4, 4, 0, 0]) : [4, 4, 0, 0]
            }
            isAnimationActive={withAnimation}
          >
            {withLabels && (
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            )}
          </Bar>
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}
