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

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export interface ShadcnPieStackedChartProps {
  /** Cartesian data: [{ month, desktop, mobile }] — category + 2 series for inner/outer rings */
  data: Record<string, string | number>[];
  config: ChartConfig;
  className?: string;
  categoryKey?: string;
  seriesKeys?: string[];
  withTooltip?: boolean;
  withAnimation?: boolean;
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

export function ShadcnPieStackedChart({
  data,
  config,
  className,
  categoryKey = "month",
  seriesKeys,
  withTooltip = true,
  withAnimation = true,
  withLegend = true,
}: ShadcnPieStackedChartProps) {
  const keys = seriesKeys ?? getSeriesKeys(data, categoryKey);
  const innerKey = keys[0];
  const outerKey = keys[1];

  if (!innerKey || !outerKey || data.length === 0) {
    return null;
  }

  const innerData = data.map((row, i) => ({
    [categoryKey]: row[categoryKey],
    [innerKey]: row[innerKey],
    fill:
      (config[String(row[categoryKey])] as { color?: string } | undefined)
        ?.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  const outerData = data.map((row, i) => ({
    [categoryKey]: row[categoryKey],
    [outerKey]: row[outerKey],
    fill:
      (config[String(row[categoryKey])] as { color?: string } | undefined)
        ?.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  return (
    <ChartContainer config={config} className={className}>
      <RechartsPieChart>
        {withTooltip && (
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelKey={categoryKey}
                nameKey={categoryKey}
                indicator="line"
                labelFormatter={(_, payload) => {
                  const item = payload?.[0];
                  if (!item?.dataKey) return null;
                  const cfg = config[item.dataKey as keyof typeof config];
                  return cfg && typeof cfg === "object" && "label" in cfg
                    ? (cfg as { label: string }).label
                    : String(item.dataKey);
                }}
              />
            }
          />
        )}
        <Pie
          data={innerData}
          dataKey={innerKey}
          nameKey={categoryKey}
          cx="50%"
          cy="50%"
          outerRadius="55%"
          paddingAngle={2}
          isAnimationActive={withAnimation}
        >
          {innerData.map((entry, index) => (
            <Cell key={`inner-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Pie
          data={outerData}
          dataKey={outerKey}
          nameKey={categoryKey}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="85%"
          paddingAngle={2}
          isAnimationActive={withAnimation}
        >
          {outerData.map((entry, index) => (
            <Cell key={`outer-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        {withLegend && (
          <ChartLegend
            content={<ChartLegendContent nameKey={categoryKey} />}
            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
          />
        )}
      </RechartsPieChart>
    </ChartContainer>
  );
}
