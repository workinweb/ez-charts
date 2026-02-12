import { max, scaleBand, scaleLinear } from "d3";
import Image from "next/image";
import React, { CSSProperties } from "react";
import { AnimatedBar } from "../Animated/AnimatedBar";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import { isValidUrl } from "../utils/utils";
import type { MultiBarData } from "../types";

const defaultBarColors = ["#F8ED53", "#E7E7F5", "#EEBA6B"];
const PX_BETWEEN_BARS = 0.2;

export function BarChartHorizontalMulti({
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
  // Scales
  const yScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 100]) // Represents the height of the chart
    .padding(0.25);

  const xScale = scaleLinear()
    .domain([0, max(data.flatMap((d) => d.values)) ?? 0])
    .range([0, 100]); // Represents the width of the chart

  const numBars = data[0].values.length; // Assuming all entries have the same number of bars
  return (
    <div
      className={`relative w-full h-72 ${className}`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "35px",
          "--marginBottom": "25px",
          "--marginLeft": `40px`,
        } as CSSProperties
      }
    >
      {/* X Axis (Images) */}
      <div
        className="absolute inset-0
         h-[calc(100%-var(--marginTop)-var(--marginBottom))]
         translate-y-[var(--marginTop)]
         overflow-visible"
      >
        {data.map((entry, i) => {
          if (!entry.image) return null;

          const isUrl =
            typeof entry.image === "string" ? isValidUrl(entry.image) : false;

          if (!isUrl) return null;

          return (
            <div
              key={i}
              style={{
                top: `${yScale(entry.key)! + yScale.bandwidth() / 2}%`,
                left: `0`,
              }}
              className="absolute rounded-full overflow-hidden size-7 text-sm text-gray-700 -translate-y-1/2 pointer-events-none"
            >
              <Image
                key={i}
                src={entry.image ?? ""}
                alt={`${entry.key} flag`}
                width={28}
                height={28}
                className="opacity-80 dark:opacity-100"
              />
            </div>
          );
        })}
      </div>

      {/* Chart Area */}
      <div
        className="absolute inset-0
          z-10
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        <div className="relative w-full h-full">
          <svg
            className="absolute h-full w-full z-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {xScale
              .ticks(8)
              .map(xScale.tickFormat(8, "d"))
              .map((active, i) => (
                <g
                  transform={`translate(${xScale(+active)},0)`}
                  className="text-gray-300/80 dark:text-gray-800/80"
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
          </svg>

          {/* Bars with Rounded Right Corners */}
          {data.map((d, index) => {
            if (!withTooltip) {
              return (
                <AnimatedBar
                  key={index}
                  index={index}
                  withAnimation={withAnimation}
                  className="absolute"
                  style={{
                    top: `${yScale(d.key)}%`,
                    width: `100%`,
                    height: `${yScale.bandwidth()}%`,
                  }}
                >
                  <div>
                    {d.values.map((value, barIndex) => {
                      const barHeight =
                        (100 - PX_BETWEEN_BARS * (numBars - 1)) / numBars;
                      const barYPosition =
                        barIndex * (barHeight + PX_BETWEEN_BARS);
                      const barColor =
                        d.multipleColors && d.multipleColors[barIndex]
                          ? d.multipleColors[barIndex]
                          : defaultBarColors[
                              barIndex % defaultBarColors.length
                            ];
                      return (
                        <div
                          key={barIndex}
                          className="absolute left-0 rounded-r"
                          style={{
                            top: `${barYPosition}%`,
                            width: `${xScale(value)}%`,
                            height: `${barHeight}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      );
                    })}
                  </div>
                </AnimatedBar>
              );
            }

            return (
              <ClientTooltip key={index}>
                <TooltipTrigger>
                  <AnimatedBar
                    key={index}
                    index={index}
                    withAnimation={withAnimation}
                    className="absolute"
                    style={{
                      top: `${yScale(d.key)}%`,
                      width: `100%`,
                      height: `${yScale.bandwidth()}%`,
                    }}
                  >
                    <div>
                      {d.values.map((value, barIndex) => {
                        const barHeight =
                          (100 - PX_BETWEEN_BARS * (numBars - 1)) / numBars;
                        const barYPosition =
                          barIndex * (barHeight + PX_BETWEEN_BARS);
                        const barColor =
                          d.multipleColors && d.multipleColors[barIndex]
                            ? d.multipleColors[barIndex]
                            : defaultBarColors[
                                barIndex % defaultBarColors.length
                              ];
                        return (
                          <div
                            key={barIndex}
                            className="absolute left-0 rounded-r"
                            style={{
                              top: `${barYPosition}%`,
                              width: `${xScale(value)}%`,
                              height: `${barHeight}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        );
                      })}
                    </div>
                  </AnimatedBar>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm text-gray-400">{d.key}</div>
                  <div className="flex gap-4">
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
                          ></div>
                          <div>{value}</div>
                        </div>
                      );
                    })}
                  </div>
                </TooltipContent>
              </ClientTooltip>
            );
          })}
        </div>
      </div>
      {/* X Axis (Labels) */}
      <div className="absolute inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] translate-y-[var(--marginTop)] left-[var(--marginLeft)] right-[var(--marginRight)] overflow-visible">
        {data.map((entry, i) => (
          <React.Fragment key={i}>
            {entry.values.map((value, barIndex) => {
              const barPosition = (barIndex + 0.5) / numBars;
              return (
                xScale(value) > 0 && (
                  <span
                    key={barIndex}
                    style={{
                      top: `${
                        yScale(entry.key)! + yScale.bandwidth() * barPosition
                      }%`,
                      left: `calc(${xScale(value)}% + 3px)`,
                    }}
                    className="absolute text-xs text-gray-400 font-medium pointer-events-none -translate-y-1/2"
                  >
                    {value}
                  </span>
                )
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
