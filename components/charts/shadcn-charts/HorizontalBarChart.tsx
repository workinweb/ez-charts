"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  LabelList,
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

/** "inside" = category label on bar (insideLeft), "outside" = category on YAxis */
export type CategoryLabelPosition = "inside" | "outside";

/** Data: [{ month, desktop }] — single series, horizontal bars. Uses first series only. */
export interface ShadcnHorizontalBarChartProps {
  data: Record<string, string | number>[];
  config: ChartConfig;
  className?: string;
  categoryKey?: string;
  seriesKeys?: string[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  withLabels?: boolean;
  /** Where to show category label: on bar (insideLeft) or outside (YAxis). Default "inside". */
  categoryLabelPosition?: CategoryLabelPosition;
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

export function ShadcnHorizontalBarChart({
  data,
  config,
  className,
  categoryKey = "month",
  seriesKeys,
  withTooltip = true,
  withAnimation = true,
  withLabels = true,
  categoryLabelPosition = "inside",
}: ShadcnHorizontalBarChartProps) {
  const allKeys = seriesKeys ?? getSeriesKeys(data, categoryKey);
  const valueKey = allKeys[0];

  if (!valueKey) return null;

  const categoryOnBar = categoryLabelPosition === "inside";

  return (
    <ChartContainer config={config} className={className}>
      <RechartsBarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{
          left: 12,
          right: withLabels ? 16 : 12,
          top: 12,
          bottom: 12,
        }}
      >
        <XAxis type="number" dataKey={valueKey} hide />
        <YAxis
          dataKey={categoryKey}
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => String(value).slice(0, 3)}
          hide={categoryOnBar}
        />
        {withTooltip && (
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
        )}
        <Bar
          dataKey={valueKey}
          fill={`var(--color-${toChartColorVar(valueKey)})`}
          radius={5}
          isAnimationActive={withAnimation}
        >
          {categoryOnBar && (
            <LabelList
              dataKey={categoryKey}
              position="insideLeft"
              offset={8}
              className="fill-background"
              fontSize={12}
            />
          )}
          {withLabels && (
            <LabelList
              dataKey={valueKey}
              position="right"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
          )}
        </Bar>
      </RechartsBarChart>
    </ChartContainer>
  );
}
