"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { DonutChart } from "@/components/rosencharts";
import type { PieChartItem } from "@/components/rosencharts";

const COLORS = [
  "#2dd4a8",
  "#5574e8",
  "#3d4560",
  "#7c6ee8",
  "#2a2e3d",
  "#e87c5c",
];

function chartTypesToPieData(
  chartTypes: { name: string; value: number }[],
): PieChartItem[] {
  return chartTypes.map((d, i) => ({
    name: ``,
    value: d.value,
    colorFrom: COLORS[i % COLORS.length],
    colorTo: COLORS[i % COLORS.length],
  }));
}

export function ChartTypesDistribution() {
  const [mounted, setMounted] = useState(false);
  const { stats, isLoading } = useDashboardStats();
  const chartTypes = stats.chartTypes;
  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const totalValue = chartTypes.reduce((s, t) => s + t.value, 0);
  const isEmpty = chartTypes.length === 0 || totalValue === 0;

  return (
    <Card className="col-span-full rounded-[32px] bg-[#354052] text-white ring-0 md:col-span-6 p-6">
      <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[18px] font-medium text-white/90">
          Chart Types
        </CardTitle>
        <CardAction></CardAction>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex items-center justify-center">
          {!mounted || isLoading ? (
            <div className="flex h-[250px] w-[250px] items-center justify-center">
              <div className="size-[230px] animate-pulse rounded-full bg-white/5" />
            </div>
          ) : isEmpty ? (
            <div className="flex h-[250px] w-[250px] items-center justify-center">
              <p className="text-[13px] text-white/50">No charts yet</p>
            </div>
          ) : (
            <div className="h-[250px] w-[250px] [&_svg]:text-white/90">
              <DonutChart
                data={chartTypesToPieData(chartTypes)}
                withTooltip
                suffix="%"
                className="!text-white"
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {chartTypes.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="size-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-[12px] font-medium text-white/50">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
