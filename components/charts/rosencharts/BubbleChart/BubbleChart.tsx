"use client";

import * as d3 from "d3";
import { motion } from "motion/react";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";
import type { BubbleChartItem } from "../types";

const DEFAULT_COLORS = [
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
  "#84cc16", // lime-500
  "#0ea5e9", // sky-500
  "#f97316", // orange-500
];

export function BubbleChart({
  data,
  withTooltip = true,
  withAnimation = true,
  className,
}: {
  data: BubbleChartItem[];
  withTooltip?: boolean;
  withAnimation?: boolean;
  className?: string;
}) {
  if (!data || data.length === 0) return null;

  const colorScale = d3.scaleOrdinal<string>(DEFAULT_COLORS);
  const strokeSize = 1;
  const pack = d3
    .pack<{ children: BubbleChartItem[] }>()
    .size([1000, 1000])
    .padding(12);

  const hierarchyRoot = d3
    .hierarchy({ children: data })
    .sum((d: { value?: number; children?: BubbleChartItem[] }) =>
      "value" in d && typeof d.value === "number" ? d.value : 0,
    );
  const root = pack(hierarchyRoot);

  const nodes = root.leaves().map((d) => {
    const item = d.data as unknown as BubbleChartItem;
    const fill = item.color ?? colorScale(item.sector);
    return {
      x: d.x,
      y: d.y,
      r: d.r,
      fill,
      name: item.name,
      value: item.value,
      sector: item.sector,
    };
  });

  const bubbleEl = (node: (typeof nodes)[0], i: number) => {
    const bubbleStyle = {
      left: `${(node.x / 1000) * 100}%`,
      top: `${(node.y / 1000) * 100}%`,
      width: `${((node.r * 2) / 1000) * 100}%`,
      height: `${((node.r * 2) / 1000) * 100}%`,
      borderRadius: "50%" as const,
      backgroundColor: node.fill,
      border: `${strokeSize}px solid rgba(255,255,255,0.2)`,
    };

    if (withAnimation) {
      return (
        <motion.div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: bubbleStyle.left,
            top: bubbleStyle.top,
            width: bubbleStyle.width,
            height: bubbleStyle.height,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
            delay: i * 0.04,
          }}
        >
          <div
            className="h-full w-full rounded-full flex flex-col items-center justify-center cursor-default"
            style={{
              backgroundColor: node.fill,
              border: `${strokeSize}px solid rgba(255,255,255,0.2)`,
            }}
          >
            {node.value > 1000 && (
              <>
                <div
                  className="text-white text-center whitespace-nowrap font-medium"
                  style={{
                    fontSize: `${Math.max(8, node.r / 9)}px`,
                    lineHeight: `${Math.max(10, node.r / 7)}px`,
                  }}
                >
                  {node.name}
                </div>
                <div
                  className="text-white text-center whitespace-nowrap opacity-70"
                  style={{
                    fontSize: `${Math.max(7, node.r / 10)}px`,
                    lineHeight: `${Math.max(9, node.r / 8)}px`,
                  }}
                >
                  {d3.format(",d")(node.value)}
                </div>
              </>
            )}
          </div>
        </motion.div>
      );
    }

    return (
      <div
        key={i}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-default"
        style={bubbleStyle}
      >
        {node.value > 1000 && (
          <>
            <div
              className="text-white text-center whitespace-nowrap font-medium"
              style={{
                fontSize: `${Math.max(8, node.r / 9)}px`,
                lineHeight: `${Math.max(10, node.r / 7)}px`,
              }}
            >
              {node.name}
            </div>
            <div
              className="text-white text-center whitespace-nowrap opacity-70"
              style={{
                fontSize: `${Math.max(7, node.r / 10)}px`,
                lineHeight: `${Math.max(9, node.r / 8)}px`,
              }}
            >
              {d3.format(",d")(node.value)}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative w-full aspect-square max-w-[18rem] mx-auto min-h-[200px] ${className ?? ""}`}
    >
      {nodes.map((node, i) =>
        withTooltip ? (
          <ClientTooltip key={i}>
            <TooltipTrigger>{bubbleEl(node, i)}</TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-0.5">
                <div className="font-medium">{node.name}</div>
                <div className="text-gray-500 text-sm">{node.sector}</div>
                <div className="text-gray-600 text-sm">
                  {d3.format(",d")(node.value)}
                </div>
              </div>
            </TooltipContent>
          </ClientTooltip>
        ) : (
          bubbleEl(node, i)
        ),
      )}
    </div>
  );
}
