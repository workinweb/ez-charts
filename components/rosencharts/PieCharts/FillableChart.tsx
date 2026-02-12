// @ts-nocheck
"use client";
import React from "react";
import { pie, arc, PieArcDatum } from "d3";
import type { PieChartItem } from "../types";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import { useState } from "react";

export function FillableChart({
  data,
  className,
  suffix,
  withTooltip = true,
}: {
  data: PieChartItem[];
  className?: string;
  suffix?: string;
  withTooltip?: boolean;
}) {
  const [selectedSlice, setSelectedSlice] = useState<PieChartItem>(data[0]);

  if (!data) {
    return null;
  }

  const defaultColors = [
    "#7e4cfe",
    "#e0e0e0",
    "#956bff",
    "#a37fff",
    "#b291fd",
    "#b597ff",
  ];

  const radius = 420; // Chart base dimensions
  const lightStrokeEffect = 10; // 3d light effect around the slice

  // Update the data order to fill clockwise

  // Modify the pie layout to create a half donut filling clockwise from left to right
  const pieLayout = pie<PieChartItem>()
    .value((d) => d.value)
    .startAngle(-Math.PI / 2) // Start at -90 degrees (9 o'clock)
    .endAngle(Math.PI / 2)
    .sort((a, b) => a.value - b.value)
    .padAngle(0.0);

  // Adjust innerRadius to create a donut shape
  const innerRadius = radius / 1.625;
  const arcGenerator = arc<PieArcDatum<PieChartItem>>()
    .innerRadius(innerRadius)
    .outerRadius(radius);

  // Create an arc generator for the clip path that matches the outer path of the arc
  const arcClip =
    arc<PieArcDatum<PieChartItem>>()
      .innerRadius(innerRadius + lightStrokeEffect / 2)
      .outerRadius(radius)
      .cornerRadius(lightStrokeEffect + 2) || undefined;

  const arcs = pieLayout(data);

  const handleSliceClick = (sliceData: PieChartItem) => {
    setSelectedSlice(sliceData);
  };

  return (
    <div className="relative">
      <svg
        viewBox={`-${radius} -${radius} ${radius * 2} ${radius}`}
        className={` overflow-visible ${className}`}
      >
        <defs>
          {arcs.map((d, i) => (
            <clipPath
              key={`fillable-half-donut-clip-${i}`}
              id={`fillable-half-donut-clip-${i}`}
            >
              <path d={arcClip(d) || undefined} />
            </clipPath>
          ))}
        </defs>
        <g>
          {/* Slices */}
          {arcs.map((d, i) => {
            const sliceContent = (
              <g
                key={i}
                clipPath={`url(#fillable-half-donut-clip-${i})`}
                onClick={() => handleSliceClick(d.data)}
                style={{ cursor: "pointer" }}
                className="hover:opacity-90" // Add hover
              >
                <path
                  className="stroke-white/30 dark:stroke-zinc-400/10"
                  strokeWidth={lightStrokeEffect}
                  d={arcGenerator(d) || undefined}
                  style={{
                    fill:
                      d.data.colorFrom && d.data.colorFrom.startsWith("#")
                        ? d.data.colorFrom
                        : defaultColors[i % defaultColors.length],
                  }}
                />
              </g>
            );

            if (!withTooltip) {
              return sliceContent;
            }

            return (
              <ClientTooltip key={i}>
                <TooltipTrigger>{sliceContent}</TooltipTrigger>
                <TooltipContent>
                  <div>{d.data.name}</div>
                  <div className="text-gray-500 text-sm">
                    {d.data.value.toLocaleString("en-US")}
                    {suffix}
                  </div>
                </TooltipContent>
              </ClientTooltip>
            );
          })}
        </g>
        <text
          transform={`translate(0, ${-radius / 4})`}
          textAnchor="middle"
          fontSize={48}
          fontWeight="bold"
          fill="currentColor"
          className="text-zinc-700 dark:text-zinc-100"
        >
          {selectedSlice.name}
        </text>{" "}
        <text
          transform={`translate(0, ${-radius / 12})`}
          textAnchor="middle"
          fontSize={64}
          fontWeight="bold"
          fill="currentColor"
          className="text-zinc-800 dark:text-zinc-300"
        >
          {selectedSlice.value.toLocaleString("en-US")}
          {suffix}
        </text>
      </svg>
    </div>
  );
}
