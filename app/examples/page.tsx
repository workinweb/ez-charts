"use client";

import { useState } from "react";
import Link from "next/link";
import { renderChart } from "@/lib/chart-render";
import { data as rosenchartsData } from "@/components/charts/rosencharts/fixture/exampleChartsData";
import { shadcnExampleData } from "@/components/charts/shadcn-charts/fixture/exampleChartsData";
import { LandingNavbar } from "@/components/landing/sections/navbar-section";
import { LIBRARY_DISPLAY } from "@/lib/chart-keys";

const TABS = [
  { id: "rosencharts", label: LIBRARY_DISPLAY.rosencharts },
  { id: "shadcn", label: LIBRARY_DISPLAY.shadcn },
] as const;

export default function ExamplesPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("rosencharts");

  const items = activeTab === "rosencharts" ? rosenchartsData : shadcnExampleData;

  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      <LandingNavbar />
      <main className="px-4 pt-28 pb-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <header className="mb-12">
            <h1 className="mb-2 text-3xl font-bold uppercase tracking-tight text-slate-900 sm:text-4xl">
              Chart examples
            </h1>
            <p className="text-lg font-medium text-slate-500">
              All available chart types — {LIBRARY_DISPLAY.rosencharts} and {LIBRARY_DISPLAY.shadcn}
            </p>

            <div className="mt-6 flex gap-1 rounded-xl bg-slate-100/80 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const chart = renderChart(item.data, item.chartType, {
                withTooltip: "withTooltip" in item ? item.withTooltip : true,
                withAnimation:
                  "withAnimation" in item ? item.withAnimation : true,
                className: "min-h-[200px] w-full",
              });

              if (!chart) return null;

              return (
                <section
                  key={item.id}
                  className="flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                    {item.name}
                  </h2>
                  <div className="min-h-[220px] w-full">{chart}</div>
                </section>
              );
            })}
          </div>

          <p className="mt-12 text-center text-sm text-slate-500">
            <Link href="/" className="font-medium text-[#6C5DD3] hover:underline">
              Back to home
            </Link>
            {" · "}
            <Link
              href="/ezcharts"
              className="font-medium text-[#6C5DD3] hover:underline"
            >
              Start creating
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
