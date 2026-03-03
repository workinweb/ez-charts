"use client";

import { useCallback, useMemo } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  unwrapShadcnData,
  wrapShadcnData,
} from "@/lib/chart/shadcn-chart-data";
import { FieldRow } from "../field-row";

const SHADCN_PIE_LIKE = ["shadcn:pie", "shadcn:radial"];

/** Default series when no data — generic names to avoid desktop/mobile hardcoding */
function getDefaultNumericKeys(chartType: string): string[] {
  if (chartType === "shadcn:radar") return ["A", "B", "C"];
  return ["series1", "series2", "series3"];
}

interface ShadcnDataEditorProps {
  chartType: string;
  data: unknown;
  onChange: (data: unknown) => void;
}

/** Shadcn-specific data editor: Cartesian (bar/area/line/radar) or Pie/Radial */
export function ShadcnDataEditor({
  chartType,
  data,
  onChange,
}: ShadcnDataEditorProps) {
  const { rows, categoryKey } = unwrapShadcnData(data, chartType);

  const updateRows = useCallback(
    (next: Record<string, string | number>[]) => {
      const wrapped = getWrappedIfNeeded(data);
      onChange(
        wrapShadcnData(next, {
          chartType,
          seriesColors: wrapped?._seriesColors,
        }),
      );
    },
    [data, chartType, onChange],
  );

  const updateRow = useCallback(
    (idx: number, patch: Partial<Record<string, string | number>>) => {
      const next = [...rows];
      const merged = { ...next[idx] } as Record<string, string | number>;
      for (const [k, v] of Object.entries(patch)) {
        if (v !== undefined) merged[k] = v;
      }
      next[idx] = merged;
      updateRows(next);
    },
    [rows, updateRows],
  );

  const removeRow = useCallback(
    (idx: number) => {
      updateRows(rows.filter((_, i) => i !== idx));
    },
    [rows, updateRows],
  );

  const isPieLike = SHADCN_PIE_LIKE.includes(chartType);

  const addRow = useCallback(() => {
    if (isPieLike) {
      updateRows([...rows, { name: `Slice ${rows.length + 1}`, value: 0 }]);
      return;
    }
    const sample = rows[0];
    const numKeys = sample
      ? Object.keys(sample).filter(
          (k) =>
            k !== categoryKey &&
            typeof (sample as Record<string, unknown>)[k] === "number",
        )
      : getDefaultNumericKeys(chartType);

    const defaults: Record<string, string | number> = {
      [categoryKey]:
        chartType === "shadcn:radar"
          ? `Subject ${rows.length + 1}`
          : `Row ${rows.length + 1}`,
    };
    for (const k of numKeys.length
      ? numKeys
      : getDefaultNumericKeys(chartType)) {
      defaults[k] = 0;
    }
    updateRows([...rows, defaults]);
  }, [chartType, rows, updateRows, isPieLike, categoryKey]);

  const addSeries = useCallback(() => {
    const sample = rows[0];
    const numKeys = sample
      ? Object.keys(sample).filter(
          (k) =>
            k !== categoryKey &&
            typeof (sample as Record<string, unknown>)[k] === "number",
        )
      : [];
    const used = new Set(numKeys);
    let name = "series1";
    for (let i = 1; i < 100; i++) {
      name = `series${i}`;
      if (!used.has(name)) break;
    }
    const next = rows.map((r) => ({ ...r, [name]: 0 })) as Record<
      string,
      string | number
    >[];
    if (next.length === 0)
      next.push({ [categoryKey]: "Row 1", [name]: 0 } as Record<
        string,
        string | number
      >);
    updateRows(next);
  }, [chartType, rows, updateRows, categoryKey]);

  const removeSeries = useCallback(
    (key: string) => {
      const next = rows
        .map((r) => {
          const c = { ...r };
          delete c[key];
          return c;
        })
        .filter((r) => Object.keys(r).length > 0) as Record<
        string,
        string | number
      >[];
      updateRows(next.length ? next : []);
    },
    [rows, updateRows],
  );

  const renameSeries = useCallback(
    (oldKey: string, newKey: string) => {
      if (oldKey === newKey) return;
      const next = rows.map((r) => {
        const c = { ...r };
        const v = c[oldKey];
        delete c[oldKey];
        c[newKey] = v;
        return c;
      }) as Record<string, string | number>[];
      updateRows(next);
    },
    [rows, updateRows],
  );

  if (isPieLike) {
    return (
      <ShadcnPieDataEditor
        rows={rows as { name: string; value: number }[]}
        onUpdate={updateRows}
        onAdd={addRow}
      />
    );
  }

  return (
    <ShadcnCartesianDataEditor
      chartType={chartType}
      rows={rows}
      categoryKey={categoryKey}
      onUpdateRows={updateRows}
      onAddRow={addRow}
      onAddSeries={addSeries}
      onRemoveSeries={removeSeries}
      onRenameSeries={renameSeries}
      onRemoveRow={removeRow}
    />
  );
}

