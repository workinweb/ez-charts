"use client";

import { useCallback, useMemo } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EditorShape } from "../editor-types";

export interface RosenchartsTableDataEditorProps {
  shape: EditorShape;
  data: unknown;
  onChange: (data: unknown) => void;
}

/** Table-based data editor for rosencharts (keyValue, bar-multi, pie, bar-image, scatter, bubble) */
export function RosenchartsTableDataEditor({
  shape,
  data,
  onChange,
}: RosenchartsTableDataEditorProps) {
  const arr = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];

  const { columns, getCellValue, updateCell, addRow, removeRow, canAddValueColumn, addValueColumn, removeValueColumn } =
    useTableConfig(shape, arr, onChange);

  if (columns.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
          Data points
        </h3>
        <div className="flex gap-2">
          {canAddValueColumn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={addValueColumn}
              aria-label="Add column"
              title="Add column"
              className="gap-1.5 text-[12px] text-[#6C5DD3] hover:text-[#5a4dbf]"
            >
              <Plus className="size-3.5" />
              Add column
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={addRow}
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
        <div className="min-w-[280px]">
          <div className="flex border-b border-black/[0.06] bg-[#3D4035]/[0.04]">
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex min-w-[80px] flex-1 items-center gap-1 border-r border-black/[0.06] last:border-r-0"
              >
                <span className="px-2 py-2 text-[11px] font-semibold uppercase text-[#3D4035]/70">
                  {col.label}
                </span>
                {col.removable && (
                  <button
                    type="button"
                    onClick={() => removeValueColumn(col.key)}
                    aria-label={`Remove ${col.label}`}
                    title={`Remove ${col.label}`}
                    className="shrink-0 rounded p-0.5 text-[#3D4035]/30 hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}
            {canAddValueColumn && (
              <div className="flex min-w-[48px] shrink-0 items-center justify-center border-l border-black/[0.06] bg-[#3D4035]/[0.02] px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addValueColumn}
                  aria-label="Add column"
                  className="h-7 gap-1 px-2 text-[10px] text-[#6C5DD3]"
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            )}
            <div className="flex min-w-[48px] shrink-0 items-center border-l border-black/[0.06] bg-[#3D4035]/[0.02]" />
          </div>

          {arr.map((item, idx) => (
            <div
              key={idx}
              className="flex border-b border-black/[0.04] last:border-b-0 hover:bg-black/[0.01]"
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex min-w-[80px] flex-1 items-center border-r border-black/[0.04] last:border-r-0"
                >
                  <Input
                    type={col.type}
                    value={String(getCellValue(item, col.key) ?? "")}
                    onChange={(e) => updateCell(idx, col.key, e.target.value)}
                    className="h-8 min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 text-[12px] focus-visible:ring-1 focus-visible:ring-inset"
                    placeholder={col.placeholder}
                  />
                </div>
              ))}
              <div className="flex min-w-[48px] shrink-0 items-center justify-center border-l border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  aria-label={`Remove row ${idx + 1}`}
                  title="Remove row"
                  className="rounded p-1.5 text-[#3D4035]/30 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}

          {arr.length === 0 && (
            <div className="py-12 text-center text-[13px] text-[#3D4035]/40">
              No data. Click &ldquo;Add row&rdquo; to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function useTableConfig(
  shape: EditorShape,
  arr: Record<string, unknown>[],
  onChange: (data: unknown) => void
) {
  const updateRows = useCallback(
    (next: Record<string, unknown>[]) => {
      onChange(next);
    },
    [onChange]
  );

  const updateCell = useCallback(
    (rowIdx: number, key: string, rawValue: string) => {
      const item = arr[rowIdx] ?? {};
      const match = key.match(/^values\[(\d+)\]$/);
      if (match) {
        const vi = parseInt(match[1], 10);
        const vals = [...((item.values as number[]) ?? [])];
        vals[vi] = parseFloat(rawValue) || 0;
        const next = [...arr];
        next[rowIdx] = { ...item, values: vals };
        updateRows(next);
        return;
      }
      const isNumeric =
        key === "value" || key === "xValue" || key === "yValue";
      const value = isNumeric
        ? (parseFloat(rawValue) || 0)
        : rawValue;
      const next = [...arr];
      next[rowIdx] = { ...item, [key]: value };
      updateRows(next);
    },
    [arr, updateRows]
  );

  const getCellValue = useCallback(
    (item: Record<string, unknown>, key: string): unknown => {
      if (key.startsWith("values[")) {
        const match = key.match(/^values\[(\d+)\]$/);
        if (match) {
          const vals = (item.values as number[]) ?? [];
          return vals[parseInt(match[1], 10)] ?? 0;
        }
      }
      return item[key];
    },
    []
  );

  const addRow = useCallback(() => {
    const len = arr.length;
    switch (shape) {
      case "keyValue":
        updateRows([...arr, { key: `Item ${len + 1}`, value: 0 }]);
        break;
      case "bar-image":
        updateRows([...arr, { key: `Item ${len + 1}`, value: 0, image: "" }]);
        break;
      case "bar-multi":
        updateRows([...arr, { key: `Item ${len + 1}`, values: [0] }]);
        break;
      case "pie":
        updateRows([...arr, { name: `Slice ${len + 1}`, value: 0 }]);
        break;
      case "scatter":
        updateRows([...arr, { xValue: 0, yValue: 0, name: `Point ${len + 1}` }]);
        break;
      case "bubble":
        updateRows([...arr, { name: `Item ${len + 1}`, sector: "Other", value: 100 }]);
        break;
      default:
        updateRows([...arr, { key: `Item ${len + 1}`, value: 0 }]);
    }
  }, [arr, shape, updateRows]);

  const removeRow = useCallback(
    (idx: number) => {
      updateRows(arr.filter((_, i) => i !== idx));
    },
    [arr, updateRows]
  );

  const addValueColumn = useCallback(() => {
    if (shape !== "bar-multi") return;
    const maxLen = Math.max(1, ...arr.map((r) => ((r.values as number[]) ?? []).length));
    const next =
      arr.length === 0
        ? [{ key: "Item 1", values: [0] }]
        : arr.map((r) => {
            const vals = [...((r.values as number[]) ?? [])];
            while (vals.length < maxLen) vals.push(0);
            vals.push(0);
            return { ...r, values: vals };
          });
    updateRows(next);
  }, [arr, shape, updateRows]);

  const removeValueColumn = useCallback(
    (colKey: string) => {
      if (shape !== "bar-multi") return;
      const match = colKey.match(/^values\[(\d+)\]$/);
      if (!match) return;
      const vi = parseInt(match[1], 10);
      const next = arr.map((r) => {
        const vals = ((r.values as number[]) ?? []).filter((_, i) => i !== vi);
        return { ...r, values: vals.length ? vals : [0] };
      });
      updateRows(next);
    },
    [arr, shape, updateRows]
  );

  const { columns, canAddValueColumn } = useMemo(() => {
    if (shape === "keyValue") {
      return {
        columns: [
          { key: "key", label: "Label", type: "text" as const, removable: false, placeholder: "" },
          { key: "value", label: "Value", type: "number" as const, removable: false, placeholder: "0" },
        ],
        canAddValueColumn: false,
      };
    }
    if (shape === "pie") {
      return {
        columns: [
          { key: "name", label: "Name", type: "text" as const, removable: false, placeholder: "" },
          { key: "value", label: "Value", type: "number" as const, removable: false, placeholder: "0" },
        ],
        canAddValueColumn: false,
      };
    }
    if (shape === "bar-image") {
      return {
        columns: [
          { key: "key", label: "Label", type: "text" as const, removable: false, placeholder: "" },
          { key: "value", label: "Value", type: "number" as const, removable: false, placeholder: "0" },
          { key: "image", label: "Image URL", type: "text" as const, removable: false, placeholder: "https://..." },
        ],
        canAddValueColumn: false,
      };
    }
    if (shape === "scatter") {
      return {
        columns: [
          { key: "name", label: "Name", type: "text" as const, removable: false, placeholder: "" },
          { key: "xValue", label: "X", type: "number" as const, removable: false, placeholder: "0" },
          { key: "yValue", label: "Y", type: "number" as const, removable: false, placeholder: "0" },
        ],
        canAddValueColumn: false,
      };
    }
    if (shape === "bubble") {
      return {
        columns: [
          { key: "name", label: "Name", type: "text" as const, removable: false, placeholder: "" },
          { key: "sector", label: "Sector", type: "text" as const, removable: false, placeholder: "" },
          { key: "value", label: "Value", type: "number" as const, removable: false, placeholder: "0" },
        ],
        canAddValueColumn: false,
      };
    }
    if (shape === "bar-multi") {
      const maxLen = Math.max(1, ...arr.map((r) => ((r.values as number[]) ?? []).length));
      const cols = [
        { key: "key", label: "Label", type: "text" as const, removable: false, placeholder: "" },
        ...Array.from({ length: maxLen }, (_, i) => ({
          key: `values[${i}]` as const,
          label: `Val ${i + 1}`,
          type: "number" as const,
          removable: maxLen > 1,
          placeholder: "0",
        })),
      ];
      return {
        columns: cols as { key: string; label: string; type: "text" | "number"; removable: boolean; placeholder: string }[],
        canAddValueColumn: true,
      };
    }
    return { columns: [], canAddValueColumn: false };
  }, [shape, arr]);

  return {
    columns,
    getCellValue,
    updateCell,
    addRow,
    removeRow,
    canAddValueColumn,
    addValueColumn,
    removeValueColumn,
  };
}
