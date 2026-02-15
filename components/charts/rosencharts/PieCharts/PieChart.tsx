// @ts-nocheck
import React from "react";
import { arc, pie, PieArcDatum } from "d3";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import type { PieChartItem } from "../types";

export function PieChart({
  data,
  withTooltip = true,
  className,
  suffix = "",
}: {
  data: PieChartItem[];
  withTooltip?: boolean;
  className?: string;
  suffix?: string;
}) {
  if (!data) {
    return null;
  }

  const defaultColors = [
    {
      colorFrom: "text-pink-400",
      colorTo: "text-pink-400",
    },
    {
      colorFrom: "text-purple-400",
      colorTo: "text-purple-400",
    },
    {
      colorFrom: "text-indigo-400",
      colorTo: "text-indigo-400",
    },
    {
      colorFrom: "text-sky-400",
      colorTo: "text-sky-400",
    },
    {
      colorFrom: "text-lime-400",
      colorTo: "text-lime-400",
    },
    {
      colorFrom: "text-amber-400",
      colorTo: "text-amber-400",
    },
  ];

  // Chart dimensions - using more contained dimensions
  const radius = 50; // Reduced from 100
  const gap = 0.02; // Gap between slices

  // Pie layout and arc generator
  const pieLayout = pie<PieChartItem>()
    .sort(null)
    .value((d) => d.value)
    .padAngle(gap); // Creates a gap between slices

  const arcGenerator = arc<PieArcDatum<PieChartItem>>()
    .innerRadius(10) // Reduced from 20
    .outerRadius(radius)
    .cornerRadius(4); // Reduced from 8

  const arcs = pieLayout(data);

  // Calculate the angle for each slice
  const computeAngle = (d: PieArcDatum<PieChartItem>) => {
    return ((d.endAngle - d.startAngle) * 180) / Math.PI;
  };

  // Minimum angle to display text
  const MIN_ANGLE = 20;

  // Function to determine optimal label position based on slice size
  const getLabelPosition = (d: PieArcDatum<PieChartItem>) => {
    const angle = computeAngle(d);
    // For larger slices, position more outward, for smaller slices, position more inward
    const positionRadius = angle > 45 ? radius * 0.7 : radius * 0.6;
    const labelArc = arc<PieArcDatum<PieChartItem>>()
      .innerRadius(positionRadius)
      .outerRadius(positionRadius);
    return labelArc.centroid(d);
  };

  return (
    <div
      className={`relative w-full h-72 min-h-[200px] max-h-[320px] ${className}`}
    >
      <svg
        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className="h-full w-full max-h-full max-w-full scale-95"
        preserveAspectRatio="xMidYMid meet"
      >
      {/* Slices */}
      {arcs.map((d, i) => {
        const midAngle = (d.startAngle + d.endAngle) / 2;
        const isHexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(
          d.data.colorFrom,
        );

        if (!withTooltip) {
          return (
            <g key={i}>
              <path fill={`url(#pieColors-${i})`} d={arcGenerator(d)!} />
              <linearGradient
                id={`pieColors-${i}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
                gradientTransform={`rotate(${
                  (midAngle * 180) / Math.PI - 90
                }, 0.5, 0.5)`}
              >
                {isHexColor ? (
                  <>
                    <stop offset="0%" stopColor={d.data.colorFrom} />
                    <stop
                      offset="100%"
                      stopColor={d.data.colorTo || d.data.colorFrom}
                    />
                  </>
                ) : (
                  <>
                    <stop
                      offset="0%"
                      stopColor="currentColor"
                      className={
                        d.data.colorFrom ||
                        defaultColors[i % defaultColors.length].colorFrom
                      }
                    />
                    <stop
                      offset="100%"
                      stopColor="currentColor"
                      className={
                        d.data.colorTo ||
                        defaultColors[i % defaultColors.length].colorTo
                      }
                    />
                  </>
                )}
              </linearGradient>
            </g>
          );
        }

        return (
          <ClientTooltip key={i}>
            <TooltipTrigger>
              <g key={i}>
                <path fill={`url(#pieColors-${i})`} d={arcGenerator(d)!} />
                <linearGradient
                  id={`pieColors-${i}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                  gradientTransform={`rotate(${
                    (midAngle * 180) / Math.PI - 90
                  }, 0.5, 0.5)`}
                >
                  {isHexColor ? (
                    <>
                      <stop offset="0%" stopColor={d.data.colorFrom} />
                      <stop
                        offset="100%"
                        stopColor={d.data.colorTo || d.data.colorFrom}
                      />
                    </>
                  ) : (
                    <>
                      <stop
                        offset="0%"
                        stopColor="currentColor"
                        className={
                          d.data.colorFrom ||
                          defaultColors[i % defaultColors.length].colorFrom
                        }
                      />
                      <stop
                        offset="100%"
                        stopColor="currentColor"
                        className={
                          d.data.colorTo ||
                          defaultColors[i % defaultColors.length].colorTo
                        }
                      />
                    </>
                  )}
                </linearGradient>
              </g>
            </TooltipTrigger>

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

      {/* SVG Text Labels */}
      {arcs.map((d, i) => {
        const angle = computeAngle(d);
        if (angle <= MIN_ANGLE) return null;

        // Get the centroid of the arc for label positioning using the new function
        const [x, y] = getLabelPosition(d);

        // Calculate font size based on the angle of the slice
        // Larger slices get larger text, smaller slices get smaller text
        const fontSize = Math.min(5, Math.max(3.5, angle / 15));

        // Calculate the midpoint between inner and outer radius for better centering
        const midAngle = (d.startAngle + d.endAngle) / 2;
        const xAdjust = Math.cos(midAngle) * 2; // Small adjustment to center text better
        const yAdjust = Math.sin(midAngle) * 2;

        return (
          <g key={i} className="pointer-events-none">
            <text
              x={x + xAdjust}
              y={y + yAdjust - fontSize * 0.6}
              textAnchor="middle"
              fontSize={fontSize}
              fill="white"
              fontWeight="500"
              className="select-none"
            >
              {d.data.name}
            </text>
            <text
              x={x + xAdjust}
              y={y + yAdjust + fontSize * 0.6}
              textAnchor="middle"
              fontSize={fontSize}
              fill="white"
              className="select-none"
            >
              {d.data.value}
              {suffix}
            </text>
          </g>
        );
      })}
    </svg>
    </div>
  );
}
