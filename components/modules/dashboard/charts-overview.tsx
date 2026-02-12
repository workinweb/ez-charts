"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const chartsData = [
  { month: "Jan", charts: 18, projected: 22 },
  { month: "Feb", charts: 24, projected: 28 },
  { month: "Mar", charts: 31, projected: 32 },
  { month: "Apr", charts: 28, projected: 35 },
  { month: "May", charts: 42, projected: 38 },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-border/5 bg-white px-3 py-2 shadow-xl">
      <p className="mb-1 text-[10px] font-semibold text-gray-500">{label}</p>
      {payload.map((entry, index) => (
        <p
          key={index}
          className="text-xs font-bold"
          style={{ color: entry.color }}
        >
          {entry.value} charts
        </p>
      ))}
    </div>
  );
}

export function ChartsOverview() {
  return (
    <Card className="col-span-full overflow-hidden rounded-[28px] bg-[#BCBDEA] p-5 shadow-sm ring-0 sm:rounded-[40px] sm:p-8 lg:col-span-7">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-[20px] font-medium text-[#3D4035]">
          Charts Overview
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-1 flex-col justify-center rounded-[32px] bg-white/80 p-8 shadow-sm">
            <p className="text-[13px] font-medium text-[#3D4035]/60">
              This Month
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[48px] font-light tracking-tight text-[#3D4035]">
                42
              </span>
              <span className="text-[28px] font-light text-[#3D4035]/60">
                charts
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center rounded-[32px] bg-[#354052] p-8 shadow-sm">
            <p className="text-[13px] font-medium text-white/60">
              Total All-Time
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[48px] font-light tracking-tight text-white">
                598
              </span>
              <span className="text-[28px] font-light text-white/60">
                charts
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-between rounded-[32px] bg-white/80 p-8 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <Badge className="h-[24px] rounded-lg border-0 bg-[#6C5DD3] px-3 text-[12px] font-semibold text-white">
              Live
            </Badge>
            <div className="text-right">
              <p className="text-[36px] font-bold leading-none text-[#3D4035]">
                28.6
              </p>
              <p className="text-[12px] font-medium text-[#3D4035]/50">
                Avg. Monthly
              </p>
            </div>
          </div>

          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData} barGap={6} barCategoryGap="25%">
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#8E92A3",
                    fontWeight: 500,
                  }}
                  dy={10}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(0,0,0,0.03)", radius: 8 }}
                />
                <Bar
                  dataKey="charts"
                  fill="#6C5DD3"
                  radius={[6, 6, 6, 6]}
                  maxBarSize={10}
                />
                <Bar
                  dataKey="projected"
                  fill="#A098E5"
                  radius={[6, 6, 6, 6]}
                  maxBarSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}
