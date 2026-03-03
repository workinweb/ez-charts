"use client";

import {
  LabelList,
  PolarGrid,
  RadialBar,
  RadialBarChart as RechartsRadialBarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ShadcnRadialChartProps {
  data: { name: string; value: number; fill?: string }[];
  config: ChartConfig;
  className?: string;
  withTooltip?: boolean;
  withAnimation?: boolean;
  /** Show segment labels inside bars */
  withLabels?: boolean;
  /** Show polar grid circles */
  withGrid?: boolean;
}

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ShadcnRadialChart({
  data,
  config,
  className,
  withTooltip = true,
  withAnimation = true,
  withLabels = false,
  withGrid = false,
}: ShadcnRadialChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const dataWithFill = data.map((item, i) => ({
    ...item,
    fill: item.fill ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    full: max,
  }));
  return (
    <ChartContainer config={config} className={className}>
      <RechartsRadialBarChart
        data={dataWithFill}
        cx="50%"
        cy="50%"
        innerRadius="60%"
        outerRadius="90%"
        barCategoryGap="10%"
      >
        {withTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        {withGrid && <PolarGrid gridType="circle" />}
        <RadialBar
          dataKey="value"
          cornerRadius={4}
          isAnimationActive={withAnimation}
          background={withLabels}
        >
          {withLabels && (
            <LabelList
              position="insideStart"
              dataKey="name"
              className="fill-white capitalize mix-blend-luminosity"
              fontSize={11}
            />
          )}
        </RadialBar>
      </RechartsRadialBarChart>
    </ChartContainer>
  );
}
