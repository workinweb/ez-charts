"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { EditorProps, EditorShape } from "./editor-types";
import { FieldRow } from "./field-row";

/* ═══════════════════════════════════════════════════════════════════════
 * DATA EDITOR (table-like rows per data shape)
 * ═══════════════════════════════════════════════════════════════════ */

export function DataEditor({ shape, data, onChange }: EditorProps) {
  const arr = Array.isArray(data) ? data : [];

  const updateRow = useCallback(
    (idx: number, patch: Record<string, unknown>) => {
      const next = [...arr];
      next[idx] = { ...next[idx], ...patch };
      onChange(next);
    },
    [arr, onChange],
  );

  const removeRow = useCallback(
    (idx: number) => {
      onChange(arr.filter((_: unknown, i: number) => i !== idx));
    },
    [arr, onChange],
  );

  const addRow = useCallback(() => {
    switch (shape) {
      case "keyValue":
        onChange([...arr, { key: `Item ${arr.length + 1}`, value: 0 }]);
        break;
      case "bar-image":
        onChange([
          ...arr,
          { key: `Item ${arr.length + 1}`, value: 0, image: "" },
        ]);
        break;
      case "bar-multi":
        onChange([...arr, { key: `Item ${arr.length + 1}`, values: [0] }]);
        break;
      case "line":
        onChange([
          ...arr,
          { data: [{ date: new Date().toISOString().slice(0, 10), value: 0 }] },
        ]);
        break;
      case "pie":
        onChange([...arr, { name: `Slice ${arr.length + 1}`, value: 0 }]);
        break;
      case "treemap":
        onChange([
          ...arr,
          { name: `Group ${arr.length + 1}`, subtopics: [{ Topic: 10 }] },
        ]);
        break;
      case "scatter":
        onChange([
          ...arr,
          { xValue: 0, yValue: 0, name: `Point ${arr.length + 1}` },
        ]);
        break;
      case "shadcnCartesian":
        const sample = (arr[0] as Record<string, unknown>) ?? {};
        const catKey = Object.keys(sample).find((k) => typeof sample[k] === "string") ?? "month";
        const numKeys = Object.keys(sample).filter((k) => k !== catKey && typeof sample[k] === "number");
        const defaults: Record<string, unknown> = { [catKey]: `Row ${arr.length + 1}` };
        for (const k of numKeys.length ? numKeys : ["desktop", "mobile"]) {
          defaults[k] = 0;
        }
        onChange([...arr, defaults]);
        break;
    }
  }, [arr, onChange, shape]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
          Data points
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={addRow}
          aria-label="Add data point"
          title="Add data point"
          className="gap-1.5 text-[12px] text-[#6C5DD3] hover:text-[#5a4dbf]"
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      <div className="flex max-h-[40vh] min-w-0 flex-col gap-3 overflow-y-auto pr-2 sm:max-h-[45vh] md:max-h-[50vh] lg:max-h-[56vh]">
        {arr.map((item: Record<string, unknown>, idx: number) => (
          <DataRow
            key={idx}
            shape={shape}
            item={item}
            index={idx}
            onUpdate={(patch) => updateRow(idx, patch)}
            onRemove={() => removeRow(idx)}
          />
        ))}

        {arr.length === 0 && (
          <p className="py-8 text-center text-[13px] text-[#3D4035]/40">
            No data points. Click &ldquo;Add&rdquo; to create one.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Individual data row ────────────────────────────────────────────── */

function DataRow({
  shape,
  item,
  index,
  onUpdate,
  onRemove,
}: {
  shape: EditorShape;
  item: Record<string, unknown>;
  index: number;
  onUpdate: (patch: Record<string, unknown>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const label =
    (item.key as string) ||
    (item.name as string) ||
    (item.month as string) ||
    (item.subject as string) ||
    `#${index + 1}`;

  return (
    <div className="min-w-0 rounded-xl bg-white/60 ring-1 ring-black/[0.03]">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02]"
      >
        <GripVertical className="size-3.5 shrink-0 text-[#3D4035]/20" />
        <span className="flex-1 truncate text-[14px] font-medium text-[#3D4035]">
          {label}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-[#3D4035]/30 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {/* Expanded fields */}
      {expanded && (
        <div className="min-w-0 border-t border-black/[0.03] px-4 py-3">
          <div className="flex min-w-0 flex-col gap-3">
            {/* ── Key/Value (bar, breakdown, benchmark, gradient, thin) ── */}
            {shape === "keyValue" && (
              <>
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
                  <div className="min-w-0 flex-1 sm:min-w-[120px]">
                    <FieldRow label="Label">
                      <Input
                        value={(item.key as string) ?? ""}
                        onChange={(e) => onUpdate({ key: e.target.value })}
                        className="h-8 min-w-0 rounded-lg text-[13px]"
                      />
                    </FieldRow>
                  </div>
                  <div className="min-w-0 flex-1 sm:min-w-[80px] sm:max-w-[100px]">
                    <FieldRow label="Value">
                      <Input
                        type="number"
                        value={item.value as number}
                        onChange={(e) =>
                          onUpdate({ value: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 min-w-0 rounded-lg text-[13px]"
                      />
                    </FieldRow>
                  </div>
                </div>
              </>
            )}

            {/* ── Bar Image ────────────────────────── */}
            {shape === "bar-image" && (
              <>
                <FieldRow label="Label">
                  <Input
                    value={(item.key as string) ?? ""}
                    onChange={(e) => onUpdate({ key: e.target.value })}
                    className="h-8 min-w-0 rounded-lg text-[13px]"
                  />
                </FieldRow>
                <FieldRow label="Value">
                  <Input
                    type="number"
                    value={item.value as number}
                    onChange={(e) =>
                      onUpdate({ value: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 min-w-0 rounded-lg text-[13px]"
                  />
                </FieldRow>
                <FieldRow label="Image URL">
                  <Input
                    value={(item.image as string) ?? ""}
                    onChange={(e) => onUpdate({ image: e.target.value })}
                    className="h-8 min-w-0 rounded-lg text-[13px]"
                    placeholder="https://..."
                  />
                </FieldRow>
              </>
            )}

            {/* ── Bar Multi ────────────────────────── */}
            {shape === "bar-multi" && (
              <>
                <FieldRow label="Label">
                  <Input
                    value={(item.key as string) ?? ""}
                    onChange={(e) => onUpdate({ key: e.target.value })}
                    className="h-8 min-w-0 rounded-lg text-[13px]"
                  />
                </FieldRow>
                <div className="space-y-2">
                  <span className="text-[11px] font-medium text-[#3D4035]/50">
                    Values
                  </span>
                  {((item.values as number[]) ?? []).map(
                    (v: number, vi: number) => (
                      <div key={vi} className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={v}
                          onChange={(e) => {
                            const vals = [...((item.values as number[]) ?? [])];
                            vals[vi] = parseFloat(e.target.value) || 0;
                            onUpdate({ values: vals });
                          }}
                          className="h-8 min-w-0 flex-1 rounded-lg text-[13px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const vals = (
                              (item.values as number[]) ?? []
                            ).filter((_: number, i: number) => i !== vi);
                            onUpdate({ values: vals });
                          }}
                          aria-label={`Remove value ${vi + 1}`}
                          title="Remove value"
                          className="rounded-full p-1 text-[#3D4035]/30 hover:text-red-500"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ),
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onUpdate({
                        values: [...((item.values as number[]) ?? []), 0],
                      })
                    }
                    className="gap-1 text-[11px] text-[#6C5DD3]"
                  >
                    <Plus className="size-3" />
                    Add value
                  </Button>
                </div>
              </>
            )}

            {/* ── Line ─────────────────────────────── */}
            {shape === "line" && (
              <LineSeriesEditor
                series={item as Record<string, unknown>}
                onUpdate={onUpdate}
              />
            )}

            {/* ── Pie / Donut ──────────────────────── */}
            {shape === "pie" && (
              <>
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
                  <div className="min-w-0 flex-1 sm:min-w-[120px]">
                    <FieldRow label="Name">
                      <Input
                        value={(item.name as string) ?? ""}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        className="h-8 min-w-0 rounded-lg text-[13px]"
                      />
                    </FieldRow>
                  </div>
                  <div className="min-w-0 flex-1 sm:min-w-[80px] sm:max-w-[100px]">
                    <FieldRow label="Value">
                      <Input
                        type="number"
                        value={item.value as number}
                        onChange={(e) =>
                          onUpdate({ value: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 min-w-0 rounded-lg text-[13px]"
                      />
                    </FieldRow>
                  </div>
                </div>
                {typeof item.logo === "string" && (
                  <FieldRow label="Logo URL">
                    <Input
                      value={item.logo}
                      onChange={(e) => onUpdate({ logo: e.target.value })}
                      className="h-8 min-w-0 rounded-lg text-[13px]"
                      placeholder="https://..."
                    />
                  </FieldRow>
                )}
              </>
            )}

            {/* ── TreeMap ──────────────────────────── */}
            {shape === "treemap" && (
              <TreeMapEditor item={item} onUpdate={onUpdate} />
            )}

            {/* ── Shadcn Cartesian (bar/area/line) ─── */}
            {shape === "shadcnCartesian" && (
              <ShadcnCartesianEditor item={item} onUpdate={onUpdate} />
            )}

            {/* ── Scatter ──────────────────────────── */}
            {shape === "scatter" && (
              <>
                <FieldRow label="Name">
                  <Input
                    value={(item.name as string) ?? ""}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    className="h-8 min-w-0 rounded-lg text-[13px]"
                  />
                </FieldRow>
                <div className="grid min-w-0 grid-cols-2 gap-3">
                  <FieldRow label="X value">
                    <Input
                      type="number"
                      value={item.xValue as number}
                      onChange={(e) =>
                        onUpdate({ xValue: parseFloat(e.target.value) || 0 })
                      }
                      className="h-8 min-w-0 rounded-lg text-[13px]"
                    />
                  </FieldRow>
                  <FieldRow label="Y value">
                    <Input
                      type="number"
                      value={item.yValue as number}
                      onChange={(e) =>
                        onUpdate({ yValue: parseFloat(e.target.value) || 0 })
                      }
                      className="h-8 min-w-0 rounded-lg text-[13px]"
                    />
                  </FieldRow>
                </div>
              </>
            )}

            {/* Remove button */}
            <div className="flex min-w-0 shrink-0 justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                aria-label="Remove"
                title="Remove"
                className="shrink-0 gap-1.5 text-[12px] text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-3 shrink-0" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shadcn Cartesian editor (bar/area/line/radar) ─────────────────── */
function ShadcnCartesianEditor({
  item,
  onUpdate,
}: {
  item: Record<string, unknown>;
  onUpdate: (patch: Record<string, unknown>) => void;
}) {
  const entries = Object.entries(item);
  const catEntry = entries.find(([, v]) => typeof v === "string");
  const numEntries = entries.filter(([, v]) => typeof v === "number");

  return (
    <div className="flex flex-col gap-3">
      {catEntry && (
        <FieldRow label={catEntry[0]}>
          <Input
            value={String(catEntry[1])}
            onChange={(e) => onUpdate({ [catEntry[0]]: e.target.value })}
            className="h-8 min-w-0 rounded-lg text-[13px]"
          />
        </FieldRow>
      )}
      {numEntries.map(([k, v]) => (
        <FieldRow key={k} label={k}>
          <Input
            type="number"
            value={v as number}
            onChange={(e) =>
              onUpdate({ [k]: parseFloat(e.target.value) || 0 })
            }
            className="h-8 min-w-0 rounded-lg text-[13px]"
          />
        </FieldRow>
      ))}
    </div>
  );
}

/* ── Line series editor ─────────────────────────────────────────────── */

function LineSeriesEditor({
  series,
  onUpdate,
}: {
  series: Record<string, unknown>;
  onUpdate: (patch: Record<string, unknown>) => void;
}) {
  const points = (series.data as Array<{ date: string; value: number }>) ?? [];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-[#3D4035]/50">
        Data points
      </span>
      {points.map((pt, pi) => (
        <div key={pi} className="flex items-center gap-2">
          <Input
            value={typeof pt.date === "string" ? pt.date : ""}
            onChange={(e) => {
              const next = [...points];
              next[pi] = { ...pt, date: e.target.value };
              onUpdate({ data: next });
            }}
            className="h-8 min-w-0 flex-1 rounded-lg text-[12px]"
            placeholder="Date"
          />
          <Input
            type="number"
            value={pt.value}
            onChange={(e) => {
              const next = [...points];
              next[pi] = { ...pt, value: parseFloat(e.target.value) || 0 };
              onUpdate({ data: next });
            }}
            className="h-8 w-20 rounded-lg text-[12px]"
            placeholder="Value"
          />
          <button
            type="button"
            onClick={() => {
              onUpdate({
                data: points.filter((_: unknown, i: number) => i !== pi),
              });
            }}
            aria-label={`Remove point ${pi + 1}`}
            title="Remove point"
            className="rounded-full p-1 text-[#3D4035]/30 hover:text-red-500"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          onUpdate({
            data: [
              ...points,
              { date: new Date().toISOString().slice(0, 10), value: 0 },
            ],
          })
        }
        className="gap-1 text-[11px] text-[#6C5DD3]"
      >
        <Plus className="size-3" />
        Add point
      </Button>
    </div>
  );
}

/* ── TreeMap editor ──────────────────────────────────────────────────── */

function TreeMapEditor({
  item,
  onUpdate,
}: {
  item: Record<string, unknown>;
  onUpdate: (patch: Record<string, unknown>) => void;
}) {
  const subtopics = (item.subtopics as Record<string, number>[]) ?? [{}];

  return (
    <>
      <FieldRow label="Group name">
        <Input
          value={(item.name as string) ?? ""}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="h-8 min-w-0 rounded-lg text-[13px]"
        />
      </FieldRow>

      <div className="space-y-2">
        <span className="text-[11px] font-medium text-[#3D4035]/50">
          Subtopics
        </span>
        {subtopics.map((sub, si) => (
          <div key={si} className="space-y-1">
            {Object.entries(sub).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <Input
                  value={key}
                  onChange={(e) => {
                    const nextSub = { ...sub };
                    delete nextSub[key];
                    nextSub[e.target.value] = val;
                    const nextArr = [...subtopics];
                    nextArr[si] = nextSub;
                    onUpdate({ subtopics: nextArr });
                  }}
                  className="h-8 min-w-0 flex-1 rounded-lg text-[12px]"
                />
                <Input
                  type="number"
                  value={val}
                  onChange={(e) => {
                    const nextSub = {
                      ...sub,
                      [key]: parseFloat(e.target.value) || 0,
                    };
                    const nextArr = [...subtopics];
                    nextArr[si] = nextSub;
                    onUpdate({ subtopics: nextArr });
                  }}
                  className="h-8 w-20 rounded-lg text-[12px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const nextSub = { ...sub };
                    delete nextSub[key];
                    const nextArr = [...subtopics];
                    nextArr[si] = nextSub;
                    onUpdate({ subtopics: nextArr });
                  }}
                  aria-label={`Remove topic ${key}`}
                  title="Remove topic"
                  className="rounded-full p-1 text-[#3D4035]/30 hover:text-red-500"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const nextSub = {
                  ...sub,
                  [`Topic ${Object.keys(sub).length + 1}`]: 0,
                };
                const nextArr = [...subtopics];
                nextArr[si] = nextSub;
                onUpdate({ subtopics: nextArr });
              }}
              className="gap-1 text-[11px] text-[#6C5DD3]"
            >
              <Plus className="size-3" />
              Add topic
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
