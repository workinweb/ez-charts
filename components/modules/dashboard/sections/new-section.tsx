"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChartsMutations } from "@/hooks/use-charts";
import { useFeatureCheck } from "@/hooks/use-feature-check";
import { renderChart } from "@/lib/chart/chart-render";
import { cn } from "@/lib/utils";
import { useChartsStore } from "@/stores/charts-store";
import { Pencil, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatChartTime(id: string): string {
  const match = id.match(/^unsaved-(\d+)-/);
  if (!match) return "";
  const ts = parseInt(match[1], 10);
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - ts;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24 && d.getDate() === now.getDate())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffHours < 48)
    return `Yesterday ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NewSection() {
  const router = useRouter();
  const { canUse } = useFeatureCheck();
  const chartAllowed = canUse("createChart");
  const unsavedCharts = useChartsStore((s) => s.unsavedCharts);
  const removeUnsavedChart = useChartsStore((s) => s.removeUnsavedChart);
  const previewChartId = useChartsStore((s) => s.previewChartId);
  const setPreviewChartId = useChartsStore((s) => s.setPreviewChartId);
  const mutations = useChartsMutations();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [chartToSave, setChartToSave] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);

  const latestChart = unsavedCharts[unsavedCharts.length - 1] ?? null;
  const displayChart =
    (previewChartId
      ? unsavedCharts.find((c) => c.id === previewChartId)
      : null) ?? latestChart;
  const historyCharts = [...unsavedCharts].reverse();

  const openSaveDialog = (chartId: string) => {
    const chart = unsavedCharts.find((c) => c.id === chartId);
    setChartToSave(chartId);
    setSaveName(chart?.title ?? "");
    setSaveDialogOpen(true);
  };

  const handleSave = async () => {
    if (!chartToSave || !saveName.trim()) return;
    const chart = unsavedCharts.find((c) => c.id === chartToSave);
    if (!chart) return;
    setSaving(true);
    try {
      const chartSettings = chart.chartSettings;
      const newId = await mutations.create({
        title: saveName.trim(),
        chartType: chart.chartType,
        data: chart.data,
        source: chart.source ?? "From chat",
        withTooltip: chart.withTooltip,
        withAnimation: chart.withAnimation,
        ...(chartSettings && Object.keys(chartSettings).length > 0 && {
          chartSettings,
        }),
      });
      removeUnsavedChart(chartToSave);
      setSaveDialogOpen(false);
      setChartToSave(null);
      setSaveName("");
      router.push(`/ezcharts/charts/${newId}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex min-h-[calc(100vh-12rem)] flex-col gap-6 rounded-2xl bg-background py-4 sm:py-6">
        {/* Header */}
        {/* <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#6C5DD3]/12">
              <Sparkles className="size-5 text-[#6C5DD3]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Builds</h2>
              <p className="text-sm text-muted-foreground">
                Charts being built by the AI assistant. Save with a custom name
                or view the history below.
              </p>
            </div>
          </div>
        </div> */}

        {/* Current build + Save */}
        {displayChart ? (
          <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.04] sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-medium text-foreground">
                {displayChart.title}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="gap-2 text-[#3D4035]/70 hover:text-[#3D4035]"
                >
                  <Link href={`/ezcharts/edit?chart=${displayChart.id}`}>
                    <Pencil className="size-3.5" />
                    Edit
                  </Link>
                </Button>
                <Button
                  size="sm"
                  onClick={() => openSaveDialog(displayChart.id)}
                  disabled={!chartAllowed.allowed}
                  title={
                    !chartAllowed.allowed ? chartAllowed.reason : undefined
                  }
                  className="gap-2 bg-[#6C5DD3] text-white hover:bg-[#5a4dbf] disabled:opacity-50"
                >
                  <Save className="size-3.5" />
                  Save Chart
                </Button>
              </div>
            </div>
            <div className="min-h-[220px] overflow-hidden rounded-xl bg-white/60 ring-1 ring-black/[0.03] p-5">
              {renderChart(displayChart.data, displayChart.chartType, {
                withTooltip: displayChart.withTooltip ?? true,
                withAnimation: displayChart.withAnimation ?? true,
                chartSettings: displayChart.chartSettings,
                className: "w-full",
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/60 py-16 ring-1 ring-black/[0.03]">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#6C5DD3]/10">
              <Sparkles className="size-8 text-[#6C5DD3]/50" />
            </div>
            <div className="text-center">
              <h3 className="text-[15px] font-medium text-foreground">
                No charts yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Ask the AI assistant in the chat to create a chart. Charts will
                appear here as they’re built.
              </p>
            </div>
          </div>
        )}

        {/* History */}
        {historyCharts.length > 0 ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <h3 className="shrink-0 text-[14px] font-medium text-foreground">
              History ({historyCharts.length})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {historyCharts.map((chart) => {
                const Icon = chart.icon;
                return (
                  <div
                    key={chart.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border border-black/[0.06] bg-white/80 p-3 transition-colors hover:bg-white",
                      chart.id === displayChart?.id &&
                        "ring-2 ring-[#6C5DD3]/30",
                    )}
                    onClick={() => setPreviewChartId(chart.id)}
                  >
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg",
                        chart.iconBg,
                      )}
                    >
                      <Icon
                        className={cn("size-5", chart.iconColor)}
                        strokeWidth={1.7}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-foreground">
                        {chart.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {chart.chartType}
                        {formatChartTime(chart.id) && (
                          <span className="ml-1.5 text-muted-foreground/70">
                            · {formatChartTime(chart.id)}
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Edit chart"
                      title="Edit chart"
                    >
                      <Link href={`/ezcharts/edit?chart=${chart.id}`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSaveDialog(chart.id);
                      }}
                      disabled={!chartAllowed.allowed}
                      aria-label="Save chart"
                      title={
                        !chartAllowed.allowed
                          ? chartAllowed.reason
                          : "Save chart"
                      }
                    >
                      <Save className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="min-h-[200px] flex-1" />
        )}
      </div>

      {/* Save Chart dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save chart</DialogTitle>
          </DialogHeader>
          <Field>
            <FieldLabel>Chart name</FieldLabel>
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="My chart"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!saveName.trim() || saving || !chartAllowed.allowed}
              title={!chartAllowed.allowed ? chartAllowed.reason : undefined}
              className="bg-[#6C5DD3] text-white hover:bg-[#5a4dbf]"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
