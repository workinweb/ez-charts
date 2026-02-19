"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { unwrapShadcnData, wrapShadcnData } from "@/lib/shadcn-chart-data";
import { FieldRow } from "../field-row";

const SHADCN_CARTESIAN = ["shadcn:bar", "shadcn:area", "shadcn:line"];
const SHADCN_PIE_LIKE = ["shadcn:pie", "shadcn:radial"];
const SHADCN_RADAR = "shadcn:radar";

function getCategoryKey(chartType: string): string {
  return chartType === SHADCN_RADAR ? "subject" : "month";
}

function getDefaultNumericKeys(chartType: string): string[] {
  if (chartType === SHADCN_RADAR) return ["A", "B", "C"];
  return ["series1", "series2", "series3"];
}

interface ShadcnItemsDataEditorProps {
  chartType: string;
  data: unknown;
  onChange: (data: unknown) => void;
}

/** Items/cards-based data editor for shadcn (alternative to table) */
export function ShadcnItemsDataEditor({
  chartType,
  data,
  onChange,
}: ShadcnItemsDataEditorProps) {
  const { rows } = unwrapShadcnData(data);

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
    [rows, updateRows]
  );

  const removeRow = useCallback(
    (idx: number) => {
      updateRows(rows.filter((_, i) => i !== idx));
    },
    [rows, updateRows]
  );

  const addRow = useCallback(() => {
    const isPieLike = SHADCN_PIE_LIKE.includes(chartType);
    if (isPieLike) {
      updateRows([...rows, { name: `Slice ${rows.length + 1}`, value: 0 }]);
      return;
    }
    const catKey = getCategoryKey(chartType);
    const sample = rows[0];
    const numKeys = sample
      ? Object.keys(sample).filter(
          (k) =>
            k !== catKey &&
            typeof (sample as Record<string, unknown>)[k] === "number"
        )
      : getDefaultNumericKeys(chartType);

    const defaults: Record<string, string | number> = {
      [catKey]:
        chartType === SHADCN_RADAR
          ? `Subject ${rows.length + 1}`
          : `Row ${rows.length + 1}`,
    };
    for (const k of numKeys.length ? numKeys : getDefaultNumericKeys(chartType)) {
      defaults[k] = 0;
    }
    updateRows([...rows, defaults]);
  }, [chartType, rows, updateRows]);

  const isPieLike = SHADCN_PIE_LIKE.includes(chartType);

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
        {rows.map((item, idx) => (
          <ShadcnItemRow
            key={idx}
            chartType={chartType}
            isPieLike={isPieLike}
            item={item as Record<string, string | number>}
            index={idx}
            onUpdate={(patch) => updateRow(idx, patch)}
            onRemove={() => removeRow(idx)}
          />
        ))}

        {rows.length === 0 && (
          <p className="py-8 text-center text-[13px] text-[#3D4035]/40">
            No data points. Click &ldquo;Add&rdquo; to create one.
          </p>
        )}
      </div>
    </div>
  );
}

function getWrappedIfNeeded(
  data: unknown
): { _data: unknown; _seriesColors?: Record<string, string> } | null {
  if (data && typeof data === "object" && "_data" in data) {
    return data as { _data: unknown; _seriesColors?: Record<string, string> };
  }
  return null;
}

function ShadcnItemRow({
  chartType,
  isPieLike,
  item,
  index,
  onUpdate,
  onRemove,
}: {
  chartType: string;
  isPieLike: boolean;
  item: Record<string, string | number>;
  index: number;
  onUpdate: (patch: Partial<Record<string, string | number>>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const catKey = getCategoryKey(chartType);
  const label =
    (item[catKey] as string) ??
    (item.name as string) ??
    `#${index + 1}`;

  return (
    <div className="min-w-0 rounded-xl bg-white/60 ring-1 ring-black/[0.03]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02]"
      >
        <GripVertical className="size-3.5 shrink-0 text-[#3D4035]/20" />
        <span className="flex-1 truncate text-[14px] font-medium text-[#3D4035]">
          {String(label)}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-[#3D4035]/30 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="min-w-0 border-t border-black/[0.03] px-4 py-3">
          <div className="flex min-w-0 flex-col gap-3">
            {isPieLike ? (
              <>
                <FieldRow label="Name">
                  <Input
                    value={String(item.name ?? "")}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    className="h-8 min-w-0 rounded-lg text-[13px]"
                  />
                </FieldRow>
                <FieldRow label="Value">
                  <Input
                    type="number"
                    value={item.value ?? 0}
                    onChange={(e) =>
                      onUpdate({ value: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 min-w-0 rounded-lg text-[13px]"
                  />
                </FieldRow>
              </>
            ) : (
              <>
                <FieldRow label={catKey}>
                  <Input
                    value={String(item[catKey] ?? "")}
                    onChange={(e) => onUpdate({ [catKey]: e.target.value })}
                    className="h-8 min-w-0 rounded-lg text-[13px]"
                  />
                </FieldRow>
                {Object.entries(item)
                  .filter(([k]) => k !== catKey && typeof item[k] === "number")
                  .map(([k, v]) => (
                    <FieldRow key={k} label={k}>
                      <Input
                        type="number"
                        value={v as number}
                        onChange={(e) =>
                          onUpdate({
                            [k]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-8 min-w-0 rounded-lg text-[13px]"
                      />
                    </FieldRow>
                  ))}
              </>
            )}

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
