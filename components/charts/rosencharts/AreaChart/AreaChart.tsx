"use client";

import {
  area as d3area,
  curveMonotoneX,
  line as d3line,
  max,
  scaleLinear,
  scaleTime,
} from "d3";
import { motion } from "motion/react";
import React, { CSSProperties, useId } from "react";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import type { LineDataSeries } from "../types";

export type AreaFillStyle = "gradient" | "full" | "outline";

export type AreaColorSettings = {
  /** Full style: single fill color (hex) */
  areaColor?: string;
  /** Gradient style: top stop (hex) */
  areaGradientTop?: string;
  /** Gradient style: bottom stop (hex) */
  areaGradientBottom?: string;
  /** Outline style: line + fade color (hex). Fill fades from 20% to 5% opacity. */
  areaOutlineColor?: string;
};

export function AreaChart({
  data,
  withTooltip = true,
  withAnimation = true,
  fillStyle = "gradient",
  colors,
  className,
}: {
  data?: LineDataSeries[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  fillStyle?: AreaFillStyle;
  colors?: AreaColorSettings;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");

  if (!data || data.length === 0) return null;

  const series = data[0];
  const processed = series.data.map((d) => ({
    ...d,
    date: new Date(d.date),
  }));

  const allValues = processed.map((d) => d.value);
  const xScale = scaleTime()
    .domain([processed[0].date, processed[processed.length - 1].date])
    .range([0, 100]);
  const yScale = scaleLinear()
    .domain([0, max(allValues) ?? 0])
    .range([100, 0]);

  const line = d3line<{ date: Date; value: number }>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const area = d3area<{ date: Date; value: number }>()
    .x((d) => xScale(d.date))
    .y0(yScale(0))
    .y1((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const areaPath = area(processed) ?? undefined;
  const linePath = line(processed);

  if (!linePath) return null;

  const gradientId = `areaGradient-${uid}`;
  const outlineGradientId = `areaOutlineGradient-${uid}`;

  const areaFill =
    fillStyle === "gradient"
      ? `url(#${gradientId})`
      : fillStyle === "outline"
        ? `url(#${outlineGradientId})`
        : undefined;

  const gradientTop = colors?.areaGradientTop ?? "#84cc16";
  const gradientBottom = colors?.areaGradientBottom ?? "#14532d";
  const outlineColor = colors?.areaOutlineColor ?? "#eab308";
  const fullColor = colors?.areaColor ?? "#c084fc";

  const hexToRgba = (hex: string, alpha: number) => {
    const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    if (!m) return hex;
    const r = parseInt(m[1], 16);
    const g = parseInt(m[2], 16);
    const b = parseInt(m[3], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };
  const outlineTop = hexToRgba(outlineColor, 0.2);
  const outlineBottom = hexToRgba(outlineColor, 0.05);

  const areaClassName =
    fillStyle === "gradient"
      ? "text-lime-500 dark:text-lime-100"
      : fillStyle === "full"
        ? "text-purple-200 dark:text-purple-400"
        : "text-yellow-500/20 dark:text-yellow-500/20";

  const lineStroke =
    fillStyle === "outline" ? outlineColor : undefined;
  const lineClassName =
    fillStyle === "gradient"
      ? "text-gray-50 dark:text-zinc-800"
      : fillStyle === "full"
        ? "text-gray-50 dark:text-zinc-800"
        : undefined;

  const chartContent = (
    <div
      className={`relative h-72 w-full ${className ?? ""}`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "10px",
          "--marginBottom": "15px",
          "--marginLeft": "0px",
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible"
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={gradientTop} />
              <stop offset="90%" stopColor={gradientBottom} />
            </linearGradient>
            <linearGradient id={outlineGradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={outlineTop} />
              <stop offset="100%" stopColor={outlineBottom} />
            </linearGradient>
          </defs>

          {withAnimation ? (
            <motion.g
              initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <path
                d={areaPath}
                fill={areaFill ?? fullColor}
                className={fillStyle === "full" && !colors?.areaColor ? areaClassName : undefined}
              />
            </motion.g>
          ) : (
            <path
              d={areaPath}
              fill={areaFill ?? fullColor}
              className={fillStyle === "full" && !colors?.areaColor ? areaClassName : undefined}
            />
          )}

          <path
            d={linePath}
            fill="none"
            className={lineStroke ? undefined : lineClassName}
            stroke={lineStroke ?? "currentColor"}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />

          {withTooltip &&
            processed.map((d, index) => (
              <ClientTooltip key={index}>
                <TooltipTrigger>
                  <g className="group/tooltip">
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
                    <rect
                      x={
                        index > 0
                          ? (xScale(processed[index - 1].date) + xScale(d.date)) / 2
                          : xScale(d.date)
                      }
                      y={0}
                      width={
                        (() => {
                          const prevX =
                            index > 0 ? xScale(processed[index - 1].date) : xScale(d.date);
                          const nextX =
                            index < processed.length - 1
                              ? xScale(processed[index + 1].date)
                              : xScale(d.date);
                          const leftBound = (prevX + xScale(d.date)) / 2;
                          const rightBound = (xScale(d.date) + nextX) / 2;
                          return rightBound - leftBound;
                        })()
                      }
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
                  <div className="text-sm text-gray-500">
                    {d.value.toLocaleString("en-US")}
                  </div>
                </TooltipContent>
              </ClientTooltip>
            ))}
        </svg>

        <div className="translate-y-1">
          {processed.map((day, i) => {
            const isFirst = i === 0;
            const isLast = i === processed.length - 1;
            const isMax = day.value === Math.max(...allValues);
            if (!isFirst && !isLast && !isMax) return null;
            return (
              <div key={i} className="overflow-visible text-zinc-500">
                <div
                  style={{
                    left: `${xScale(day.date)}%`,
                    top: "100%",
                    transform: `translateX(${i === 0 ? "0%" : i === processed.length - 1 ? "-100%" : "-50%"})`,
                  }}
                  className="absolute whitespace-nowrap text-xs"
                >
                  {day.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute right-0 top-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[var(--marginRight)] translate-y-[var(--marginTop)] overflow-visible">
        {yScale
          .ticks(8)
          .map(yScale.tickFormat(8, "d"))
          .map((value, i) => (
            <div
              key={i}
              style={{ top: `${yScale(+value)}%`, left: "0%" }}
              className="absolute w-full pl-1 text-right text-xs text-gray-400 -translate-y-1/2"
            >
              {value}
            </div>
          ))}
      </div>
    </div>
  );

  return chartContent;
}
