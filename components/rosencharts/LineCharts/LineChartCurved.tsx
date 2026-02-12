import React from "react";
import {
  curveMonotoneX,
  line as d3_line,
  max,
  scaleLinear,
  scaleTime,
} from "d3";
import { CSSProperties } from "react";
import { AnimatedLine } from "../Animated/AnimatedLine";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import type { LineDataSeries } from "../types";

export function LineChartCurved({
  data,
  withTooltip = true,
  withAnimation = true,
  className,
}: {
  data?: LineDataSeries[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  className?: string;
}) {
  if (!data) {
    return null;
  }

  const processedSeries = data.map((s) => ({
    ...s,
    data: s.data.map((d) => ({ ...d, date: new Date(d.date) })),
  }));

  const allValues = processedSeries.flatMap((s) => s.data.map((d) => d.value));
  const allDates = processedSeries[0].data.map((d) => d.date);

  const xScale = scaleTime()
    .domain([allDates[0], allDates[allDates.length - 1]])
    .range([0, 100]);
  const yScale = scaleLinear()
    .domain([0, max(allValues) ?? 0])
    .range([100, 0]);

  const line = d3_line<{ date: Date; value: number }>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const paths = processedSeries.map((s) => {
    const pathString = String(line(s.data) || "");
    return {
      path: line(s.data),
      color: s.color,
      lineLength: pathString.length / 100,
    };
  });

  if (paths.some((p) => !p.path)) {
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

          {/* Lines */}
          {paths.map((p, i) => (
            <AnimatedLine
              key={i}
              withAnimation={withAnimation}
              lineLength={p.lineLength}
            >
              <path
                key={i}
                d={p.path!}
                fill="none"
                className={
                  typeof p.color === "object"
                    ? p.color.line
                    : "stroke-fuchsia-400"
                }
                style={{
                  stroke: typeof p.color === "string" ? p.color : undefined,
                }}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </AnimatedLine>
          ))}

          {/* Points and Tooltips */}
          {processedSeries[0].data.map((_, dateIndex) => {
            if (!withTooltip) {
              return (
                <g key={dateIndex}>
                  {processedSeries.map((d, seriesIndex) => (
                    <path
                      key={`${dateIndex}-${seriesIndex}`}
                      d={`M ${xScale(d.data[dateIndex].date)} ${yScale(
                        d.data[dateIndex].value,
                      )} l 0.0001 0`}
                      vectorEffect="non-scaling-stroke"
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="none"
                      stroke="currentColor"
                      className={
                        typeof d.color === "object"
                          ? d.color.point
                          : "text-fuchsia-300"
                      }
                      style={{
                        stroke:
                          typeof d.color === "string" ? d.color : undefined,
                      }}
                    />
                  ))}
                  <g className="group/tooltip">
                    <line
                      x1={xScale(processedSeries[0].data[dateIndex].date)}
                      y1={0}
                      x2={xScale(processedSeries[0].data[dateIndex].date)}
                      y2={100}
                      stroke="currentColor"
                      strokeWidth={1}
                      className="opacity-0 group-hover/tooltip:opacity-100 text-zinc-300 dark:text-zinc-700 transition-opacity"
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: "none" }}
                    />
                    <rect
                      x={(() => {
                        const data = processedSeries[0].data;
                        const prevX =
                          dateIndex > 0
                            ? xScale(data[dateIndex - 1].date)
                            : xScale(data[dateIndex].date);
                        return (prevX + xScale(data[dateIndex].date)) / 2;
                      })()}
                      y={0}
                      width={(() => {
                        const data = processedSeries[0].data;
                        const prevX =
                          dateIndex > 0
                            ? xScale(data[dateIndex - 1].date)
                            : xScale(data[dateIndex].date);
                        const nextX =
                          dateIndex < data.length - 1
                            ? xScale(data[dateIndex + 1].date)
                            : xScale(data[dateIndex].date);
                        const leftBound =
                          (prevX + xScale(data[dateIndex].date)) / 2;
                        const rightBound =
                          (xScale(data[dateIndex].date) + nextX) / 2;
                        return rightBound - leftBound;
                      })()}
                      height={100}
                      fill="transparent"
                    />
                  </g>
                </g>
              );
            }

            return (
              <ClientTooltip key={dateIndex}>
                <TooltipTrigger>
                  {processedSeries.map((d, seriesIndex) => (
                    <path
                      key={`${dateIndex}-${seriesIndex}`}
                      d={`M ${xScale(d.data[dateIndex].date)} ${yScale(
                        d.data[dateIndex].value,
                      )} l 0.0001 0`}
                      vectorEffect="non-scaling-stroke"
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="none"
                      stroke="currentColor"
                      className={
                        typeof d.color === "object"
                          ? d.color.point
                          : "text-fuchsia-300"
                      }
                      style={{
                        stroke:
                          typeof d.color === "object" ? d.color.line : d.color,
                      }}
                    />
                  ))}
                  <g className="group/tooltip">
                    <line
                      x1={xScale(processedSeries[0].data[dateIndex].date)}
                      y1={0}
                      x2={xScale(processedSeries[0].data[dateIndex].date)}
                      y2={100}
                      stroke="currentColor"
                      strokeWidth={1}
                      className="opacity-0 group-hover/tooltip:opacity-100 text-zinc-300 dark:text-zinc-700 transition-opacity"
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: "none" }}
                    />
                    <rect
                      x={(() => {
                        const data = processedSeries[0].data;
                        const prevX =
                          dateIndex > 0
                            ? xScale(data[dateIndex - 1].date)
                            : xScale(data[dateIndex].date);
                        return (prevX + xScale(data[dateIndex].date)) / 2;
                      })()}
                      y={0}
                      width={(() => {
                        const data = processedSeries[0].data;
                        const prevX =
                          dateIndex > 0
                            ? xScale(data[dateIndex - 1].date)
                            : xScale(data[dateIndex].date);
                        const nextX =
                          dateIndex < data.length - 1
                            ? xScale(data[dateIndex + 1].date)
                            : xScale(data[dateIndex].date);
                        const leftBound =
                          (prevX + xScale(data[dateIndex].date)) / 2;
                        const rightBound =
                          (xScale(data[dateIndex].date) + nextX) / 2;
                        return rightBound - leftBound;
                      })()}
                      height={100}
                      fill="transparent"
                    />
                  </g>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    {processedSeries[0].data[dateIndex].date.toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "2-digit",
                      },
                    )}
                  </div>
                  {processedSeries.map((d, i) => (
                    <div key={i} className="text-gray-500 text-sm">
                      {d.data[dateIndex].value.toLocaleString("en-US")}
                    </div>
                  ))}
                </TooltipContent>
              </ClientTooltip>
            );
          })}
        </svg>

        <div className="translate-y-2">
          {/* X Axis */}
          {processedSeries[0].data.map((day, i) => {
            const isFirst = i === 0;
            const isLast = i === processedSeries[0].data.length - 1;
            const isMax =
              day.value ===
              Math.max(...processedSeries[0].data.map((d) => d.value));
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
                        : i === processedSeries[0].data.length - 1
                          ? "-100%"
                          : "-50%"
                    })`,
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
