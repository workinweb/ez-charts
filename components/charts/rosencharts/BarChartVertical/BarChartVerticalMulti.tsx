import React, { CSSProperties } from "react";
import { scaleBand, scaleLinear, max } from "d3";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip"; // Or wherever you pasted Tooltip.tsx
import { AnimatedVerticalBar } from "../Animated/AnimatedVerticalBar";
import type { MultiBarData } from "../types";

const PX_BETWEEN_BARS = 5;
const defaultBarColors = ["#B89DFB", "#e7deff"];

export function BarChartVerticalMulti({
  data,
  withTooltip = true,
  withAnimation = false,
  className,
}: {
  data: MultiBarData[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  className?: string;
}) {
  if (!data) {
    return null;
  }

  const numBars = data[0].values.length; // Get the number of bars

  // Upkey scales
  const xScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.4);

  const yScale = scaleLinear()
    .domain([0, max(data.flatMap((d) => d.values)) ?? 0])
    .range([100, 0]);

  return (
    <div
      className={`relative h-72 w-full grid ${className}`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "25px",
          "--marginBottom": "55px",
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
        <div className="relative w-full h-full">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
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

          {/* Bars */}
          {data.map((d, index) => {
            if (!withTooltip) {
              return (
                <AnimatedVerticalBar
                  key={index}
                  index={index}
                  withAnimation={withAnimation}
                  className="absolute top-0"
                  style={{
                    left: `${xScale(d.key)}%`,
                    width: `${xScale.bandwidth()}%`,
                    height: "100%",
                  }}
                >
                  {d.values.map((value, barIndex) => {
                    const barHeight = 100 - yScale(value);
                    const barWidth =
                      (100 - PX_BETWEEN_BARS * (numBars - 1)) / numBars;
                    const barXPosition =
                      barIndex * (barWidth + PX_BETWEEN_BARS);
                    const barColor =
                      d.multipleColors && d.multipleColors[barIndex]
                        ? d.multipleColors[barIndex]
                        : defaultBarColors[barIndex % defaultBarColors.length];

                    return (
                      <div
                        key={barIndex}
                        className="absolute bottom-0 rounded-t"
                        style={{
                          left: `${barXPosition}%`,
                          width: `${barWidth}%`,
                          height: `${barHeight}%`,
                          backgroundColor: barColor,
                          border: `1px solid #a07dff22`,
                        }}
                      />
                    );
                  })}
                </AnimatedVerticalBar>
              );
            }

            return (
              <ClientTooltip key={index}>
                <TooltipTrigger>
                  <AnimatedVerticalBar
                    key={index}
                    index={index}
                    withAnimation={withAnimation}
                    className="absolute top-0"
                    style={{
                      left: `${xScale(d.key)}%`,
                      width: `${xScale.bandwidth()}%`,
                      height: "100%",
                    }}
                  >
                    {d.values.map((value, barIndex) => {
                      const barHeight = 100 - yScale(value);
                      const barWidth =
                        (100 - PX_BETWEEN_BARS * (numBars - 1)) / numBars;
                      const barXPosition =
                        barIndex * (barWidth + PX_BETWEEN_BARS);
                      const barColor =
                        d.multipleColors && d.multipleColors[barIndex]
                          ? d.multipleColors[barIndex]
                          : defaultBarColors[
                              barIndex % defaultBarColors.length
                            ];

                      return (
                        <div
                          key={barIndex}
                          className="absolute bottom-0 rounded-t"
                          style={{
                            left: `${barXPosition}%`,
                            width: `${barWidth}%`,
                            height: `${barHeight}%`,
                            backgroundColor: barColor,
                            border: `1px solid #a07dff22`,
                          }}
                        />
                      );
                    })}
                  </AnimatedVerticalBar>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm text-gray-400 border-b border-gray-200 dark:border-zinc-700 pb-1 mb-1.5">
                    {d.key}
                  </div>
                  <div className="flex flex-col gap-2">
                    {d.values.map((value, index) => {
                      const barColor =
                        d.multipleColors && d.multipleColors[index]
                          ? d.multipleColors[index]
                          : defaultBarColors[index % defaultBarColors.length];
                      return (
                        <div
                          key={index}
                          className="flex gap-1.5 items-center text-sm"
                        >
                          <div
                            className="h-3.5 w-1 rounded-full"
                            style={{
                              backgroundColor: barColor,
                            }}
                          />
                          <span>{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </TooltipContent>
              </ClientTooltip>
            );
          })}

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
                  {entry.key.slice(0, 10) +
                    (entry.key.length > 10 ? "..." : "")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
