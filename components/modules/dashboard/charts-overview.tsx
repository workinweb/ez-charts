"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { BarChartHorizontal } from "@/components/charts/rosencharts";
import type { HorizontalBarData } from "@/components/charts/rosencharts";

export function ChartsOverview() {
  const { stats, isLoading } = useDashboardStats();
  const { totalCharts, chartsThisMonth, monthlyData } = stats;
  const avgMonthly =
    monthlyData.length > 0
      ? (
          monthlyData.reduce((s, m) => s + m.charts, 0) / monthlyData.length
        ).toFixed(1)
      : "0";

  return (
    <Card className="col-span-full min-w-0 overflow-hidden rounded-[28px] bg-[#BCBDEA] p-5 shadow-sm ring-0 sm:rounded-[40px] sm:p-6 lg:p-8 lg:col-span-7">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-[20px] font-medium text-[#3D4035]">
          Charts Overview
        </h3>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-1 flex-col justify-center rounded-[32px] bg-white/80 p-5 shadow-sm sm:p-6 lg:p-8">
            <p className="text-[13px] font-medium text-[#3D4035]/60">
              This Month
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-light tracking-tight text-[#3D4035] lg:text-[48px]">
                {isLoading ? "—" : chartsThisMonth}
              </span>
              <span className="text-[20px] font-light text-[#3D4035]/60 lg:text-[28px]">
                charts
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center rounded-[32px] bg-[#354052] p-5 shadow-sm sm:p-6 lg:p-8">
            <p className="text-[13px] font-medium text-white/60">
              Total All-Time
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-light tracking-tight text-white lg:text-[48px]">
                {isLoading ? "—" : totalCharts}
              </span>
              <span className="text-[20px] font-light text-white/60 lg:text-[28px]">
                charts
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-between rounded-[32px] bg-white/80 p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-6 flex items-start justify-between">
            <Badge className="h-[24px] rounded-lg border-0 bg-[#6C5DD3] px-3 text-[12px] font-semibold text-white">
              Live
            </Badge>
            <div className="text-right">
              <p className="text-[28px] font-bold leading-none text-[#3D4035] lg:text-[36px]">
                {isLoading ? "—" : avgMonthly}
              </p>
              <p className="text-[12px] font-medium text-[#3D4035]/50">
                Avg. Monthly
              </p>
            </div>
          </div>

          <div className="h-[180px] w-full -mx-1 min-h-[160px]">
            {isLoading ? (
              <div className="flex h-[160px] items-center justify-center">
                <div className="size-24 animate-pulse rounded-lg bg-[#3D4035]/10" />
              </div>
            ) : monthlyData.length === 0 ? (
              <p className="flex h-[160px] items-center justify-center text-[13px] text-[#3D4035]/50">
                No monthly data yet
              </p>
            ) : (
              <BarChartHorizontal
                data={monthlyData.map(
                  (d): HorizontalBarData => ({
                    key: d.month,
                    value: d.charts,
                    color: "#6C5DD3",
                  }),
                )}
                withTooltip
                withAnimation={false}
                className="h-[160px]"
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
