"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
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

export type RadarGridType =
  | "polygon"
  | "polygon-no-lines"
  | "circle"
  | "circle-no-lines"
  | "filled"
  | "circle-filled"
  | "none";

export interface ShadcnRadarChartProps {
  data: Record<string, string | number>[];
  config: ChartConfig;
  className?: string;
  categoryKey?: string;
  seriesKeys?: string[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  /** Grid style: polygon (default), circle, circle-no-lines, filled, circle-filled, none */
  radarGridType?: RadarGridType;
  /** Lines only: no fill, stroke only */
  radarLinesOnly?: boolean;
  /** Show series legend */
  withLegend?: boolean;
}

function getSeriesKeys(data: Record<string, string | number>[], categoryKey: string): string[] {
  if (!data[0]) return [];
  return Object.keys(data[0]).filter(
    (k) => k !== categoryKey && k !== "fullMark" && typeof data[0]![k] === "number"
  );
}

export function ShadcnRadarChart({
  data,
  config,
  className,
  categoryKey = "subject",
  seriesKeys,
  withTooltip = true,
  withAnimation = true,
  radarGridType = "polygon",
  radarLinesOnly = false,
  withLegend = false,
}: ShadcnRadarChartProps) {
  const keys = seriesKeys ?? getSeriesKeys(data, categoryKey);
  const firstKey = keys[0];
  const gridFillStyle =
    firstKey && (radarGridType === "filled" || radarGridType === "circle-filled")
      ? {
          fill: `var(--color-${toChartColorVar(firstKey)})`,
          opacity: 0.2,
        }
      : undefined;

  const renderGrid = () => {
    if (radarGridType === "none") return null;
    const isCircle =
      radarGridType === "circle" ||
      radarGridType === "circle-no-lines" ||
      radarGridType === "circle-filled";
    const noRadialLines =
      radarGridType === "polygon-no-lines" ||
      radarGridType === "circle-no-lines";
    return (
      <PolarGrid
        gridType={isCircle ? "circle" : undefined}
        radialLines={noRadialLines ? false : undefined}
        {...(gridFillStyle && { style: gridFillStyle })}
      />
    );
  };

  return (
    <ChartContainer config={config} className={className}>
      <RechartsRadarChart
        data={data}
        cx="50%"
        cy="50%"
        outerRadius="70%"
        margin={withLegend ? { top: -40, bottom: -10 } : undefined}
      >
        {withTooltip && (
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator={radarLinesOnly ? "line" : undefined}
                hideLabel={keys.length === 1}
              />
            }
          />
        )}
        <PolarAngleAxis
          dataKey={categoryKey}
          tick={{ fill: "var(--muted-foreground)" }}
        />
        {renderGrid()}
        {keys.map((key) => (
          <Radar
            key={key}
            name={String(config[key]?.label ?? key)}
            dataKey={key}
            stroke={`var(--color-${toChartColorVar(key)})`}
            fill={`var(--color-${toChartColorVar(key)})`}
            fillOpacity={radarLinesOnly ? 0 : radarGridType === "filled" || radarGridType === "circle-filled" ? 0.5 : 0.6}
            strokeWidth={radarLinesOnly ? 2 : undefined}
            dot={
              !radarLinesOnly && (radarGridType === "circle" || radarGridType === "circle-no-lines")
                ? { r: 4, fillOpacity: 1 }
                : undefined
            }
            isAnimationActive={withAnimation}
          />
        ))}
        {withLegend && (
          <ChartLegend className="mt-8" content={<ChartLegendContent />} />
        )}
      </RechartsRadarChart>
    </ChartContainer>
  );
}
