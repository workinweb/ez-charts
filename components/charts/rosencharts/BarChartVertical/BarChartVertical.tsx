import { max, scaleBand, scaleLinear } from "d3";
import React, { CSSProperties } from "react";
import { AnimatedVerticalBar } from "../Animated/AnimatedVerticalBar";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import type { VerticalBarData } from "../types";

export function BarChartVertical({
  data,
  withTooltip = true,
  withAnimation = false,
  className,
}: {
  data: VerticalBarData[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  className?: string;
}) {
  if (!data) {
    return null;
  }

  // Scales – use actual data so bars fill the full horizontal space (like vertical-multi)
  const xScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.3);

  const yScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([100, 0]);

  return (
    <div
      className={`relative h-72 w-full grid ${className}`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "25px",
          "--marginBottom": "56px",
          "--marginLeft": "25px",
        } as CSSProperties
      }
    >
      {/* Y axis */}
      <div
        className="relative
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        {yScale
          .ticks(8)
          .map(yScale.tickFormat(8, "d"))
          .map((value, i) => (
            <div
              key={i}
              style={{
                top: `${yScale(+value)}%`,
              }}
              className="absolute text-xs tabular-nums -translate-y-1/2 text-gray-300 w-full text-right pr-2"
            >
              {value}
            </div>
          ))}
      </div>

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
        <svg
          viewBox="0 0 100 100"
          className="overflow-visible w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {yScale
            .ticks(8)
            .map(yScale.tickFormat(8, "d"))
            .map((active, i) => (
              <g
                transform={`translate(0,${yScale(+active)})`}
                className="text-gray-300/80 dark:text-gray-800/80"
                key={i}
              >
                <line
                  x1={0}
                  x2={100}
                  stroke="currentColor"
                  strokeDasharray="6,5"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
        </svg>

        {/* X Axis (Labels) */}
        {data.map((entry, i) => {
          const xPosition = xScale(entry.key)! + xScale.bandwidth() / 2;

          return (
            <div
              key={i}
              className="absolute overflow-visible text-gray-400"
              style={{
                left: `${xPosition}%`,
                top: "100%",
                transform: "rotate(45deg) translateX(4px) translateY(8px)",
              }}
            >
              <div
                className={`absolute text-xs -translate-y-1/2 whitespace-nowrap`}
              >
                {entry.key.slice(0, 10) + (entry.key.length > 10 ? "..." : "")}
              </div>
            </div>
          );
        })}

        {/* Bars */}
        {data.map((d, index) => {
          const barWidth = xScale.bandwidth();
          const barHeight = yScale(0) - yScale(d.value);
          const defaultColor =
            "bg-gradient-to-b from-fuchsia-200 to-fuchsia-300";

          if (!withTooltip) {
            return (
              <AnimatedVerticalBar
                key={index}
                index={index}
                withAnimation={withAnimation}
                className={`absolute bottom-0 ${d.color || defaultColor}`}
                style={{
                  width: `${barWidth}%`,
                  height: `${barHeight}%`,
                  borderRadius: "6px 6px 0 0",
                  marginLeft: `${xScale(d.key)}%`,
                  backgroundColor: d.color,
                }}
              />
            );
          }

          return (
            <ClientTooltip key={index}>
              <TooltipTrigger>
                <AnimatedVerticalBar
                  key={index}
                  index={index}
                  withAnimation={withAnimation}
                  className={`absolute bottom-0 ${d.color || defaultColor}`}
                  style={{
                    width: `${barWidth}%`,
                    height: `${barHeight}%`,
                    borderRadius: "6px 6px 0 0",
                    marginLeft: `${xScale(d.key)}%`,
                    backgroundColor: d.color,
                  }}
                />
              </TooltipTrigger>

              <TooltipContent>
                <div className="flex gap-2.5 items-center">
                  <div
                    className="w-1 h-8 bg-purple-300 dark:bg-purple-400 rounded-full"
                    style={{ backgroundColor: d.color }}
                  ></div>
                  <div>
                    <div>{d.key}</div>
                    <div className="text-gray-500 text-sm/5">{d.value}%</div>
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
