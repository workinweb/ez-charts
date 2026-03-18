import { line as d3_line, max, scaleBand, scaleLinear } from "d3";
import React, { CSSProperties } from "react";
import { AnimatedLine } from "../Animated/AnimatedLine";
import { AnimatedVerticalBar } from "../Animated/AnimatedVerticalBar";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import type { BarLineChartData } from "../types";

const DEFAULT_BAR_COLOR = "#a78bfa";
const DEFAULT_LINE_COLOR = "#06b6d4";

export function BarLineChart({
  data,
  withTooltip = true,
  withAnimation = true,
  className,
  chartSettings,
}: {
  data: BarLineChartData[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  className?: string;
  chartSettings?: Record<string, unknown>;
}) {
  if (!data || data.length === 0) return null;

  const barValues = data.map((d) => d.barValue);
  const lineValues = data.map((d) => d.lineValue);
  const allValues = [...barValues, ...lineValues];
  const yMax = max(allValues) ?? 0;

  const xScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.3);

  const yScale = scaleLinear()
    .domain([0, yMax])
    .range([100, 0]);

  const lineData = data.map((d, i) => ({
    x: (xScale(d.key) ?? 0) + xScale.bandwidth() / 2,
    y: yScale(d.lineValue),
    key: d.key,
    lineValue: d.lineValue,
    barValue: d.barValue,
  }));

  const linePath = d3_line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y);

  const pathString = String(linePath(lineData.map((d) => ({ x: d.x, y: d.y }))) || "");
  const lineLength = pathString.length / 100;

  const lineColor =
    (chartSettings?.lineColor as string | undefined) ?? DEFAULT_LINE_COLOR;

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
        {/* Grid SVG */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          preserveAspectRatio="none"
        >
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
          const barHeight = yScale(0) - yScale(d.barValue);
          const barColor = d.barColor ?? DEFAULT_BAR_COLOR;

          const bar = (
            <AnimatedVerticalBar
              key={index}
              index={index}
              withAnimation={withAnimation}
              className="absolute bottom-0"
              style={{
                width: `${barWidth}%`,
                height: `${barHeight}%`,
                borderRadius: "6px 6px 0 0",
                marginLeft: `${xScale(d.key)}%`,
                backgroundColor: barColor,
              }}
            />
          );

          if (!withTooltip) {
            return bar;
          }

          return (
            <ClientTooltip key={index}>
              <TooltipTrigger>{bar}</TooltipTrigger>
              <TooltipContent>
                <div className="flex gap-2.5 items-center">
                  <div
                    className="w-1 h-8 rounded-full"
                    style={{ backgroundColor: barColor }}
                  />
                  <div>
                    <div>{d.key}</div>
                    <div className="text-gray-500 text-sm/5">
                      Bar: {d.barValue} · Line: {d.lineValue}
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </ClientTooltip>
          );
        })}

        {/* Line + points (over bars, z-10) */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full overflow-visible z-10"
          preserveAspectRatio="none"
        >
          <AnimatedLine withAnimation={withAnimation} lineLength={lineLength}>
            <path
              d={pathString}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </AnimatedLine>
          {lineData.map((d, index) => {
            const barColor = data[index]?.barColor ?? DEFAULT_BAR_COLOR;
            const point = (
              <path
                key={index}
                d={`M ${d.x} ${d.y} l 0.0001 0`}
                vectorEffect="non-scaling-stroke"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                stroke={lineColor}
              />
            );
            if (!withTooltip) {
              return <g key={index}>{point}</g>;
            }
            return (
              <ClientTooltip key={index}>
                <TooltipTrigger>{point}</TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{d.key}</div>
                    <div className="flex gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: barColor }}
                        />
                        Bar: {d.barValue}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: lineColor }}
                        />
                        Line: {d.lineValue}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </ClientTooltip>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
