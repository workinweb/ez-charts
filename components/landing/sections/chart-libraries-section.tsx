"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderChart } from "@/lib/chart-render";
import { shadcnExampleData } from "@/components/charts/shadcn-charts/fixture/exampleChartsData";
import { data as rosenchartsData } from "@/components/charts/rosencharts/fixture/exampleChartsData";
import { LIBRARY_DISPLAY } from "@/lib/chart-keys";

const RC_TYPES = ["donut", "treemap", "scatter", "breakdown"] as const;
const rcCharts = RC_TYPES.map(
  (ct) => rosenchartsData.find((item) => item.chartType === ct)!,
).map((item) => ({ ...item, id: `rc-${item.id}` }));

const CHART_SAMPLES = [
  ...shadcnExampleData.slice(0, 5), // Bar, Area, Line, Pie, Radar
  ...rcCharts,
  ...rosenchartsData
    .filter((item) => item.chartType === "line")
    .slice(0, 1)
    .map((item) => ({ ...item, id: `rc-${item.id}` })),
];

const AUTO_ADVANCE_MS = 4000;

export function ChartLibrariesSection() {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const itemCount = CHART_SAMPLES.length;

  const goPrev = () => setIndex((i) => (i > 0 ? i - 1 : itemCount - 1));
  const goNext = () => setIndex((i) => (i < itemCount - 1 ? i + 1 : 0));

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(
      () => setIndex((i) => (i < itemCount - 1 ? i + 1 : 0)),
      AUTO_ADVANCE_MS,
    );
    return () => clearInterval(id);
  }, [autoPlay, itemCount]);

  const item = CHART_SAMPLES[index];
  const chart = renderChart(item.data, item.chartType, {
    withTooltip: "withTooltip" in item ? item.withTooltip : true,
    withAnimation: "withAnimation" in item ? item.withAnimation : true,
    className: "min-h-[280px] w-full",
  });

  return (
    <section id="chart-libraries" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <div className="mb-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6C5DD3]">
              Chart libraries
            </div>
            <h2 className="text-3xl font-medium uppercase leading-tight tracking-tight text-slate-900 md:text-5xl">
              Multiple libraries <br />
              <span className="text-slate-400">and more to come</span>
            </h2>
          </div>
          <div className="flex max-w-sm flex-col gap-6">
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              {LIBRARY_DISPLAY.rosencharts} and {LIBRARY_DISPLAY.shadcn} — bar, donut, scatter, treemap, breakdown.
              Pick the right chart for your data.
            </p>
            <div className=" flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Preview
              </span>
              <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setAutoPlay(true)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                    autoPlay
                      ? "bg-[#6C5DD3]/20 text-[#6C5DD3]"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  Automatic
                </button>
                <button
                  type="button"
                  onClick={() => setAutoPlay(false)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                    !autoPlay
                      ? "bg-[#6C5DD3]/20 text-[#6C5DD3]"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  Manual
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-all hover:bg-slate-50 hover:shadow-lg"
            aria-label="Previous chart"
          >
            <ChevronLeft className="size-6" />
          </button>

          <div className="min-h-[380px] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            {chart && (
              <>
                <h3 className="mb-5  text-xl font-bold text-slate-900">
                  {item.name}
                </h3>
                <div className="min-h-[320px] w-full overflow-hidden rounded-xl p-5 bg-slate-50">
                  {chart}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-all hover:bg-slate-50 hover:shadow-lg"
            aria-label="Next chart"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {CHART_SAMPLES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`size-2 rounded-full transition-colors ${
                i === index ? "bg-[#6C5DD3]" : "bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to chart ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
