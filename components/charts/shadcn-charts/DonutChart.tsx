"use client";

import * as React from "react";
import {
  Cell,
  Label,
  Pie,
  PieChart as RechartsPieChart,
  Sector,
} from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ShadcnDonutChartProps {
  data: { name: string; value: number; fill?: string }[];
  config: ChartConfig;
  className?: string;
  withTooltip?: boolean;
  withAnimation?: boolean;
  withLegend?: boolean;
  /** Show total or active value in center */
  withCenterText?: boolean;
  /** "total" = sum of all, "active" = active segment value */
  centerTextMode?: "total" | "active";
  /** Enable active sector (click legend to highlight). When true, segment pops out. */
  withActiveSector?: boolean;
  /** Index of segment to highlight when withActiveSector is true. Set by clicking legend. */
  activeIndex?: number;
  /** When provided and withActiveSector is true, legend items are clickable to select active segment. */
  onActiveIndexChange?: (index: number) => void;
}

function DonutClickableLegend({
  dataWithFill,
  activeIndex,
  onSelect,
}: {
  dataWithFill: { name: string; value: number; fill?: string }[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
      {dataWithFill.map((entry, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={entry.name}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors",
              isActive
                ? "bg-muted ring-1 ring-border"
                : "hover:bg-muted/60",
            )}
          >
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
          </button>
        );
      })}
    </div>
  );
}

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ShadcnDonutChart({
  data,
  config,
  className,
  withTooltip = true,
  withAnimation = true,
  withLegend = true,
  withCenterText = false,
  centerTextMode = "total",
  withActiveSector = false,
  activeIndex = -1,
  onActiveIndexChange,
}: ShadcnDonutChartProps) {
  const dataWithFill = data.map((item, i) => ({
    ...item,
    fill: item.fill ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  const total = React.useMemo(
    () => dataWithFill.reduce((acc, curr) => acc + curr.value, 0),
    [dataWithFill],
  );

  const enabled = withActiveSector;
  const validActiveIndex =
    enabled && activeIndex >= 0 && activeIndex < dataWithFill.length
      ? activeIndex
      : enabled
        ? 0
        : -1;
  const showActive = validActiveIndex >= 0;
  const isInteractive = enabled && !!onActiveIndexChange;

  const activeValue =
    validActiveIndex >= 0 && dataWithFill[validActiveIndex]
      ? dataWithFill[validActiveIndex].value
      : total;
  const centerValue =
    centerTextMode === "active" && validActiveIndex >= 0 ? activeValue : total;
  const centerLabel = centerTextMode === "active" && validActiveIndex >= 0
    ? (dataWithFill[validActiveIndex]?.name ?? "Value")
    : "Total";

  return (
    <ChartContainer config={config} className={className}>
      <RechartsPieChart>
        {withTooltip && (
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
        )}
        <Pie
          data={dataWithFill}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius="70%"
          paddingAngle={2}
          strokeWidth={5}
          isAnimationActive={withAnimation}
          activeIndex={showActive ? validActiveIndex : undefined}
          activeShape={
            showActive
              ? ({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                  <Sector {...props} outerRadius={outerRadius + 10} />
                )
              : undefined
          }
        >
          {dataWithFill.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          {withCenterText && (
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {centerValue.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground text-sm"
                      >
                        {centerLabel}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          )}
        </Pie>
        {withLegend &&
          (isInteractive ? (
            <ChartLegend
              content={() => (
                <DonutClickableLegend
                  dataWithFill={dataWithFill}
                  activeIndex={validActiveIndex}
                  onSelect={onActiveIndexChange!}
                />
              )}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          ) : (
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          ))}
      </RechartsPieChart>
    </ChartContainer>
  );
}
