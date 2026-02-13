"use client";

import {
  Suspense,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ChevronDown,
  Eye,
  Paintbrush,
  Database,
  Settings2,
  GripVertical,
  Lock,
} from "lucide-react";
import {
  getChartTypeByName,
  isChartTypeCompatible,
  transformChartData,
  chartTypes,
} from "@/components/rosencharts";
import type { ChartTypeKey } from "@/components/rosencharts";
import { useAllCharts, useChartsStore } from "@/stores/charts-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
 * Editor shape — determines which form fields to render.
 * The interchangeability logic (which types can swap) lives in
 * rosencharts/utils and is used via isChartTypeCompatible.
 * ────────────────────────────────────────────────────────────────────── */

type EditorShape =
  | "keyValue" // { key, value, color? }
  | "bar-image" // { key, value, color?, image }
  | "bar-multi" // { key, values[], multipleColors[] }
  | "line" // series → { data: [{ date, value }], color }
  | "pie" // { name, value, colorFrom?, colorTo?, logo? }
  | "treemap" // { name, subtopics, colorFrom?, colorTo? }
  | "scatter"; // { xValue, yValue, name, color? }

function getEditorShape(chartType: string): EditorShape {
  if (chartType === "horizontal-bar-image") return "bar-image";
  if (
    chartType === "horizontal-bar-multi" ||
    chartType === "vertical-bar-multi"
  )
    return "bar-multi";
  if (chartType.includes("line")) return "line";
  if (
    chartType.includes("pie") ||
    chartType.includes("donut") ||
    chartType.includes("fillable") ||
    chartType.includes("half")
  )
    return "pie";
  if (chartType.includes("treemap")) return "treemap";
  if (chartType.includes("scatter")) return "scatter";
  // bar, gradient, thin, breakdown, breakdown-thin, benchmark
  return "keyValue";
}

/* ─────────────────────────────────────────────────────────────────────────
 * Deep‑clone unknown data (JSON-safe)
 * ────────────────────────────────────────────────────────────────────── */
function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/* ── Create-mode defaults ───────────────────────────────────────────── */
const DEFAULT_CHART_TYPE = "horizontal-bar" as const;
const DEFAULT_CREATE_DATA = [
  { key: "Item 1", value: 0 },
  { key: "Item 2", value: 10 },
  { key: "Item 3", value: 25 },
];

/** Default data for a chart type when switching to an incompatible type */
function getDefaultDataForChartType(chartType: string): unknown[] {
  if (chartType === "horizontal-bar-image") {
    return [{ key: "Item 1", value: 0, image: "" }];
  }
  if (
    chartType === "horizontal-bar-multi" ||
    chartType === "vertical-bar-multi"
  ) {
    return [{ key: "Item 1", values: [10, 20, 30] }];
  }
  if (chartType.includes("line")) {
    return [
      {
        data: [
          { date: "2024-01-01", value: 0 },
          { date: "2024-01-02", value: 10 },
        ],
      },
    ];
  }
  if (
    chartType.includes("pie") ||
    chartType.includes("donut") ||
    chartType.includes("fillable") ||
    chartType.includes("half")
  ) {
    return [
      { name: "Slice 1", value: 30 },
      { name: "Slice 2", value: 70 },
    ];
  }
  if (chartType.includes("treemap")) {
    return [{ name: "Group 1", subtopics: [{ A: 40, B: 60 }] }];
  }
  if (chartType.includes("scatter")) {
    return [{ xValue: 10, yValue: 20, name: "Point 1" }];
  }
  return cloneData(DEFAULT_CREATE_DATA);
}

/* ─────────────────────────────────────────────────────────────────────────
 * Tabs
 * ────────────────────────────────────────────────────────────────────── */
type EditorTab = "data" | "style" | "settings";

const tabs: { id: EditorTab; label: string; icon: React.ElementType }[] = [
  { id: "data", label: "Data", icon: Database },
  { id: "style", label: "Colors", icon: Paintbrush },
  { id: "settings", label: "Settings", icon: Settings2 },
];

/* ═══════════════════════════════════════════════════════════════════════
 * MAIN PAGE (wrapped in Suspense for useSearchParams)
 * ═══════════════════════════════════════════════════════════════════ */
export default function EditChartPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 items-center justify-center bg-background">
          <div className="size-8 animate-spin rounded-full border-2 border-[#6C5DD3]/20 border-t-[#6C5DD3]" />
        </div>
      }
    >
      <EditChartContent />
    </Suspense>
  );
}

function EditChartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chartId = searchParams.get("chart");

  const allCharts = useAllCharts();
  const updateChart = useChartsStore((s) => s.updateChart);
  const addChart = useChartsStore((s) => s.addChart);

  const isCreateMode = !chartId;

  /* ── Chart selection ─────────────────────────────────────────────── */
  const [selectedId, setSelectedId] = useState<string | null>(chartId);
  const sourceChart = selectedId
    ? (allCharts.find((c) => c.id === selectedId) ?? null)
    : null;

  /* Sync selectedId from URL when it changes (e.g. nav from dropdown) */
  useEffect(() => {
    if (chartId && chartId !== selectedId) {
      setSelectedId(chartId);
    }
  }, [chartId, selectedId]);

  /* ── Working copy (editable state) ───────────────────────────────── */
  const [title, setTitle] = useState(isCreateMode ? "Untitled Chart" : "");
  const [chartType, setChartType] = useState<string>(
    isCreateMode ? DEFAULT_CHART_TYPE : "",
  );
  const [data, setData] = useState<unknown>(
    isCreateMode ? cloneData(DEFAULT_CREATE_DATA) : null,
  );
  const [withTooltip, setWithTooltip] = useState(true);
  const [withAnimation, setWithAnimation] = useState(true);
  const [activeTab, setActiveTab] = useState<EditorTab>("data");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [incompatibleTypeTarget, setIncompatibleTypeTarget] =
    useState<ChartTypeKey | null>(null);

  /* Sync working state from sourceChart only when editing (never in create mode; never overwrite dirty edits) */
  const prevChartIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sourceChart) return;
    const id = sourceChart.id;
    const isChartSwitch =
      prevChartIdRef.current !== null && prevChartIdRef.current !== id;
    prevChartIdRef.current = id;
    if (!isChartSwitch && dirty) return; // Keep user's edits when same chart
    setTitle(sourceChart.title);
    setChartType(sourceChart.chartType);
    setData(cloneData(sourceChart.data));
    setWithTooltip(sourceChart.withTooltip ?? true);
    setWithAnimation(sourceChart.withAnimation ?? true);
    setDirty(false);
    setSaved(false);
  }, [sourceChart?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- sync from sourceChart, only when id changes

  /* Mark dirty on any edit */
  const edit = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
      (val: React.SetStateAction<T>) => {
        setter(val);
        setDirty(true);
        setSaved(false);
      },
    [],
  );

  /* ── Live preview ────────────────────────────────────────────────── */
  const previewEl = useMemo(() => {
    if (!data || !chartType) return null;
    return getChartTypeByName(
      data as Parameters<typeof getChartTypeByName>[0],
      chartType,
      {
        withTooltip,
        withAnimation,
        className: "min-h-[320px] w-full",
      },
    );
  }, [data, chartType, withTooltip, withAnimation]);

  /* ── Save handler ────────────────────────────────────────────────── */
  const handleSave = useCallback(() => {
    if (isCreateMode) {
      const newId = addChart({
        title: title || "Untitled Chart",
        chartType: chartType as ChartTypeKey,
        data,
        withTooltip,
        withAnimation,
      });
      setDirty(false);
      setSaved(true);
      setSelectedId(newId);
      prevChartIdRef.current = newId;
      router.replace(`/edit?chart=${newId}`);
      return;
    }
    if (!selectedId) return;
    const newId = updateChart(selectedId, {
      title,
      chartType: chartType as ChartTypeKey,
      data,
      withTooltip,
      withAnimation,
    });
    setDirty(false);
    setSaved(true);
    if (newId !== selectedId) {
      setSelectedId(newId);
      router.replace(`/edit?chart=${newId}`);
    }
  }, [
    isCreateMode,
    selectedId,
    title,
    chartType,
    data,
    withTooltip,
    withAnimation,
    addChart,
    updateChart,
    router,
  ]);

  /* ── Reset handler ───────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    if (isCreateMode) {
      setTitle("Untitled Chart");
      setChartType(DEFAULT_CHART_TYPE);
      setData(cloneData(DEFAULT_CREATE_DATA));
      setWithTooltip(true);
      setWithAnimation(true);
      setDirty(false);
      setSaved(false);
      return;
    }
    if (!sourceChart) return;
    setTitle(sourceChart.title);
    setChartType(sourceChart.chartType);
    setData(cloneData(sourceChart.data));
    setWithTooltip(sourceChart.withTooltip ?? true);
    setWithAnimation(sourceChart.withAnimation ?? true);
    setDirty(false);
    setSaved(false);
  }, [isCreateMode, sourceChart]);

  /* ── Editor shape (which fields to show) ─────────────────────────── */
  const editorShape = chartType ? getEditorShape(chartType) : null;

  /* No chart and not create mode → redirect back to charts */
  useEffect(() => {
    if (!isCreateMode && (!selectedId || !sourceChart)) {
      router.replace("/charts");
    }
  }, [isCreateMode, selectedId, sourceChart, router]);

  if (!isCreateMode && (!selectedId || !sourceChart)) {
    return null;
  }

  /* ═══════════════════════════════════════════════════════════════════
   * EDITOR VIEW
   * ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-4 sm:pb-6 md:px-6 md:pb-8">
        <div className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-4 sm:gap-5">
          {/* ── Top bar ─────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.replace("/charts")}
              className="gap-2 text-[#3D4035]/70 hover:text-[#3D4035]"
            >
              <ArrowLeft className="size-4" />
              {isCreateMode ? "Charts" : "All charts"}
            </Button>

            <div className="flex-1" />

            {dirty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-2 text-[#3D4035]/60 hover:text-[#3D4035]"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            )}

            <Button
              size="sm"
              disabled={!dirty && !isCreateMode}
              onClick={handleSave}
              className={cn(
                "gap-2 rounded-xl text-[12px] font-semibold transition-all",
                dirty
                  ? "bg-[#6C5DD3] text-white hover:bg-[#5a4dbf]"
                  : saved
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-[#3D4035]/10 text-[#3D4035]/40",
              )}
            >
              <Save className="size-3.5" />
              {saved ? "Saved" : isCreateMode ? "Create chart" : "Save changes"}
            </Button>
          </div>

          {/* ── Stacked: chart on top, edition below. Side-by-side only when very wide (xl+) so stacked when chat sidebar is visible ── */}
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[1fr_minmax(360px,440px)] 2xl:grid-cols-[1fr_minmax(400px,500px)]">
            {/* Chart preview (top when stacked) */}
            <div className="order-1 flex min-w-0 flex-col gap-4 sm:gap-5">
              {/* Title + type */}
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[28px] sm:p-5 lg:rounded-[40px] lg:p-6">
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="chart-title"
                      className="text-[12px] font-medium text-[#3D4035]/60"
                    >
                      Chart title
                    </Label>
                    <Input
                      id="chart-title"
                      value={title}
                      onChange={(e) => edit(setTitle)(e.target.value)}
                      className="w-full rounded-xl border-black/[0.06] bg-white/60 text-[15px] font-medium text-[#3D4035] focus-visible:ring-[#6C5DD3]/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-medium text-[#3D4035]/60">
                      Chart type
                    </Label>
                    <Select
                      value={chartType}
                      onValueChange={(v) => {
                        const newType = v as ChartTypeKey;
                        const compatible = isChartTypeCompatible(
                          chartType as ChartTypeKey,
                          newType,
                        );
                        if (compatible) {
                          const transformed = transformChartData(
                            data,
                            chartType as ChartTypeKey,
                            newType,
                          );
                          setData(transformed);
                          edit(setChartType)(v);
                        } else {
                          setIncompatibleTypeTarget(newType);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border-black/[0.06] bg-white/60 text-[14px] sm:w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {chartTypes.map((ct) => {
                          const compatible = isChartTypeCompatible(
                            chartType as ChartTypeKey,
                            ct.key as ChartTypeKey,
                          );
                          return (
                            <SelectItem key={ct.key} value={ct.key}>
                              <span className="flex items-center gap-2">
                                {ct.label}
                                {!compatible && (
                                  <Lock className="size-3.5 shrink-0 text-[#3D4035]/40" />
                                )}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Chart preview */}
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[28px] sm:p-6 lg:rounded-[40px] lg:p-8">
                <div className="mb-2 flex items-center gap-2 sm:mb-3">
                  <Eye className="size-4 shrink-0 text-[#3D4035]/40" />
                  <span className="text-[12px] font-medium tracking-wide text-[#3D4035]/40 uppercase">
                    Live Preview
                  </span>
                </div>
                <div className="min-h-[220px] w-full sm:min-h-[280px] lg:min-h-[360px]">
                  {previewEl}
                </div>
              </div>
            </div>

            {/* Edition panel (below chart when stacked) */}
            <div className="order-2 flex min-w-0 flex-col gap-4 sm:gap-5">
              {/* Tab switcher */}
              <div className="flex gap-1 rounded-xl bg-white/80 p-1 shadow-sm ring-1 ring-black/[0.02] sm:rounded-2xl">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium transition-colors sm:gap-2 sm:rounded-xl sm:px-3 sm:text-[13px]",
                        activeTab === tab.id
                          ? "bg-[#6C5DD3]/10 text-[#6C5DD3]"
                          : "text-[#3D4035]/50 hover:bg-black/[0.03] hover:text-[#3D4035]/70",
                      )}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Panel content */}
              <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[28px] sm:p-5 lg:rounded-[40px] lg:p-6">
                {activeTab === "data" && editorShape && (
                  <DataEditor
                    shape={editorShape}
                    data={data}
                    onChange={(d) => edit(setData)(d)}
                  />
                )}
                {activeTab === "style" && editorShape && (
                  <StyleEditor
                    shape={editorShape}
                    data={data}
                    onChange={(d) => edit(setData)(d)}
                  />
                )}
                {activeTab === "settings" && (
                  <SettingsEditor
                    withTooltip={withTooltip}
                    withAnimation={withAnimation}
                    onTooltipChange={(v) => edit(setWithTooltip)(v)}
                    onAnimationChange={(v) => edit(setWithAnimation)(v)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!incompatibleTypeTarget}
        onOpenChange={(open) => !open && setIncompatibleTypeTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Switch chart type?</AlertDialogTitle>
            <AlertDialogDescription>
              This chart type uses different data. Your current data will be
              removed and replaced with defaults. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (incompatibleTypeTarget) {
                  setChartType(incompatibleTypeTarget);
                  setData(getDefaultDataForChartType(incompatibleTypeTarget));
                  setDirty(true);
                  setSaved(false);
                  setIncompatibleTypeTarget(null);
                }
              }}
              className="bg-[#6C5DD3] text-white hover:bg-[#5a4dbf]"
            >
              Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * SETTINGS EDITOR
 * ═══════════════════════════════════════════════════════════════════ */

function SettingsEditor({
  withTooltip,
  withAnimation,
  onTooltipChange,
  onAnimationChange,
}: {
  withTooltip: boolean;
  withAnimation: boolean;
  onTooltipChange: (v: boolean) => void;
  onAnimationChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
        Display options
      </h3>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]">
        <div>
          <p className="text-[14px] font-medium text-[#3D4035]">Tooltips</p>
          <p className="text-[12px] text-[#3D4035]/50">Show value on hover</p>
        </div>
        <Switch checked={withTooltip} onCheckedChange={onTooltipChange} />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]">
        <div>
          <p className="text-[14px] font-medium text-[#3D4035]">Animation</p>
          <p className="text-[12px] text-[#3D4035]/50">Animate chart on load</p>
        </div>
        <Switch checked={withAnimation} onCheckedChange={onAnimationChange} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * DATA EDITOR (table-like rows per data shape)
 * ═══════════════════════════════════════════════════════════════════ */

interface EditorProps {
  shape: EditorShape;
  data: unknown;
  onChange: (data: unknown) => void;
}

function DataEditor({ shape, data, onChange }: EditorProps) {
  const arr = Array.isArray(data) ? data : [];

  /* ── Generic row updater ─────────────────────────────────────────── */
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
          className="gap-1.5 text-[12px] text-[#6C5DD3] hover:text-[#5a4dbf]"
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      <div className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto pr-1 sm:max-h-[45vh] md:max-h-[50vh] lg:max-h-[56vh]">
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

  /* Compact field for most shapes */
  const label =
    (item.key as string) || (item.name as string) || `#${index + 1}`;

  return (
    <div className="rounded-xl bg-white/60 ring-1 ring-black/[0.03] overflow-hidden">
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
        <div className="border-t border-black/[0.03] px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* ── Key/Value (bar, breakdown, benchmark, gradient, thin) ── */}
            {shape === "keyValue" && (
              <>
                <FieldRow label="Label">
                  <Input
                    value={(item.key as string) ?? ""}
                    onChange={(e) => onUpdate({ key: e.target.value })}
                    className="h-8 rounded-lg text-[13px]"
                  />
                </FieldRow>
                <FieldRow label="Value">
                  <Input
                    type="number"
                    value={item.value as number}
                    onChange={(e) =>
                      onUpdate({ value: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 rounded-lg text-[13px]"
                  />
                </FieldRow>
              </>
            )}

            {/* ── Bar Image ────────────────────────── */}
            {shape === "bar-image" && (
              <>
                <FieldRow label="Label">
                  <Input
                    value={(item.key as string) ?? ""}
                    onChange={(e) => onUpdate({ key: e.target.value })}
                    className="h-8 rounded-lg text-[13px]"
                  />
                </FieldRow>
                <FieldRow label="Value">
                  <Input
                    type="number"
                    value={item.value as number}
                    onChange={(e) =>
                      onUpdate({ value: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 rounded-lg text-[13px]"
                  />
                </FieldRow>
                <FieldRow label="Image URL">
                  <Input
                    value={(item.image as string) ?? ""}
                    onChange={(e) => onUpdate({ image: e.target.value })}
                    className="h-8 rounded-lg text-[13px]"
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
                    className="h-8 rounded-lg text-[13px]"
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
                          className="h-8 flex-1 rounded-lg text-[13px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const vals = (
                              (item.values as number[]) ?? []
                            ).filter((_: number, i: number) => i !== vi);
                            onUpdate({ values: vals });
                          }}
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
                <FieldRow label="Name">
                  <Input
                    value={(item.name as string) ?? ""}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    className="h-8 rounded-lg text-[13px]"
                  />
                </FieldRow>
                <FieldRow label="Value">
                  <Input
                    type="number"
                    value={item.value as number}
                    onChange={(e) =>
                      onUpdate({ value: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 rounded-lg text-[13px]"
                  />
                </FieldRow>
                {typeof item.logo === "string" && (
                  <FieldRow label="Logo URL">
                    <Input
                      value={item.logo}
                      onChange={(e) => onUpdate({ logo: e.target.value })}
                      className="h-8 rounded-lg text-[13px]"
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

            {/* ── Scatter ──────────────────────────── */}
            {shape === "scatter" && (
              <>
                <FieldRow label="Name">
                  <Input
                    value={(item.name as string) ?? ""}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    className="h-8 rounded-lg text-[13px]"
                  />
                </FieldRow>
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="X value">
                    <Input
                      type="number"
                      value={item.xValue as number}
                      onChange={(e) =>
                        onUpdate({ xValue: parseFloat(e.target.value) || 0 })
                      }
                      className="h-8 rounded-lg text-[13px]"
                    />
                  </FieldRow>
                  <FieldRow label="Y value">
                    <Input
                      type="number"
                      value={item.yValue as number}
                      onChange={(e) =>
                        onUpdate({ yValue: parseFloat(e.target.value) || 0 })
                      }
                      className="h-8 rounded-lg text-[13px]"
                    />
                  </FieldRow>
                </div>
              </>
            )}

            {/* Remove button */}
            <div className="flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="gap-1.5 text-[12px] text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-3" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
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
            className="h-8 flex-1 rounded-lg text-[12px]"
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
          className="h-8 rounded-lg text-[13px]"
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
                  className="h-8 flex-1 rounded-lg text-[12px]"
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

/* ═══════════════════════════════════════════════════════════════════════
 * STYLE / COLOR EDITOR
 * ═══════════════════════════════════════════════════════════════════ */

function StyleEditor({ shape, data, onChange }: EditorProps) {
  const arr = Array.isArray(data) ? data : [];

  const updateRow = useCallback(
    (idx: number, patch: Record<string, unknown>) => {
      const next = [...arr];
      next[idx] = { ...next[idx], ...patch };
      onChange(next);
    },
    [arr, onChange],
  );

  /* Which color fields the shape uses */
  const hasColor = ["keyValue", "bar-image", "scatter"].includes(shape);
  const hasGradient = shape === "pie";

  if (!hasColor && !hasGradient) {
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
      <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
        Colors
      </h3>

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

              {hasColor && (
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

/* ═══════════════════════════════════════════════════════════════════════
 * SHARED UI
 * ═══════════════════════════════════════════════════════════════════ */

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] font-medium text-[#3D4035]/50">{label}</span>
      {children}
    </div>
  );
}
