"use client";

import { Suspense, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getChartTypeByName } from "@/components/rosencharts";
import type { ChartTypeKey } from "@/components/rosencharts";
import { useChartByIdWithStatus, useChartsMutations } from "@/hooks/use-charts";
import { useChartsStore } from "@/stores/charts-store";
import { useChatbotStore } from "@/stores/chatbot-store";
import { Navbar } from "@/components/layout/navbar";
import {
  EditorTopBar,
  ChartPreview,
  EditorPanel,
  IncompatibleTypeDialog,
  type EditorTab,
  getEditorShape,
  cloneData,
  getDefaultDataForChartType,
  DEFAULT_CHART_TYPE,
  DEFAULT_CREATE_DATA,
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
  const removeUnsavedChart = useChartsStore((s) => s.removeUnsavedChart);
  const {
    setAttachedChartContext,
    setSelectedChartKey,
    setInput,
    setChatSidebarView,
  } = useChatbotStore();

  const isCreateMode = !chartId;

  /* ── Chart selection ─────────────────────────────────────────────── */
  const [selectedId, setSelectedId] = useState<string | null>(chartId);
  const { chart: sourceChart, isLoading: chartLoading, isNotFound: chartMissing } = useChartByIdWithStatus(selectedId ?? undefined);

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
    setWithTooltip(sourceChart.withTooltip ?? true);
    setWithAnimation(sourceChart.withAnimation ?? true);
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
  const previewEl = useMemo(() => {
    if (!data || !chartType) return null;
    return getChartTypeByName(
      data as Parameters<typeof getChartTypeByName>[0],
      chartType,
      { withTooltip, withAnimation, className: "min-h-[320px] w-full" },
    );
  }, [data, chartType, withTooltip, withAnimation]);

  /* ── Save handler ────────────────────────────────────────────────── */
  const [saving, setSaving] = useState(false);
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (isCreateMode) {
        const newId = await mutations.create({
          title: title || "Untitled Chart",
          chartType,
          data,
          source: "Manual",
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
      const isUnsaved = selectedId.startsWith("unsaved-");
      if (isUnsaved) {
        const newId = await mutations.create({
          title: title || "Untitled Chart",
          chartType,
          data,
          source: "From chat",
          withTooltip,
          withAnimation,
        });
        removeUnsavedChart(selectedId);
        setDirty(false);
        setSaved(true);
        setSelectedId(newId);
        prevChartIdRef.current = newId;
        router.replace(`/edit?chart=${newId}`);
      } else {
        await mutations.update(selectedId as any, {
          title,
          chartType,
          data,
          withTooltip,
          withAnimation,
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
    title,
    chartType,
    data,
    withTooltip,
    withAnimation,
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
    });
    setSelectedChartKey(chartType);
    setInput("Help me improve this chart");
    setChatSidebarView("chat");
  }, [title, chartType, data, setAttachedChartContext, setSelectedChartKey, setInput, setChatSidebarView]);

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

  /* ── Editor shape ────────────────────────────────────────────────── */
  const editorShape = chartType ? getEditorShape(chartType) : null;

  /* No chart and not create mode → redirect when chart not found */
  useEffect(() => {
    if (!isCreateMode && chartMissing) router.replace("/charts");
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
            dirty={dirty}
            saved={saved}
            saving={saving}
            onBack={() => router.replace("/charts")}
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
              editorShape={editorShape}
              data={data}
              onDataChange={(d) => edit(setData)(d)}
              withTooltip={withTooltip}
              withAnimation={withAnimation}
              onTooltipChange={(v) => edit(setWithTooltip)(v)}
              onAnimationChange={(v) => edit(setWithAnimation)(v)}
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
