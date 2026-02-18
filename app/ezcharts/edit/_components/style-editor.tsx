"use client";

import { Paintbrush, RotateCcw } from "lucide-react";
import { useCallback } from "react";
import type { EditorProps } from "./editor-types";

const NON_COLOR_CHARTS = ["keyValue"];

export function StyleEditor({ shape, data, onChange }: EditorProps) {
  const arr = Array.isArray(data) ? data : [];

  const updateRow = useCallback(
    (idx: number, patch: Record<string, unknown>) => {
      const next = [...arr];
      next[idx] = { ...next[idx], ...patch };
      onChange(next);
    },
    [arr, onChange],
  );

  const isNonColorChart = NON_COLOR_CHARTS.includes(shape);
  const hasGradient = shape === "pie";

  const goToDefaults = useCallback(() => {
    const next = arr.map((item: Record<string, unknown>) => {
      const { color, colorFrom, colorTo, multipleColors, ...rest } =
        item as Record<string, unknown>;
      return rest;
    });
    onChange(next);
  }, [arr, onChange]);

  if (NON_COLOR_CHARTS.includes(shape)) {
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
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
          Colors
        </h3>
        <button
          type="button"
          onClick={goToDefaults}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#3D4035]/60 transition hover:bg-black/[0.04] hover:text-[#3D4035]"
        >
          <RotateCcw className="size-3.5" />
          Go to Defaults
        </button>
      </div>

      <div className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto pr-1 sm:max-h-[45vh] md:max-h-[50vh] lg:max-h-[56vh]">
        {arr.map((item: Record<string, unknown>, idx: number) => {
          const label =
            (item.key as string) || (item.name as string) || `#${idx + 1}`;

          return (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]"
            >
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#3D4035]">
                {label}
              </span>

              {!isNonColorChart && (
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-[#3D4035]/40">Color</label>
                  <input
                    type="color"
                    value={(item.color as string) ?? "#6C5DD3"}
                    onChange={(e) => updateRow(idx, { color: e.target.value })}
                    className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                </div>
              )}

              {hasGradient && (
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-[#3D4035]/40">From</label>
                  <input
                    type="color"
                    value={(item.colorFrom as string) ?? "#6C5DD3"}
                    onChange={(e) =>
                      updateRow(idx, { colorFrom: e.target.value })
                    }
                    className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <label className="text-[11px] text-[#3D4035]/40">To</label>
                  <input
                    type="color"
                    value={(item.colorTo as string) ?? "#3D4035"}
                    onChange={(e) =>
                      updateRow(idx, { colorTo: e.target.value })
                    }
                    className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
