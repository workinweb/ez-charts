// @ts-nocheck
import React from "react";
import {
  curveMonotoneX,
  line as d3_line,
  max,
  scaleLinear,
  scaleTime,
} from "d3";
import { CSSProperties } from "react";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip"; // Or wherever you pasted Tooltip.tsx
import { LineChartDataPoint } from "../types";
import { AnimatedLine } from "../Animated/AnimatedLine";

// DEPRECATED
export function LineChartCurvedDeprecated({
  data,
  withTooltip = true,
  withAnimation = true,
  className,
}: {
  data: LineChartDataPoint[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  className?: string;
}) {
  if (!data) {
    return null;
  }
  const lineChartData = data.map((d) => ({ ...d, date: new Date(d.date) }));

  const xScale = scaleTime()
    .domain([
      lineChartData[0].date,
      lineChartData[lineChartData.length - 1].date,
    ])
    .range([0, 100]);
  const yScale = scaleLinear()
    .domain([0, max(lineChartData.map((d) => d.value)) ?? 0])
    .range([100, 0]);

  const line = d3_line<(typeof lineChartData)[number]>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const d = line(lineChartData);
  const lineLength = d ? d.length / 100 : 1;

  if (!d) {
    return null;
  }

  return (
    <div
      className={`relative h-72 w-full ${className}`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "8px",
          "--marginBottom": "25px",
          "--marginLeft": "25px",
        } as CSSProperties
      }
    >
      {/* Y axis */}
      <div
        className="absolute inset-0
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
                left: "0%",
              }}
              className="absolute text-xs tabular-nums -translate-y-1/2 text-gray-500 w-full text-right pr-2"
            >
              {value}
            </div>
          ))}
      </div>

      {/* Chart area */}
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
                className="text-zinc-300 dark:text-zinc-700"
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
          {/* Line */}
          <AnimatedLine withAnimation={withAnimation} lineLength={lineLength}>
            <path
              d={d}
              fill="none"
              className="stroke-violet-400"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </AnimatedLine>

          {/* Circles and Tooltips */}
          {lineChartData.map((d, index) => {
            if (!withTooltip) {
              return (
                <>
                  {" "}
                  <path
                    key={index}
                    d={`M ${xScale(d.date)} ${yScale(d.value)} l 0.0001 0`}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="none"
                    stroke="currentColor"
                    className="text-violet-300"
                  />
                  <g className="group/tooltip">
                    {/* Tooltip Line */}
                    <line
                      x1={xScale(d.date)}
                      y1={0}
                      x2={xScale(d.date)}
                      y2={100}
                      stroke="currentColor"
                      strokeWidth={1}
                      className="opacity-0 group-hover/tooltip:opacity-100 text-zinc-300 dark:text-zinc-700 transition-opacity"
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: "none" }}
                    />
                    {/* Invisible area closest to a specific point for the tooltip trigger */}
                    <rect
                      x={(() => {
                        const prevX =
                          index > 0
                            ? xScale(lineChartData[index - 1].date)
                            : xScale(d.date);
                        return (prevX + xScale(d.date)) / 2;
                      })()}
                      y={0}
                      width={(() => {
                        const prevX =
                          index > 0
                            ? xScale(lineChartData[index - 1].date)
                            : xScale(d.date);
                        const nextX =
                          index < lineChartData.length - 1
                            ? xScale(lineChartData[index + 1].date)
                            : xScale(d.date);
                        const leftBound = (prevX + xScale(d.date)) / 2;
                        const rightBound = (xScale(d.date) + nextX) / 2;
                        return rightBound - leftBound;
                      })()}
                      height={100}
                      fill="transparent"
                    />
                  </g>
                </>
              );
            }

            return (
              <ClientTooltip key={index}>
                <TooltipTrigger>
                  <path
                    key={index}
                    d={`M ${xScale(d.date)} ${yScale(d.value)} l 0.0001 0`}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="none"
                    stroke="currentColor"
                    className="text-violet-300"
                  />
                  <g className="group/tooltip">
                    {/* Tooltip Line */}
                    <line
                      x1={xScale(d.date)}
                      y1={0}
                      x2={xScale(d.date)}
                      y2={100}
                      stroke="currentColor"
                      strokeWidth={1}
                      className="opacity-0 group-hover/tooltip:opacity-100 text-zinc-300 dark:text-zinc-700 transition-opacity"
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: "none" }}
                    />
                    {/* Invisible area closest to a specific point for the tooltip trigger */}
                    <rect
                      x={(() => {
                        const prevX =
                          index > 0
                            ? xScale(lineChartData[index - 1].date)
                            : xScale(d.date);
                        return (prevX + xScale(d.date)) / 2;
                      })()}
                      y={0}
                      width={(() => {
                        const prevX =
                          index > 0
                            ? xScale(lineChartData[index - 1].date)
                            : xScale(d.date);
                        const nextX =
                          index < lineChartData.length - 1
                            ? xScale(lineChartData[index + 1].date)
                            : xScale(d.date);
                        const leftBound = (prevX + xScale(d.date)) / 2;
                        const rightBound = (xScale(d.date) + nextX) / 2;
                        return rightBound - leftBound;
                      })()}
                      height={100}
                      fill="transparent"
                    />
                  </g>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    {d.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                    })}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {d.value.toLocaleString("en-US")}
                  </div>
                </TooltipContent>
              </ClientTooltip>
            );
          })}
        </svg>

        <div className="translate-y-2">
          {/* X Axis */}
          {lineChartData.map((day, i) => {
            const isFirst = i === 0;
            const isLast = i === lineChartData.length - 1;
            const isMax =
              day.value === Math.max(...lineChartData.map((d) => d.value));
            if (!isFirst && !isLast && !isMax) return null;
            return (
              <div key={i} className="overflow-visible text-zinc-500">
                <div
                  style={{
                    left: `${xScale(day.date)}%`,
                    top: "100%",
                    transform: `translateX(${
                      i === 0
                        ? "0%"
                        : i === lineChartData.length - 1
                          ? "-100%"
                          : "-50%"
                    })`, // The first and last labels should be within the chart area
                  }}
                  className="text-xs absolute"
                >
                  {day.date.toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
