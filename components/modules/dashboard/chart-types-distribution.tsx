"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

const COLORS = {
  teal: "#2dd4a8",
  blue: "#5574e8",
  dark: "#3d4560",
  purple: "#7c6ee8",
  muted: "#2a2e3d",
};

const chartTypesData = [
  { name: "Bar", value: 29, color: COLORS.teal },
  { name: "Line", value: 25, color: COLORS.blue },
  { name: "Pie", value: 20, color: COLORS.dark },
  { name: "Area", value: 17, color: COLORS.purple },
  { name: "Other", value: 9, color: COLORS.muted },
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#232840] px-4 py-3 shadow-2xl">
      <p className="text-[11px] font-medium text-white/50">{data.name}</p>
      <p className="text-sm font-bold text-white">{data.value}%</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props as {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  };
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.12) return null;
  return (
    <text
      x={x}
      y={y}
      fill="#e0e0ea"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

function DonutChart() {
  return (
    <PieChart width={250} height={250}>
      <Pie
        data={chartTypesData}
        cx={125}
        cy={125}
        innerRadius={55}
        outerRadius={115}
        paddingAngle={4}
        dataKey="value"
        strokeWidth={0}
        label={renderLabel}
        labelLine={false}
      >
        {chartTypesData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
    </PieChart>
  );
}

export function ChartTypesDistribution() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

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
          {mounted ? (
            <DonutChart />
          ) : (
            <div className="flex h-[250px] w-[250px] items-center justify-center">
              <div className="size-[230px] animate-pulse rounded-full bg-white/5" />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {chartTypesData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
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
