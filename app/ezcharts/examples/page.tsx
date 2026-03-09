"use client";

import { useState } from "react";
import { renderChart } from "@/lib/chart/chart-render";
import { data } from "@/components/charts/rosencharts/fixture/exampleChartsData";
import { shadcnExampleData } from "@/components/charts/shadcn-charts/fixture/exampleChartsData";
import { LIBRARY_DISPLAY } from "@/lib/chart/chart-keys";

const TABS = [
  { id: "rosencharts", label: LIBRARY_DISPLAY.rosencharts },
  { id: "shadcn", label: LIBRARY_DISPLAY.shadcn },
] as const;

export default function ExamplesPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("rosencharts");

  const items = activeTab === "rosencharts" ? data : shadcnExampleData;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-background">
      <div className="px-3 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
          <header className="space-y-4">
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Chart Examples
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              All available chart types — {LIBRARY_DISPLAY.rosencharts} and{" "}
              {LIBRARY_DISPLAY.shadcn}
            </p>

            <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const {
                id: _id,
                name: _name,
                chartType: _ct,
                data: _data,
                ...rest
              } = item as Record<string, unknown>;
              const chartType = item.chartType as string;
              const isPieOrDonut =
                chartType === "shadcn:donut" ||
                chartType === "shadcn:pie" ||
                chartType === "shadcn:pie-stacked" ||
                chartType === "shadcn:radial" ||
                ["donut", "pie", "pie-image", "fillable-donut", "half-donut"].includes(chartType);
              const chartClassName = isPieOrDonut
                ? "aspect-square min-h-[280px] w-full"
                : "min-h-[200px] w-full";
              const chart = renderChart(item.data, item.chartType, {
                chartSettings: {
                  withTooltip: true,
                  withAnimation: true,
                  ...rest,
                },
                className: chartClassName,
              });

              if (!chart) return null;

              return (
                <section
                  key={item.id}
                  className="flex flex-col gap-3 rounded-[28px] border border-border/40 bg-white/80 p-5 shadow-sm sm:rounded-[40px] sm:p-8"
                >
                  <h2 className="text-base font-semibold text-foreground sm:text-lg">
                    {item.name}
                  </h2>
                  <div
                    className={
                      isPieOrDonut ? "min-h-[320px] w-full" : "min-h-[220px] w-full"
                    }
                  >
                    {chart}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
