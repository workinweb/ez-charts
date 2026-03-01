"use client";

import React, { CSSProperties } from "react";
import { motion } from "motion/react";
import type { BenchmarkChartItem } from "../types";
import {
  ClientTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../Tooltip/Tooltip";

const defaultGradients = [
  "from-pink-300 to-pink-400 dark:from-pink-500 dark:to-pink-700",
  "from-purple-400 to-purple-500 dark:from-purple-500 dark:to-purple-700",
  "from-indigo-400 to-indigo-500 dark:from-indigo-500 dark:to-indigo-700",
  "from-sky-400 to-sky-500 dark:from-sky-500 dark:to-sky-700",
  "from-orange-300 to-orange-400 dark:from-amber-500 dark:to-amber-700",
];

function gradientFromHexVertical(hexColor: string): { background: string } {
  const hex = hexColor.startsWith("#") ? hexColor.substring(1) : hexColor;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const lighterR = Math.floor(r + (255 - r) * 0.25);
  const lighterG = Math.floor(g + (255 - g) * 0.25);
  const lighterB = Math.floor(b + (255 - b) * 0.25);
  const lighterHex =
    lighterR.toString(16).padStart(2, "0") +
    lighterG.toString(16).padStart(2, "0") +
    lighterB.toString(16).padStart(2, "0");
  return {
    background: `linear-gradient(to bottom, #${lighterHex}, #${hex})`,
  };
}

export function FunnelChart({
  data,
  className,
  withTooltip = true,
  withAnimation = true,
}: {
  data: (BenchmarkChartItem & { color?: string })[];
  className?: string;
  withTooltip?: boolean;
  withAnimation?: boolean;
}) {
  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const gap = 8;
  const barHeight = 54;
  const maxValue = Math.max(...sorted.map((d) => d.value));
  let cumulativeHeight = 0;

  return (
    <div
      className={`relative mt-4 w-full ${className ?? ""}`}
      style={
        {
          "--marginTop": "8px",
          "--marginRight": "0px",
          "--marginBottom": "0px",
          "--marginLeft": "0px",
          "--height": `${barHeight * sorted.length + gap * (sorted.length - 1)}px`,
        } as CSSProperties
      }
    >
      {sorted.map((d, index) => {
        const barWidth = (d.value / maxValue) * 100;
        const yPosition = cumulativeHeight;
        cumulativeHeight += barHeight + gap;

        const hasGradient =
          d.colorFrom && d.colorTo && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(d.colorFrom) && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(d.colorTo);
        const hasHexColor = (c: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(c);
        const gradientStyle = hasGradient
          ? { background: `linear-gradient(to bottom, ${d.colorFrom}, ${d.colorTo})` }
          : d.colorFrom && hasHexColor(d.colorFrom)
            ? gradientFromHexVertical(d.colorFrom)
            : (d as { color?: string }).color && hasHexColor((d as { color?: string }).color!)
              ? gradientFromHexVertical((d as { color?: string }).color!)
              : undefined;

        const barContent = withAnimation ? (
          <motion.div
            key={index}
            className="relative rounded-md"
            style={{
              position: "absolute",
              top: `${yPosition}px`,
              left: `${(100 - barWidth) / 2}%`,
              width: `${barWidth}%`,
              height: `${barHeight}px`,
              transformOrigin: "top",
              ...gradientStyle,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
              delay: index * 0.06,
            }}
          >
            <div
              className={`size-full rounded-md ${
                !gradientStyle ? `bg-gradient-to-b ${defaultGradients[index % defaultGradients.length]}` : ""
              }`}
              style={gradientStyle}
            >
              <div
                style={{
                  position: "absolute",
                  top: `${barHeight / 6}px`,
                  width: "100%",
                  textAlign: "center",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {d.key}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: `${barHeight / 2}px`,
                  width: "100%",
                  textAlign: "center",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                {d.value}
              </div>
            </div>
          </motion.div>
        ) : (
          <div
            key={index}
            className={`relative rounded-md ${
              !gradientStyle ? `bg-gradient-to-b ${defaultGradients[index % defaultGradients.length]}` : ""
            }`}
            style={{
              position: "absolute",
              top: `${yPosition}px`,
              left: `${(100 - barWidth) / 2}%`,
              width: `${barWidth}%`,
              height: `${barHeight}px`,
              ...gradientStyle,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: `${barHeight / 6}px`,
                width: "100%",
                textAlign: "center",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {d.key}
            </div>
            <div
              style={{
                position: "absolute",
                top: `${barHeight / 2}px`,
                width: "100%",
                textAlign: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
                fontFamily: "monospace",
              }}
            >
              {d.value}
            </div>
          </div>
        );

        if (!withTooltip) return barContent;

        return (
          <ClientTooltip key={index}>
            <TooltipTrigger>{barContent}</TooltipTrigger>
            <TooltipContent>
              <div className="font-medium">{d.key}</div>
              <div className="text-gray-500 text-sm">{d.value}</div>
            </TooltipContent>
          </ClientTooltip>
        );
      })}
    </div>
  );
}
