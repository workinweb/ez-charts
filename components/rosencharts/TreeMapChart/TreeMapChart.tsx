// @ts-nocheck
import type { TreeMapChartItem } from "../types";
import * as d3 from "d3";
import React, { useMemo } from "react";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";

interface TreeMapNodeData {
  name: string;
  value?: number;
  children?: TreeMapNodeData[];
}

interface TreeMapNode extends d3.HierarchyNode<TreeMapNodeData> {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface TreeMapChartProps {
  data: TreeMapChartItem[];
  className?: string;
  withTooltip?: boolean;
  withAnimation?: boolean;
}

const defaultColors = [
  "bg-violet-500 dark:bg-violet-500",
  "bg-pink-400 dark:bg-pink-400",
  "bg-orange-400 dark:bg-orange-400",
  "bg-blue-400 dark:bg-blue-400",
  "bg-green-400 dark:bg-green-400",
  "bg-gradient-to-b from-purple-400 to-purple-500 text-white dark:from-purple-500 dark:to-purple-700 dark:text-purple-100",
  "bg-gradient-to-b from-pink-300 to-pink-400 text-white dark:from-pink-500 dark:to-pink-600 dark:text-pink-100",
  "bg-gradient-to-b from-orange-300 to-orange-400 text-white dark:from-amber-500 dark:to-amber-600 dark:text-amber-100",
];

export function TreeMapChart({
  data,
  className,
  withTooltip = true,
  withAnimation = false,
}: TreeMapChartProps) {
  // Transform the raw data into a hierarchical structure
  const hierarchicalData = useMemo(
    () => ({
      name: "root",
      children: data.map((topic) => ({
        name: topic.name,
        children: Object.entries(topic.subtopics[0]).map(([name, value]) => ({
          name,
          value,
        })),
      })),
    }),
    [data],
  );

  // Create root node
  const root = useMemo(() => {
    const hierarchy = d3
      .hierarchy(hierarchicalData)
      .sum((d) => (d as TreeMapNodeData).value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    // Apply treemap layout
    d3
      .treemap()
      .size([100, 100])
      .paddingInner(0.75)
      .paddingOuter(1)
      .round(false)(hierarchy as unknown as d3.HierarchyNode<unknown>);

    return hierarchy as unknown as TreeMapNode;
  }, [hierarchicalData]);

  // Color scale
  const color = useMemo(
    () =>
      d3
        .scaleOrdinal()
        .domain(data.map((d) => d.name))
        .range(defaultColors),
    [data],
  );

  return (
    <div className={`relative w-full h-72 ${className}`}>
      {root.leaves().map((leaf: TreeMapNode, i) => {
        const leafWidth = leaf.x1 - leaf.x0;
        const leafHeight = leaf.y1 - leaf.y0;
        const VISIBLE_TEXT_WIDTH = 15;
        const VISIBLE_TEXT_HEIGHT = 15;
        const parentName = leaf.parent?.data.name ?? "";
        const parentData = data.find((d) => d.name === parentName);

        const content = (
          <div
            key={i}
            className={`${
              parentData?.colorFrom && parentData?.colorTo
                ? ""
                : color(parentName)
            } ${
              withAnimation ? "transition-all duration-500 ease-in-out" : ""
            }`}
            style={{
              position: "absolute",
              left: `${leaf.x0}%`,
              top: `${leaf.y0}%`,
              width: `${leafWidth}%`,
              height: `${leafHeight}%`,
              borderRadius: "6px",
              border: "1px solid #ffffff44",
              color: "white",
              padding: "6px",
              boxSizing: "border-box",
              ...(parentData?.colorFrom && parentData?.colorTo
                ? {
                    background: `linear-gradient(to right, ${parentData.colorFrom}, ${parentData.colorTo})`,
                  }
                : {}),
            }}
          >
            {leafWidth > VISIBLE_TEXT_WIDTH &&
              leafHeight > VISIBLE_TEXT_HEIGHT && (
                <div className="text-base leading-5 truncate">
                  {leaf.data.name}
                </div>
              )}
            {leafWidth > VISIBLE_TEXT_WIDTH &&
              leafHeight > VISIBLE_TEXT_HEIGHT && (
                <div className="text-gray-100 text-sm leading-5">
                  {leaf.value}
                </div>
              )}
          </div>
        );

        if (!withTooltip) {
          return content;
        }

        return (
          <ClientTooltip key={i}>
            <TooltipTrigger>{content}</TooltipTrigger>
            <TooltipContent>
              <div>{leaf.data.name}</div>
              <div className="text-gray-500 text-sm">{leaf.value}</div>
            </TooltipContent>
          </ClientTooltip>
        );
      })}
    </div>
  );
}
