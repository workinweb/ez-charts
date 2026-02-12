// @ts-nocheck

import type { ScatterChartItem } from "../types";
import { max, min, scaleLinear } from "d3";
import React, { CSSProperties } from "react";
import { AnimatedLine } from "../Animated/AnimatedLine";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";

export function ScatterChart({
  data,
  withTooltip = true,
  withAnimation = true,
  withInteractive = false,
  className,
}: {
  data: ScatterChartItem[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  withInteractive?: boolean;
  className?: string;
}) {
  const defaultColor = "text-violet-400";

  const xScale = scaleLinear()
    .domain([data[0].xValue, data[data.length - 1].xValue])
    .range([0, 100]);
  const yScale = scaleLinear()
    .domain([
      (min(data.map((d) => d.yValue)) ?? 0) - 1,
      (max(data.map((d) => d.yValue)) ?? 0) + 1,
    ])
    .range([100, 0]);

  return (
    <div
      className={`relative h-72 w-full ${className || ""}`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "0px",
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
          .ticks(3)
          .map(yScale.tickFormat(3, "d"))
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
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Horizontal grid lines */}
          {yScale
            .ticks(8)
            .map(yScale.tickFormat(8, "d"))
            .map((active, i) => (
              <g
                transform={`translate(0,${yScale(+active)})`}
                className="text-zinc-500/20 dark:text-zinc-700/50"
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

          {/* Vertical grid lines */}
          {xScale.ticks(8).map((active, i) => (
            <g
              transform={`translate(${xScale(active)},0)`}
              className="text-zinc-500/20 dark:text-zinc-700/50"
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

          {/* Circles and Tooltips */}
          {data.map((d, index) => {
            if (!withTooltip) {
              return (
                <AnimatedLine key={index} withAnimation={withAnimation}>
                  <path
                    d={`M ${xScale(d.xValue)} ${yScale(d.yValue)} l 0.0001 0`}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    stroke="currentColor"
                    className={`${
                      d.color || defaultColor
                    } group-hover/tooltip:stroke-[20px] transition-all duration-300`}
                    style={{
                      color: d.color || "",
                    }}
                  />
                </AnimatedLine>
              );
            }

            return (
              <ClientTooltip key={index}>
                <TooltipTrigger>
                  <g className="group/tooltip">
                    <AnimatedLine withAnimation={withAnimation}>
                      <path
                        d={`M ${xScale(d.xValue)} ${yScale(
                          d.yValue,
                        )} l 0.0001 0`}
                        vectorEffect="non-scaling-stroke"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                        stroke="currentColor"
                        className={`${
                          d.color || defaultColor
                        } group-hover/tooltip:stroke-[20px] transition-all duration-300`}
                        style={{
                          color: d.color || "",
                        }}
                      />
                    </AnimatedLine>
                    {!withInteractive && (
                      <>
                        <line
                          x1={xScale(d.xValue)}
                          y1={0}
                          x2={xScale(d.xValue)}
                          y2={100}
                          stroke="currentColor"
                          strokeWidth={1}
                          className="opacity-0 group-hover/tooltip:opacity-100 text-zinc-300 dark:text-zinc-700 transition-opacity"
                          vectorEffect="non-scaling-stroke"
                          style={{ pointerEvents: "none" }}
                        />
                        <rect
                          x={(() => {
                            const prevX =
                              index > 0
                                ? xScale(data[index - 1].xValue)
                                : xScale(d.xValue);
                            return (prevX + xScale(d.xValue)) / 2;
                          })()}
                          y={0}
                          width={(() => {
                            const prevX =
                              index > 0
                                ? xScale(data[index - 1].xValue)
                                : xScale(d.xValue);
                            const nextX =
                              index < data.length - 1
                                ? xScale(data[index + 1].xValue)
                                : xScale(d.xValue);
                            const leftBound = (prevX + xScale(d.xValue)) / 2;
                            const rightBound = (xScale(d.xValue) + nextX) / 2;
                            return rightBound - leftBound;
                          })()}
                          height={100}
                          fill="transparent"
                        />
                      </>
                    )}
                  </g>
                </TooltipTrigger>
                <TooltipContent>
                  <div>{d.name}</div>
                  <div className="text-gray-500 text-sm">
                    {d.yValue} / {d.xValue}
                  </div>
                </TooltipContent>
              </ClientTooltip>
            );
          })}
        </svg>

        {/* X Axis */}
        <div className="translate-y-1">
          {data.map((d, i) => {
            const isFirst = i === 0;
            const isLast = i === data.length - 1;
            if (!isFirst && !isLast && i % 5 !== 0) return null;
            return (
              <div key={i} className="overflow-visible text-zinc-500">
                <div
                  style={{
                    left: `${xScale(d.xValue)}%`,
                    top: "100%",
                    transform: `translateX(${
                      i === 0 ? "0%" : i === data.length - 1 ? "-100%" : "-50%"
                    })`, // The first and last labels should be within the chart area
                  }}
                  className="text-xs absolute"
                >
                  {d.xValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
