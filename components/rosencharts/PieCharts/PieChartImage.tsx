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

  // Chart dimensions — consistent with PieChart for equal sizing
  const radius = 50;
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
    <div
      className={`relative w-full h-72 min-h-[200px] max-h-[320px] ${className}`}
    >
      <svg
        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className="h-full w-full max-h-full max-w-full scale-95"
        preserveAspectRatio="xMidYMid meet"
      >
      {/* Slices */}
      {arcs.map((d: PieArcDatum<PieChartItem>, i) => {
        const isHexColor =
          d.data.colorFrom &&
          /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(d.data.colorFrom);
        const angle = computeAngle(d);
        const [x, y] = arcGenerator.centroid(d);
        // Image size scales with chart radius and slice portion (angle)
        const imageSize =
          radius * 0.4 * Math.min(1.2, Math.max(0.5, angle / 45));
        const textScale = Math.min(1.2, angle / 45);

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
                    x={-imageSize / 2}
                    y={-imageSize / 2}
                    width={imageSize}
                    height={imageSize}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <Image
                        src={d.data.logo}
                        alt={d.data.name}
                        width={Math.round(imageSize * 4)}
                        height={Math.round(imageSize * 4)}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </foreignObject>
                </g>
              )}
              {angle >= MIN_ANGLE && (
                <text
                  x={x}
                  y={y + imageSize / 2 + 3}
                  textAnchor="middle"
                  fontSize={Math.max(2.5, 4 * textScale)}
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
                      x={-imageSize / 2}
                      y={-imageSize / 2}
                      width={imageSize}
                      height={imageSize}
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <Image
                          src={d.data.logo}
                          alt={d.data.name}
                          width={Math.round(imageSize * 4)}
                          height={Math.round(imageSize * 4)}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </foreignObject>
                  </g>
                )}
                {angle >= MIN_ANGLE && (
                  <text
                    x={x}
                    y={y + imageSize / 2 + 3}
                    textAnchor="middle"
                    fontSize={Math.max(2.5, 4 * textScale)}
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
    </div>
  );
}
