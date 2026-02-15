// @ts-nocheck
import { max, scaleBand, scaleLinear } from "d3";
import Image from "next/image";
import React, { CSSProperties } from "react";
import { AnimatedBar } from "../Animated/AnimatedBar";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip"; // Or wherever you pasted Tooltip.tsx
import type { ImageBarData, SVGBarData } from "../types";
import { gradientFromHex, isValidUrl } from "../utils/utils";

export function BarChartHorizontalImage({
  data,
  withTooltip = true,
  withAnimation = false,
  className,
}: {
  data: SVGBarData[] | ImageBarData[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  className?: string;
}) {
  if (!data) {
    return null;
  }

  const defaultColors = [
    "bg-gradient-to-r from-pink-300 to-pink-400",
    "bg-gradient-to-r from-purple-300 to-purple-400",
    "bg-gradient-to-r from-indigo-300 to-indigo-400",
    "bg-gradient-to-r from-sky-300 to-sky-400",
    "bg-gradient-to-r from-orange-200 to-orange-300",
    "bg-gradient-to-r from-lime-300 to-lime-400",
  ];

  // Scales
  const yScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.2);

  const xScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([0, 100]);

  return (
    <div
      className={`relative w-full h-72 ${className}`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "35px",
          "--marginBottom": "0px",
          "--marginLeft": `35px`,
        } as CSSProperties
      }
    >
      {/* X Axis (Values) */}
      <div
        className="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          translate-y-[var(--marginTop)]
          left-[var(--marginLeft)]
          right-[var(--marginRight)]
          overflow-visible"
      >
        {data.map((entry, i) => {
          if (xScale(entry.value) == 0) return null;
          return (
            <span
              key={i}
              style={{
                top: `${yScale(entry.key)! + yScale.bandwidth() / 2}%`,
                left: `calc(${xScale(entry.value)}% + 5px)`,
              }}
              className="absolute text-xs text-gray-400 font-medium -translate-y-1/2 pr-1"
            >
              {entry.value}
            </span>
          );
        })}
      </div>

      {/* Y Axis (Images) */}
      <div
        className="absolute inset-0
         h-[calc(100%-var(--marginTop)-var(--marginBottom))]
         translate-y-[var(--marginTop)]
         overflow-visible"
      >
        {data.map((entry: ImageBarData | SVGBarData, i) => {
          if (!entry.image) return null;

          const isUrl =
            typeof entry.image === "string" ? isValidUrl(entry.image) : false;

          return (
            <div
              key={i}
              style={{
                top: `${yScale(entry.key)! + yScale.bandwidth() / 2}%`,
                left: `0`,
              }}
              className="absolute rounded-full overflow-hidden size-7 text-sm text-gray-700 -translate-y-1/2 pointer-events-none"
            >
              {typeof entry.image === "string" && isUrl ? (
                <Image
                  key={i}
                  src={entry.image}
                  alt={`${entry.key} icon`}
                  width={28}
                  height={28}
                  className="opacity-80 dark:opacity-100"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 18 18"
                  className="opacity-80 dark:opacity-100"
                >
                  {entry.image}
                </svg>
              )}
            </div>
          );
        })}
      </div>

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

          const isHexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(d.color);
          const gradient = isHexColor ? gradientFromHex(d.color) : d.color;

          if (!withTooltip) {
            return (
              <AnimatedBar
                key={index}
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
                  borderRadius: "0 6px 6px 0",
                  backgroundColor: d.color,
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
                    borderRadius: "0 6px 6px 0",
                    backgroundColor: d.color,
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

        <svg
          className="w-full h-full"
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
      </div>
    </div>
  );
}
