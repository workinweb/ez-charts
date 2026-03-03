// @ts-nocheck
import React, { CSSProperties } from "react";
import { gradientFromHex } from "../utils/utils";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";

export function BreakdownChartThin({
  data,
  className,
  withTooltip = true,
}: {
  data: { key: string; value: number; color: string }[];
  className?: string;
  withTooltip?: boolean;
}) {
  if (!data) {
    return null;
  }

  const gap = 0.3; // gap between bars
  const totalValue = data.reduce((acc, d) => acc + d.value, 0);
  const barHeight = 12;
  const totalWidth = totalValue + gap * (data.length - 1);
  const xPositions = data.reduce<number[]>((acc, d, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1]! + ((data[i - 1]!.value / totalWidth) * 100) + gap);
    return acc;
  }, []);

  const cornerRadius = 4; // Adjust this value to change the roundness

  const defaulColors = [
    "from-fuchsia-300/80 to-fuchsia-400/80 dark:from-fuchsia-500 dark:to-fuchsia-700",
    "from-violet-300 to-violet-400 dark:from-violet-500 dark:to-violet-700",
    "from-blue-300 to-blue-400 dark:from-blue-500 dark:to-blue-700",
    "from-sky-300 to-sky-400 dark:from-sky-500 dark:to-sky-700",
    "from-orange-200 to-orange-300 dark:from-amber-500 dark:to-amber-700",
  ];

  return (
    <div
      className={`relative h-[var(--height)] mt-4 mb-8 w-full ${className}`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "0px",
          "--marginBottom": "0px",
          "--marginLeft": "0px",
          "--height": `${barHeight}px`,
        } as CSSProperties
      }
    >
      {/* Chart Area */}
      <div
        className="absolute inset-0 
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        {/* Bars with Gradient Fill */}
        {data.map((d, index) => {
          const barWidth = (d.value / totalWidth) * 100;
          const xPosition = xPositions[index] ?? 0;
          const isHexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(d.color);
          const gradient = isHexColor ? gradientFromHex(d.color) : d.color;

          const barContent = (
            <div
              key={index}
              className="relative"
              style={{
                width: `${barWidth}%`,
                height: `${barHeight}px`,
                left: `${xPosition}%`,
                position: "absolute",
              }}
            >
              <div
                className={`bg-gradient-to-b ${
                  gradient || defaulColors[index % defaulColors.length]
                }`}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: `${cornerRadius}px`,
                  ...(isHexColor ? gradientFromHex(d.color) : {}),
                }}
              />
              <div
                className="text-xs text-gray-400 text-center"
                style={{
                  left: `${xPosition + barWidth / 2}%`,
                  top: `${barHeight + 18}px`,
                }}
              >
                {d.key}
              </div>
            </div>
          );

          if (!withTooltip) {
            return barContent;
          }

          return (
            <ClientTooltip key={index}>
              <TooltipTrigger>{barContent}</TooltipTrigger>
              <TooltipContent>
                <div className="flex gap-2.5 items-center">
                  <div
                    className={`w-1 h-8 rounded-full ${
                      d.color
                        ? d.color
                        : defaulColors[index % defaulColors.length]
                    }`}
                    style={{
                      backgroundColor: d.color,
                    }}
                  ></div>
                  <div>
                    <div>{d.key}</div>
                    <div className="text-gray-500 text-sm/5">{d.value}</div>
                  </div>
                </div>
              </TooltipContent>
            </ClientTooltip>
          );
        })}
      </div>
    </div>
  );
}
