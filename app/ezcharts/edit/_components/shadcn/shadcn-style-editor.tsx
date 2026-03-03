"use client";

import { useCallback } from "react";
import { unwrapShadcnData } from "@/lib/chart/shadcn-chart-data";

interface ShadcnStyleEditorProps {
  chartType: string;
  data: unknown;
  onChange: (data: unknown) => void;
}

const SHADCN_PIE_LIKE = ["shadcn:pie", "shadcn:radial"];
const SHADCN_CARTESIAN = [
  "shadcn:bar",
  "shadcn:bar-horizontal",
  "shadcn:bar-stacked",
  "shadcn:area",
  "shadcn:line",
];
const SHADCN_RADAR = "shadcn:radar";

const SERIES_COLOR_PALETTE = [
  "#6C5DD3",
  "#3D4035",
  "#8B5CF6",
  "#0EA5E9",
  "#10B981",
];

/** Shadcn-specific style editor: per-slice fill (pie/radial) or series colors (cartesian/radar) */
export function ShadcnStyleEditor({
  chartType,
  data,
  onChange,
}: ShadcnStyleEditorProps) {
  const { rows, seriesColors } = unwrapShadcnData(data, chartType);

  const isPieLike = SHADCN_PIE_LIKE.includes(chartType);
  const isCartesian =
    SHADCN_CARTESIAN.includes(chartType) || chartType === SHADCN_RADAR;

  if (isPieLike) {
    return (
      <ShadcnPieStyleEditor
        rows={rows as { name: string; value: number; fill?: string }[]}
        onChange={onChange}
        data={data}
      />
    );
  }

  if (isCartesian) {
    return (
      <ShadcnCartesianStyleEditor
        rows={rows}
        seriesColors={seriesColors}
        data={data}
        onChange={onChange}
      />
    );
  }

  return null;
}

/* ── Pie / Radial: edit fill per slice ─────────────────────────────────────── */

function ShadcnPieStyleEditor({
  rows,
  onChange,
  data,
}: {
  rows: { name: string; value: number; fill?: string }[];
  onChange: (data: unknown) => void;
  data: unknown;
}) {
  const updateRow = useCallback(
    (idx: number, fill: string) => {
      const next = [...rows];
      next[idx] = { ...next[idx], fill };
      const wrapped =
        data && typeof data === "object" && "_data" in data
          ? (data as {
              _data?: unknown;
              _seriesColors?: Record<string, string>;
            })
          : null;
      if (wrapped) {
        onChange({ ...wrapped, _data: next });
      } else {
        onChange(next);
      }
    },
    [rows, data, onChange],
  );

  const defaultColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
        Slice colors
      </h3>
      <div className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto pr-1 sm:max-h-[45vh] md:max-h-[50vh] lg:max-h-[56vh]">
        {rows.map((item, idx) => {
          const fill = item.fill ?? defaultColors[idx % defaultColors.length];
          const displayFill = fill.startsWith("var(") ? "#6C5DD3" : fill;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]"
            >
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#3D4035]">
                {item.name}
              </span>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-[#3D4035]/40">Color</label>
                <input
                  type="color"
                  value={displayFill}
                  onChange={(e) => updateRow(idx, e.target.value)}
                  className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Cartesian / Radar: edit series colors ──────────────────────────────────── */

function ShadcnCartesianStyleEditor({
  rows,
  seriesColors,
  data,
  onChange,
}: {
  rows: Record<string, string | number>[];
  seriesColors?: Record<string, string>;
  data: unknown;
  onChange: (data: unknown) => void;
}) {
  const sample = rows[0];
  const categoryKey = sample
    ? (Object.keys(sample).find(
        (k) => typeof (sample as Record<string, unknown>)[k] === "string",
      ) ?? "month")
    : "month";
  const seriesKeys = sample
    ? Object.keys(sample).filter(
        (k) =>
          k !== categoryKey &&
          typeof (sample as Record<string, unknown>)[k] === "number",
      )
    : ["desktop", "mobile"];

  const updateSeriesColor = useCallback(
    (key: string, color: string) => {
      const next = { ...(seriesColors ?? {}), [key]: color };
      const wrapped =
        data && typeof data === "object" && "_data" in data
          ? (data as { _data: unknown; _seriesColors?: Record<string, string> })
          : null;
      if (wrapped) {
        onChange({ ...wrapped, _seriesColors: next });
      } else {
        onChange({ _data: rows, _seriesColors: next });
      }
    },
    [seriesColors, data, onChange, rows],
  );

  if (seriesKeys.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-[#3D4035]/40">
        Add data points first to edit series colors.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
        Series colors
      </h3>
      <div className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto pr-1 sm:max-h-[45vh] md:max-h-[50vh] lg:max-h-[56vh]">
        {seriesKeys.map((key, idx) => {
          const color =
            seriesColors?.[key] ??
            SERIES_COLOR_PALETTE[idx % SERIES_COLOR_PALETTE.length];
          return (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]"
            >
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#3D4035]">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-[#3D4035]/40">Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateSeriesColor(key, e.target.value)}
                  className="size-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
