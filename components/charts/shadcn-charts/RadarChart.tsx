"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ShadcnRadarChartProps {
  data: Record<string, string | number>[];
  config: ChartConfig;
  className?: string;
  /** Key for categories (e.g. "subject") */
  categoryKey?: string;
  /** Keys for numeric series, e.g. ["A", "B"] */
  seriesKeys?: string[];
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
}: ShadcnRadarChartProps) {
  const keys = seriesKeys ?? getSeriesKeys(data, categoryKey);
  return (
    <ChartContainer config={config} className={className}>
      <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid />
        <PolarAngleAxis
          dataKey={categoryKey}
          tick={{ fill: "var(--muted-foreground)" }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {keys.map((key, i) => (
          <Radar
            key={key}
            name={String(config[key]?.label ?? key)}
            dataKey={key}
            stroke={`var(--color-${key})`}
            fill={`var(--color-${key})`}
            fillOpacity={0.3}
          />
        ))}
      </RechartsRadarChart>
    </ChartContainer>
  );
}
