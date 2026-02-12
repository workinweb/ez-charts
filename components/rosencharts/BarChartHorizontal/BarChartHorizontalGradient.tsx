// @ts-nocheck
import type { GradientBarData } from "../types";
import { max, scaleBand, scaleLinear } from "d3";
import React, { CSSProperties } from "react";
import { AnimatedBar } from "../Animated/AnimatedBar";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import { gradientFromHex } from "../utils/utils";

export function BarChartHorizontalGradient({
  data,
  withTooltip = true,
  withAnimation = false,
  className,
}: {
  data: GradientBarData[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  className?: string;
}) {
  if (!data) {
    return null;
  }

  // Scales
  const yScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.175);

  const xScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([0, 100]);

  const defaultColors = [
    "bg-gradient-to-r from-pink-300 to-pink-400",
    "bg-gradient-to-r from-purple-300 to-purple-400",
    "bg-gradient-to-r from-indigo-300 to-indigo-400",
    "bg-gradient-to-r from-sky-300 to-sky-400",
    "bg-gradient-to-r from-orange-200 to-orange-300",
    "bg-gradient-to-r from-lime-300 to-lime-400",
  ];

  const longestWord = max(data.map((d) => d.key.length)) || 1;
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
          translate-y-[var(--marginTop)]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          overflow-visible
        "
      >
        {/* Grid lines */}
        <svg
          className="absolute h-full w-full z-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
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

        {/* Bars with Rounded Right Corners - now after grid lines with higher z-index */}
        {data.map((d, index) => {
          d.color = d.color || "";

          const barWidth = xScale(d.value);
          const barHeight = yScale.bandwidth();
          const isHexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(d.color);
          const gradient = isHexColor ? gradientFromHex(d.color) : d.color;

          if (!withTooltip) {
            return (
              <AnimatedBar
                key={index}
                withAnimation={withAnimation}
                className={`bg-gradient-to-b ${
                  gradient || defaultColors[index % defaultColors.length]
                } absolute`}
                index={index}
                style={{
                  position: "absolute",
                  left: "0",
                  top: `${yScale(d.key)}%`,
                  width: `${barWidth}%`,
                  height: `${barHeight}%`,
                  borderRadius: "0 6px 6px 0", // Rounded right corners
                  zIndex: 1,
                  ...(isHexColor ? gradientFromHex(d.color) : {}),
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
                  className={`bg-gradient-to-b ${
                    gradient || defaultColors[index % defaultColors.length]
                  } absolute`}
                  style={{
                    left: "0",
                    top: `${yScale(d.key)}%`,
                    width: `${barWidth}%`,
                    height: `${barHeight}%`,
                    borderRadius: "0 6px 6px 0", // Rounded right corners
                    zIndex: 1,
                    ...(isHexColor ? gradientFromHex(d.color) : {}),
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex gap-2.5 items-center">
                  <div
                    className={`w-1 h-8 rounded-full ${
                      d.color
                        ? d.color
                        : defaultColors[index % defaultColors.length]
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
        className="absolute
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
