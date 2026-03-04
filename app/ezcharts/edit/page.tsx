"use client";

import { Navbar } from "@/components/layout/navbar";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useChartByIdWithStatus, useChartsMutations } from "@/hooks/use-charts";
import { useFeatureCheck } from "@/hooks/use-feature-check";
import { renderChart } from "@/lib/chart/chart-render";
import { useChartsStore } from "@/stores/charts-store";
import { useChatbotStore } from "@/stores/chatbot-store";
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChartPreview,
  cloneData,
  DEFAULT_CHART_TYPE,
  DEFAULT_CREATE_DATA,
  EditorPanel,
  EditorTopBar,
  getDefaultDataForChartType,
  getEditorShape,
  IncompatibleTypeDialog,
  type EditorTab,
} from "./_components";

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

  const mutations = useChartsMutations();
  const { canUse } = useFeatureCheck();
  const chartAllowed = canUse("createChart");
  const removeUnsavedChart = useChartsStore((s) => s.removeUnsavedChart);
  const userSettings = useQuery(api.userSettings.get);
  const { setAttachedChartContext, setSelectedChartKey, setChatSidebarView } =
    useChatbotStore();

  const isCreateMode = !chartId;

  /* ── Chart selection: URL is source of truth; createdId for create→save flow */
  const [createdId, setCreatedId] = useState<string | null>(null);
  const selectedId = chartId ?? createdId;
  const {
    chart: sourceChart,
    isLoading: chartLoading,
    isNotFound: chartMissing,
  } = useChartByIdWithStatus(selectedId ?? undefined);

  /* ── Working copy (editable state) ───────────────────────────────── */
  const [title, setTitle] = useState(isCreateMode ? "Untitled Chart" : "");
  const [chartType, setChartType] = useState<string>(
    isCreateMode ? DEFAULT_CHART_TYPE : "",
  );
  const [data, setData] = useState<unknown>(
    isCreateMode ? cloneData(DEFAULT_CREATE_DATA) : null,
  );
  const [chartSettings, setChartSettings] = useState<Record<string, unknown>>(
    {},
  );
  const [activeTab, setActiveTab] = useState<EditorTab>("data");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [incompatibleTypeTarget, setIncompatibleTypeTarget] = useState<
    string | null
  >(null);

  /* Sync working state from sourceChart */
  const prevChartIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sourceChart) return;
    const id = sourceChart.id;
    const isChartSwitch =
      prevChartIdRef.current !== null && prevChartIdRef.current !== id;
    prevChartIdRef.current = id;
    if (!isChartSwitch && dirty) return;
    setTitle(sourceChart.title);
    setChartType(sourceChart.chartType);
    setData(cloneData(sourceChart.data));
    const existing = (sourceChart as { chartSettings?: Record<string, unknown> })
      .chartSettings ?? {};
    setChartSettings({
      ...existing,
      withTooltip: (existing.withTooltip as boolean | undefined) ?? sourceChart.withTooltip ?? true,
      withAnimation: (existing.withAnimation as boolean | undefined) ?? sourceChart.withAnimation ?? true,
    });
    setDirty(false);
    setSaved(false);
  }, [sourceChart?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const mergedChartSettings = useMemo(
    () => ({
      withTooltip: (chartSettings.withTooltip as boolean | undefined) ?? true,
      withAnimation: (chartSettings.withAnimation as boolean | undefined) ?? true,
      ...chartSettings,
    }),
    [chartSettings],
  );
  const handleActiveIndexChange = useCallback(
    (index: number) => {
      edit(setChartSettings)((prev: Record<string, unknown>) => ({
        ...prev,
        activeIndex: index,
      }));
    },
    [edit],
  );
  const previewEl = useMemo(() => {
    if (!data || !chartType) return null;
    return renderChart(data, chartType, {
      chartSettings: mergedChartSettings,
      className: "min-h-[320px] w-full",
      onActiveIndexChange:
        chartType === "shadcn:donut" ? handleActiveIndexChange : undefined,
    });
  }, [data, chartType, mergedChartSettings, handleActiveIndexChange]);

  /* ── Save handler ────────────────────────────────────────────────── */
  const [saving, setSaving] = useState(false);
  const handleSave = useCallback(async () => {
    if (
      (isCreateMode || !!selectedId?.startsWith("unsaved-")) &&
      !chartAllowed.allowed
    ) {
      return;
    }
    setSaving(true);
    try {
      if (isCreateMode) {
        const newId = await mutations.create({
          title: title || "Untitled Chart",
          chartType,
          data,
          source: "Manual",
          withTooltip: (chartSettings.withTooltip as boolean | undefined) ?? true,
          withAnimation: (chartSettings.withAnimation as boolean | undefined) ?? true,
          chartSettings: Object.keys(chartSettings).length
            ? chartSettings
            : undefined,
        });
        setDirty(false);
        setSaved(true);
        setCreatedId(newId);
        prevChartIdRef.current = newId;
        router.replace(`/ezcharts/edit?chart=${newId}`);
        return;
      }
      if (!selectedId) return;
      const isUnsaved = selectedId.startsWith("unsaved-");
      if (isUnsaved) {
        const newId = await mutations.create({
          title: title || "Untitled Chart",
          chartType,
          data,
          source: "From chat",
          withTooltip: (chartSettings.withTooltip as boolean | undefined) ?? true,
          withAnimation: (chartSettings.withAnimation as boolean | undefined) ?? true,
          chartSettings: Object.keys(chartSettings).length
            ? chartSettings
            : undefined,
        });
        removeUnsavedChart(selectedId);
        setDirty(false);
        setSaved(true);
        setCreatedId(newId);
        prevChartIdRef.current = newId;
        router.replace(`/ezcharts/edit?chart=${newId}`);
      } else {
        await mutations.update(selectedId as Id<"charts">, {
          title,
          chartType,
          data,
          withTooltip: (chartSettings.withTooltip as boolean | undefined) ?? true,
          withAnimation: (chartSettings.withAnimation as boolean | undefined) ?? true,
          chartSettings: Object.keys(chartSettings).length
            ? chartSettings
            : undefined,
        });
        setDirty(false);
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }, [
    isCreateMode,
    selectedId,
    chartAllowed.allowed,
    title,
    chartType,
    data,
    chartSettings,
    mutations,
    removeUnsavedChart,
    router,
  ]);

  /* ── Send to AI handler ───────────────────────────────────────────── */
  const handleSendToAI = useCallback(() => {
    setAttachedChartContext({
      title: title || "Untitled Chart",
      chartType,
      data: data ?? [],
      chartSettings,
    });
    setSelectedChartKey(chartType);
    setChatSidebarView("chat");
  }, [
    title,
    chartType,
    data,
    chartSettings,
    setAttachedChartContext,
    setSelectedChartKey,
    setChatSidebarView,
  ]);

  /* ── Reset handler ───────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    if (isCreateMode) {
      setTitle("Untitled Chart");
      setChartType(DEFAULT_CHART_TYPE);
      setData(cloneData(DEFAULT_CREATE_DATA));
      setChartSettings({});
      setDirty(false);
      setSaved(false);
      return;
    }
    if (!sourceChart) return;
    setTitle(sourceChart.title);
    setChartType(sourceChart.chartType);
    setData(cloneData(sourceChart.data));
    const existing = (sourceChart as { chartSettings?: Record<string, unknown> })
      .chartSettings ?? {};
    setChartSettings({
      ...existing,
      withTooltip: (existing.withTooltip as boolean | undefined) ?? sourceChart.withTooltip ?? true,
      withAnimation: (existing.withAnimation as boolean | undefined) ?? sourceChart.withAnimation ?? true,
    });
    setDirty(false);
    setSaved(false);
  }, [isCreateMode, sourceChart]);

  /* ── Editor shape ────────────────────────────────────────────────── */
  const editorShape = chartType ? getEditorShape(chartType) : null;

  /* ── Chart data editor mode (from Account → Editor preferences) ───── */
  const chartDataEditorMode = (userSettings?.chartDataEditorMode ?? "table") as
    | "table"
    | "items";

  /* No chart and not create mode → redirect when chart not found */
  useEffect(() => {
    if (!isCreateMode && chartMissing) router.replace("/ezcharts/charts");
  }, [isCreateMode, chartMissing, router]);

  if (!isCreateMode && !selectedId) return null;
  if (!isCreateMode && chartMissing) return null;
  if (!isCreateMode && chartLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
        <Navbar />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-[#6C5DD3]/20 border-t-[#6C5DD3]" />
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
   * EDITOR VIEW
   * ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-4 sm:pb-6 md:px-6 md:pb-8">
        <div className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-4 sm:gap-5">
          <EditorTopBar
            isCreateMode={isCreateMode}
            isUnsavedChart={!!selectedId?.startsWith("unsaved-")}
            dirty={dirty}
            saved={saved}
            saving={saving}
            saveDisabled={
              (isCreateMode || !!selectedId?.startsWith("unsaved-")) &&
              !chartAllowed.allowed
            }
            saveDisabledReason={chartAllowed.reason}
            onBack={() => router.replace("/ezcharts/charts")}
            onReset={handleReset}
            onSave={handleSave}
            onSendToAI={handleSendToAI}
          />

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[1fr_minmax(360px,440px)] 2xl:grid-cols-[1fr_minmax(400px,500px)]">
            <ChartPreview
              title={title}
              chartType={chartType}
              data={data}
              previewEl={previewEl}
              onTitleChange={(v) => edit(setTitle)(v)}
              onChartTypeChange={(type, transformed) => {
                if (transformed !== undefined) setData(transformed);
                edit(setChartType)(type);
              }}
              onIncompatibleType={setIncompatibleTypeTarget}
            />

            <EditorPanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
              chartType={chartType}
              editorShape={editorShape}
              data={data}
              onDataChange={(d) => edit(setData)(d)}
              chartSettings={chartSettings}
              onChartSettingsChange={(v) => edit(setChartSettings)(v)}
              chartDataEditorMode={chartDataEditorMode}
            />
          </div>
        </div>
      </div>

      <IncompatibleTypeDialog
        target={incompatibleTypeTarget}
        onCancel={() => setIncompatibleTypeTarget(null)}
        onConfirm={(target) => {
          setChartType(target);
          setData(getDefaultDataForChartType(target));
          setDirty(true);
          setSaved(false);
          setIncompatibleTypeTarget(null);
        }}
      />
    </div>
  );
}
