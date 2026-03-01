"use client";

import { Paintbrush, RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import type { EditorProps } from "./editor-types";

/** Charts with no color editing in this editor */
const NON_COLOR_CHARTS = ["line", "treemap", "shadcnCartesian"];

/** Charts that use colorFrom + colorTo (gradient) */
const GRADIENT_CHART_TYPES = ["pie", "pie-image", "benchmark", "funnel"];

/** Pie-like charts that use single colorFrom (no gradient) */
const SINGLE_COLOR_FROM_CHART_TYPES = [
  "donut",
  "half-donut",
  "fillable",
  "fillable-donut",
];

/** Charts that use single `color` */
const SINGLE_COLOR_CHART_TYPES = [
  "horizontal-bar",
  "horizontal-bar-gradient",
  "horizontal-bar-thin",
  "vertical-bar",
  "breakdown",
  "breakdown-thin",
  "horizontal-bar-image",
  "scatter",
  "bubble",
];

export function StyleEditor({
  shape,
  chartType = "",
  data,
  onChange,
}: EditorProps) {
  const arr = Array.isArray(data) ? data : [];

  const updateRow = useCallback(
    (idx: number, patch: Record<string, unknown>) => {
      const next = [...arr];
      next[idx] = { ...next[idx], ...patch };
      onChange(next);
    },
    [arr, onChange],
  );

  const [gradientSync, setGradientSync] = useState(false);
  const isNonColor = NON_COLOR_CHARTS.includes(shape);
  const hasGradient = GRADIENT_CHART_TYPES.includes(chartType);
  const hasSingleColorFrom =
    shape === "pie" &&
    SINGLE_COLOR_FROM_CHART_TYPES.some((ct) => chartType.includes(ct));
  const hasSingleColor =
    SINGLE_COLOR_CHART_TYPES.includes(chartType) ||
    (shape === "keyValue" &&
      !chartType.includes("benchmark") &&
      !hasGradient) ||
    shape === "bar-image" ||
    shape === "scatter" ||
    shape === "bubble";
  const hasBarMulti = shape === "bar-multi";

  const goToDefaults = useCallback(() => {
    const colorKeys = ["color", "colorFrom", "colorTo", "multipleColors"];
    const next = arr.map((item: Record<string, unknown>) => {
      const out = { ...item };
      colorKeys.forEach((k) => delete out[k]);
      return out;
    });
    onChange(next);
  }, [arr, onChange]);

  if (isNonColor) {
    return (
      <div className="py-8 text-center">
        <Paintbrush className="mx-auto mb-2 size-8 text-[#3D4035]/15" />
        <p className="text-[13px] text-[#3D4035]/40">
          Color editing is not available for this chart type.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
          Colors
        </h3>
        <div className="flex items-center gap-2">
          {hasGradient && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D4035]/50">
                Mode
              </span>
              <div className="flex gap-0.5 rounded-lg bg-black/5 p-0.5">
                <button
                  type="button"
                  onClick={() => setGradientSync(true)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                    gradientSync
                      ? "bg-[#6C5DD3]/20 text-[#6C5DD3]"
                      : "text-[#3D4035]/50 hover:text-[#3D4035]/70",
                  )}
                >
                  Sync
                </button>
                <button
                  type="button"
                  onClick={() => setGradientSync(false)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                    !gradientSync
                      ? "bg-[#6C5DD3]/20 text-[#6C5DD3]"
                      : "text-[#3D4035]/50 hover:text-[#3D4035]/70",
                  )}
                >
                  Gradient
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={goToDefaults}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#3D4035]/60 transition hover:bg-black/[0.04] hover:text-[#3D4035]"
          >
            <RotateCcw className="size-3.5" />
            Go to Defaults
          </button>
        </div>
      </div>

      <div className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto pr-1 sm:max-h-[45vh] md:max-h-[50vh] lg:max-h-[56vh]">
        {arr.map((item: Record<string, unknown>, idx: number) => {
          const label =
            (item.key as string) ||
            (item.name as string) ||
            `#${idx + 1}`;

          return (
            <div
              key={idx}
              className="flex flex-wrap items-center gap-3 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]"
            >
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#3D4035]">
                {label}
              </span>

              {/* Single color (writes to `color`) */}
              {hasSingleColor && !hasGradient && !hasSingleColorFrom && (
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-[#3D4035]/40">
                    Color
                  </label>
                  <input
                    type="color"
                    value={(item.color as string) ?? "#6C5DD3"}
                    onChange={(e) => updateRow(idx, { color: e.target.value })}
                    className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                </div>
              )}

              {/* Single color (writes to colorFrom) for donut, half-donut, fillable */}
              {hasSingleColorFrom && (
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-[#3D4035]/40">
                    Color
                  </label>
                  <input
                    type="color"
                    value={
                      (item.colorFrom as string) ?? (item.color as string) ?? "#6C5DD3"
                    }
                    onChange={(e) =>
                      updateRow(idx, { colorFrom: e.target.value })
                    }
                    className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                </div>
              )}

              {/* Gradient (From + To) for pie, pie-image, benchmark */}
              {hasGradient && (
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-[#3D4035]/40">From</label>
                  <input
                    type="color"
                    value={(item.colorFrom as string) ?? "#6C5DD3"}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateRow(
                        idx,
                        gradientSync
                          ? { colorFrom: v, colorTo: v }
                          : { colorFrom: v },
                      );
                    }}
                    className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <label className="text-[11px] text-[#3D4035]/40">To</label>
                  <input
                    type="color"
                    value={(item.colorTo as string) ?? "#3D4035"}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateRow(
                        idx,
                        gradientSync
                          ? { colorFrom: v, colorTo: v }
                          : { colorTo: v },
                      );
                    }}
                    className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                </div>
              )}

              {/* Multi-bar: multipleColors array */}
              {hasBarMulti && (
                <BarMultiColorEditor
                  item={item}
                  idx={idx}
                  updateRow={updateRow}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BarMultiColorEditor({
  item,
  idx,
  updateRow,
}: {
  item: Record<string, unknown>;
  idx: number;
  updateRow: (idx: number, patch: Record<string, unknown>) => void;
}) {
  const values = (item.values as number[]) ?? [];
  const multipleColors = (item.multipleColors as string[]) ?? [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {values.map((_, barIdx) => (
        <div key={barIdx} className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#3D4035]/40">
            Bar {barIdx + 1}
          </span>
          <input
            type="color"
            value={multipleColors[barIdx] ?? "#6C5DD3"}
            onChange={(e) => {
              const next = [...multipleColors];
              next[barIdx] = e.target.value;
              while (next.length < values.length) next.push("");
              updateRow(idx, { multipleColors: next });
            }}
            className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </div>
      ))}
    </div>
  );
}
