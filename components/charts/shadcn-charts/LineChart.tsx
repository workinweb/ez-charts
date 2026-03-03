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
import { toChartColorVar } from "@/lib/utils";

export type ShadcnLineType = "curved" | "linear" | "step";

const RECHARTS_LINE_TYPES: Record<ShadcnLineType, "monotone" | "linear" | "step"> = {
  curved: "monotone",
  linear: "linear",
  step: "step",
};

export interface ShadcnLineChartProps {
  data: Record<string, string | number>[];
  config: ChartConfig;
  className?: string;
  categoryKey?: string;
  seriesKeys?: string[];
  lineType?: ShadcnLineType;
  withTooltip?: boolean;
  withAnimation?: boolean;
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
  lineType = "curved",
  withTooltip = true,
  withAnimation = true,
}: ShadcnLineChartProps) {
  const keys = seriesKeys ?? getSeriesKeys(data, categoryKey);
  const rechartsType = RECHARTS_LINE_TYPES[lineType];
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
        {withTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        {keys.map((key) => (
          <Line
            key={key}
            type={rechartsType}
            dataKey={key}
            stroke={`var(--color-${toChartColorVar(key)})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={withAnimation}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}
