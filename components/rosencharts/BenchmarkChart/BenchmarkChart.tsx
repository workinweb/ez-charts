// @ts-nocheck
import type { BenchmarkChartItem } from "../types";
import React, { useMemo } from "react";
import { AnimatedBar } from "../Animated/AnimatedBar";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";

const defaultColors = [
  {
    from: "from-lime-300",
    to: "to-teal-300",
    darkFrom: "dark:from-[#00F2FF]",
    darkTo: "dark:to-[#7AED5C]",
    text: "text-lime-500",
    darkText: "dark:text-[#00F2FF]",
    valueText: "text-teal-400",
    darkValueText: "dark:text-[#7AED5C]",
  },
  {
    from: "from-zinc-400",
    to: "to-gray-400",
    darkFrom: "dark:from-zinc-500",
    darkTo: "dark:to-zinc-400",
    text: "text-gray-500",
    darkText: "dark:text-zinc-400",
    valueText: "text-gray-400",
    darkValueText: "dark:text-zinc-400",
  },
  {
    from: "from-orange-300",
    to: "to-red-300",
    darkFrom: "dark:from-orange-400",
    darkTo: "dark:to-red-400",
    text: "text-orange-500",
    darkText: "dark:text-orange-400",
    valueText: "text-red-400",
    darkValueText: "dark:text-red-400",
  },
  {
    from: "from-blue-300",
    to: "to-indigo-300",
    darkFrom: "dark:from-blue-400",
    darkTo: "dark:to-indigo-400",
    text: "text-blue-500",
    darkText: "dark:text-blue-400",
    valueText: "text-indigo-400",
    darkValueText: "dark:text-indigo-400",
  },
];

export function BenchmarkChart({
  data,
  className,
  withTooltip = true,
  withAnimation = false,
}: {
  data: BenchmarkChartItem[];
  className?: string;
  withTooltip?: boolean;
  withAnimation?: boolean;
}) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);

  return (
    <div className={`w-full h-full grid gap-4 py-4 ${className || ""}`}>
      {data.map((d, index) => {
        const colorIndex = index % defaultColors.length;
        const content = (
          <>
            <div
              className={`text-sm whitespace-nowrap ${
                !d.colorFrom && !d.colorTo
                  ? `${defaultColors[colorIndex].text} ${defaultColors[colorIndex].darkText}`
                  : ""
              }`}
              style={{
                color: d.colorFrom && d.colorTo ? d.colorFrom : undefined,
              }}
            >
              {d.key}
            </div>
            <div className="flex items-center gap-2.5">
              <div
                key={index}
                className="relative rounded-sm h-3 bg-gray-200 dark:bg-zinc-800 overflow-hidden w-full"
              >
                <AnimatedBar
                  withAnimation={withAnimation}
                  className={`absolute inset-0 rounded-r-sm bg-gradient-to-r ${
                    d.colorFrom && d.colorTo
                      ? `from-[${d.colorFrom}] to-[${d.colorTo}]`
                      : `${defaultColors[colorIndex].from} ${defaultColors[colorIndex].to} ${defaultColors[colorIndex].darkFrom} ${defaultColors[colorIndex].darkTo}`
                  }`}
                  style={{
                    width: `${(d.value / maxValue) * 100}%`,
                    background:
                      d.colorFrom && d.colorTo
                        ? `linear-gradient(to right, ${d.colorFrom}, ${d.colorTo})`
                        : undefined,
                  }}
                />
              </div>
              <div
                className={`text-sm whitespace-nowrap tabular-nums ${
                  !d.colorFrom && !d.colorTo
                    ? `${defaultColors[colorIndex].valueText} ${defaultColors[colorIndex].darkValueText}`
                    : ""
                }`}
                style={{
                  color: d.colorFrom && d.colorTo ? d.colorTo : undefined,
                }}
              >
                {d.value}
              </div>
            </div>
          </>
        );

        if (!withTooltip) {
          return <div key={index}>{content}</div>;
        }

        return (
          <ClientTooltip key={index}>
            <TooltipTrigger>{content}</TooltipTrigger>
            <TooltipContent>
              <div>{d.key}</div>
              <div className="text-gray-500 dark:text-zinc-400 text-sm">
                {d.value}
              </div>
            </TooltipContent>
          </ClientTooltip>
        );
      })}
    </div>
  );
}
