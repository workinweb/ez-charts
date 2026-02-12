import React, { CSSProperties } from "react";
import { scaleBand, scaleLinear, max } from "d3";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import { AnimatedBar } from "../Animated/AnimatedBar";
import type { HorizontalBarData } from "../types";

export function BarChartHorizontal({
  data,
  withTooltip = true,
  withAnimation = false,

  className,
}: {
  data: HorizontalBarData[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  className?: string;
}) {
  if (!data) {
    return null;
  }

  const defaultColor = "bg-gradient-to-r from-purple-400 to-purple-400";

  // Scales
  const yScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.175);

  const xScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([0, 100]);

  const longestWord = max(data.map((d) => d.key?.length)) || 1;

  return (
    <div
      className={`relative w-full h-72 ${className}`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "0px",
          "--marginBottom": "16px",
          "--marginLeft": `${longestWord * 7}px`,
        } as CSSProperties
      }
    >
      {/* Chart Area */}
      <div
        className="absolute inset-0
          z-10
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        {/* Bars with Rounded Right Corners */}
        {data.map((d, index) => {
          d.color = d.color || "";

          const barWidth = xScale(d.value);
          const barHeight = yScale.bandwidth();

          if (!withTooltip) {
            return (
              <AnimatedBar
                key={index}
                index={index}
                withAnimation={withAnimation}
                className={`absolute ${d.color || defaultColor}`}
                style={{
                  left: "0",
                  top: `${yScale(d.key)}%`,
                  width: `${barWidth}%`,
                  height: `${barHeight}%`,
                  borderRadius: "0 6px 6px 0",
                  backgroundColor: d.color || defaultColor,
                }}
              />
            );
          }

          return (
            <ClientTooltip key={index}>
              <TooltipTrigger>
                <AnimatedBar
                  index={index}
                  withAnimation={withAnimation}
                  className={`absolute ${d.color || defaultColor}`}
                  style={{
                    left: "0",
                    top: `${yScale(d.key)}%`,
                    width: `${barWidth}%`,
                    height: `${barHeight}%`,
                    borderRadius: "0 6px 6px 0",
                    backgroundColor: d.color || defaultColor,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex gap-2.5 items-center">
                  <div
                    className={`w-1 h-8 rounded-full ${
                      d.color ? d.color : defaultColor
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

        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {xScale
            .ticks(8)
            .map(xScale.tickFormat(8, "d"))
            .map((active, i) => (
              <g
                transform={`translate(${xScale(+active)},0)`}
                className="text-gray-300/80 dark:text-gray-800/80"
                key={i}
              >
                <line
                  y1={0}
                  y2={100}
                  stroke="currentColor"
                  strokeDasharray="6,5"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
        </svg>
        {/* X Axis (Values) */}
        {xScale.ticks(4).map((value, i) => (
          <div
            key={i}
            style={{
              left: `${xScale(value)}%`,
              top: "100%",
            }}
            className="absolute text-xs -translate-x-1/2 tabular-nums text-gray-400"
          >
            {value}
          </div>
        ))}
      </div>

      {/* Y Axis (Letters) */}
      <div
        className="
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible"
      >
        {data.map((entry, i) => (
          <span
            key={i}
            style={{
              left: "-8px",
              top: `${yScale(entry.key)! + yScale.bandwidth() / 2}%`,
            }}
            className="absolute text-xs text-gray-400 -translate-y-1/2 w-full text-right"
          >
            {entry.key}
          </span>
        ))}
      </div>
    </div>
  );
}
