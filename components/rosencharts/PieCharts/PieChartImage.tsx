// @ts-nocheck
import React from "react";
import { pie, arc, PieArcDatum } from "d3";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import Image from "next/image";
import type { PieChartItem } from "../types";

export function PieChartImage({
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

  // Chart dimensions
  const radius = Math.PI * 100;
  const gap = 0.02; // Gap between slices

  // Pie layout and arc generator
  const pieLayout = pie<PieChartItem>()
    .sort(null)
    .value((d) => d.value)
    .padAngle(gap);

  const arcGenerator = arc<PieArcDatum<PieChartItem>>()
    .innerRadius(20)
    .outerRadius(radius)
    .cornerRadius(8);

  const arcs = pieLayout(data);

  // Calculate the angle for each slice
  const computeAngle = (d: PieArcDatum<PieChartItem>) => {
    return ((d.endAngle - d.startAngle) * 180) / Math.PI;
  };

  // Minimum angle to display text
  const MIN_ANGLE = 20;

  return (
    <svg
      viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
      className={`w-full h-full max-w-full max-h-full scale-95 ${className}`}
    >
      {/* Slices */}
      {arcs.map((d: PieArcDatum<PieChartItem>, i) => {
        const isHexColor =
          d.data.colorFrom &&
          /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(d.data.colorFrom);
        const angle = computeAngle(d);
        const [x, y] = arcGenerator.centroid(d);
        const scale = Math.min(1.2, angle / 45); // Increased base scale and adjusted angle divisor

        if (!withTooltip) {
          return (
            <g key={i}>
              <path
                fill={isHexColor ? d.data.colorFrom : "currentColor"}
                d={arcGenerator(d)!}
                className={
                  !isHexColor
                    ? `${
                        d.data.colorFrom ||
                        defaultColors[i % data.length].colorFrom
                      }`
                    : ""
                }
              />
              {angle >= MIN_ANGLE && d.data.logo && (
                <g transform={`translate(${x}, ${y})`}>
                  <foreignObject
                    x={-40 * scale}
                    y={-40 * scale}
                    width={80 * scale}
                    height={80 * scale}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Image
                        src={d.data.logo}
                        alt={d.data.name}
                        width={440}
                        height={440}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </foreignObject>
                </g>
              )}
              {angle >= MIN_ANGLE && (
                <text
                  x={x}
                  y={y + 50 * scale}
                  textAnchor="middle"
                  fontSize={20 * scale}
                  fill="white"
                  className="select-none font-medium"
                >
                  {d.data.value}
                  {suffix}
                </text>
              )}
            </g>
          );
        }

        return (
          <ClientTooltip key={i}>
            <TooltipTrigger>
              <g>
                <path
                  fill={isHexColor ? d.data.colorFrom : "currentColor"}
                  d={arcGenerator(d)!}
                  className={
                    !isHexColor
                      ? `${
                          d.data.colorFrom ||
                          defaultColors[i % data.length].colorFrom
                        }`
                      : ""
                  }
                />
                {angle >= MIN_ANGLE && d.data.logo && (
                  <g transform={`translate(${x}, ${y})`}>
                    <foreignObject
                      x={-40 * scale}
                      y={-40 * scale}
                      width={80 * scale}
                      height={80 * scale}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          src={d.data.logo}
                          alt={d.data.name}
                          width={440}
                          height={440}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </foreignObject>
                  </g>
                )}
                {angle >= MIN_ANGLE && (
                  <text
                    x={x}
                    y={y + 50 * scale}
                    textAnchor="middle"
                    fontSize={20 * scale}
                    fill="white"
                    className="select-none font-medium"
                  >
                    {d.data.value}
                    {suffix}
                  </text>
                )}
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
    </svg>
  );
}