function getWrappedIfNeeded(
  data: unknown,
): { _data: unknown; _seriesColors?: Record<string, string> } | null {
  if (data && typeof data === "object" && "_data" in data) {
    return data as { _data: unknown; _seriesColors?: Record<string, string> };
  }
  return null;
}

/* ── Cartesian (bar/area/line/radar) — table view with Add/Remove series ─────── */

function ShadcnCartesianDataEditor({
  chartType,
  rows,
  categoryKey,
  onUpdateRows,
  onAddRow,
  onAddSeries,
  onRemoveSeries,
  onRenameSeries,
  onRemoveRow,
}: {
  chartType: string;
  rows: Record<string, string | number>[];
  categoryKey: string;
  onUpdateRows: (rows: Record<string, string | number>[]) => void;
  onAddRow: () => void;
  onAddSeries: () => void;
  onRemoveSeries: (key: string) => void;
  onRenameSeries: (oldKey: string, newKey: string) => void;
  onRemoveRow: (idx: number) => void;
}) {
  const { seriesKeys, allKeys } = useMemo(() => {
    const sample = rows[0];
    const numeric = sample
      ? Object.keys(sample).filter(
          (k) =>
            k !== categoryKey &&
            typeof (sample as Record<string, unknown>)[k] === "number",
        )
      : getDefaultNumericKeys(chartType);
    return {
      seriesKeys: numeric,
      allKeys: [categoryKey, ...numeric],
    };
  }, [rows, categoryKey, chartType]);

  const isSingleSeriesOnly = chartType === "shadcn:bar-horizontal";
  const canRemoveSeries = seriesKeys.length > 1 && !isSingleSeriesOnly;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
          Data points
        </h3>
        <div className="flex gap-2">
          {!isSingleSeriesOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddSeries}
              aria-label="Add series"
              title="Add series"
              className="gap-1.5 text-[12px] text-[#6C5DD3] hover:text-[#5a4dbf]"
            >
              <Plus className="size-3.5" />
              Add series
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddRow}
            aria-label="Add row"
            title="Add row"
            className="gap-1.5 text-[12px] text-[#6C5DD3] hover:text-[#5a4dbf]"
          >
            <Plus className="size-3.5" />
            Add row
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/[0.06] bg-white/80">
        <div className="min-w-[320px]">
          {/* Header row: column names + add series */}
          <div className="flex border-b border-black/[0.06] bg-[#3D4035]/[0.04]">
            {allKeys.map((k) => (
              <div
                key={k}
                className="flex min-w-[90px] flex-1 items-center gap-1 border-r border-black/[0.06] last:border-r-0"
              >
                {k === categoryKey ? (
                  <span className="px-2 py-2 text-[11px] font-semibold uppercase text-[#3D4035]/70">
                    {categoryKey}
                  </span>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center gap-1 px-1 py-2">
                    <Input
                      defaultValue={k}
                      onBlur={(e) => {
                        const v =
                          e.target.value.trim().replace(/\s+/g, "_") || k;
                        if (v !== k && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v))
                          onRenameSeries(k, v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          (e.target as HTMLInputElement).blur();
                      }}
                      className="h-7 rounded border-0 bg-transparent px-2 text-[11px] font-medium text-[#3D4035] focus-visible:ring-1"
                      placeholder="Series"
                    />
                    {canRemoveSeries && (
                      <button
                        type="button"
                        onClick={() => onRemoveSeries(k)}
                        aria-label={`Remove series ${k}`}
                        title={`Remove series ${k}`}
                        className="shrink-0 rounded p-0.5 text-[#3D4035]/30 hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {!isSingleSeriesOnly && (
              <div className="flex min-w-[60px] shrink-0 items-center justify-center border-l border-black/[0.06] bg-[#3D4035]/[0.02] px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddSeries}
                  aria-label="Add series"
                  title="Add series"
                  className="h-7 gap-1 px-2 text-[10px] text-[#6C5DD3] hover:text-[#5a4dbf]"
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Data rows */}
          {rows.map((item, idx) => (
            <div
              key={idx}
              className="flex border-b border-black/[0.04] last:border-b-0 hover:bg-black/[0.01]"
            >
              {allKeys.map((k) => (
                <div
                  key={k}
                  className="flex min-w-[90px] flex-1 items-center border-r border-black/[0.04] last:border-r-0"
                >
                  <Input
                    type={typeof item[k] === "number" ? "number" : "text"}
                    value={String(item[k] ?? "")}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const num = parseFloat(raw);
                      const merged = { ...item } as Record<
                        string,
                        string | number
                      >;
                      merged[k] =
                        typeof item[k] === "number"
                          ? Number.isNaN(num)
                            ? 0
                            : num
                          : raw;
                      const next = [...rows];
                      next[idx] = merged;
                      onUpdateRows(next);
                    }}
                    className="h-8 min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 text-[12px] focus-visible:ring-1 focus-visible:ring-inset"
                  />
                </div>
              ))}
              <div className="flex min-w-[48px] shrink-0 items-center justify-center border-l border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => onRemoveRow(idx)}
                  aria-label={`Remove row ${idx + 1}`}
                  title="Remove row"
                  className="rounded p-1.5 text-[#3D4035]/30 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="py-12 text-center text-[13px] text-[#3D4035]/40">
              No data. Click &ldquo;Add row&rdquo; or &ldquo;Add series&rdquo;
              to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Pie / Radial ───────────────────────────────────────────────────────────── */

function ShadcnPieDataEditor({
  rows,
  onUpdate,
  onAdd,
}: {
  rows: { name: string; value: number }[];
  onUpdate: (data: { name: string; value: number }[]) => void;
  onAdd: () => void;
}) {
  const updateRow = (idx: number, patch: { name?: string; value?: number }) => {
    const next = [...rows];
    next[idx] = { ...next[idx], ...patch };
    onUpdate(next);
  };
  const removeRow = (idx: number) => {
    onUpdate(rows.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
          Slices
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdd}
          aria-label="Add slice"
          title="Add slice"
          className="gap-1.5 text-[12px] text-[#6C5DD3] hover:text-[#5a4dbf]"
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      <div className="flex max-h-[40vh] min-w-0 flex-col gap-3 overflow-y-auto pr-2 sm:max-h-[45vh] md:max-h-[50vh] lg:max-h-[56vh]">
        {rows.map((item, idx) => (
          <div
            key={idx}
            className="flex min-w-0 flex-col gap-3 rounded-xl bg-white/60 p-4 ring-1 ring-black/[0.03] sm:flex-row sm:flex-wrap sm:items-end sm:gap-4"
          >
            <div className="min-w-0 flex-1 sm:min-w-[120px]">
              <FieldRow label="Name">
                <Input
                  value={item.name}
                  onChange={(e) => updateRow(idx, { name: e.target.value })}
                  className="h-8 min-w-0 rounded-lg text-[13px]"
                />
              </FieldRow>
            </div>
            <div className="min-w-0 flex-1 sm:min-w-[80px] sm:max-w-[100px]">
              <FieldRow label="Value">
                <Input
                  type="number"
                  value={item.value}
                  onChange={(e) =>
                    updateRow(idx, { value: parseFloat(e.target.value) || 0 })
                  }
                  className="h-8 min-w-0 rounded-lg text-[13px]"
                />
              </FieldRow>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRow(idx)}
              aria-label="Remove slice"
              title="Remove slice"
              className="shrink-0 self-end gap-1.5 text-[12px] text-red-500 hover:bg-red-50 hover:text-red-600 sm:self-end"
            >
              <Trash2 className="size-3 shrink-0" />
              Remove
            </Button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-[13px] text-[#3D4035]/40">
            No slices. Click &ldquo;Add&rdquo; to create one.
          </p>
        )}
      </div>
    </div>
  );
}
