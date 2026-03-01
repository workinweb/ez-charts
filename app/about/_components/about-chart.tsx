"use client";

import { renderChart } from "@/lib/chart/chart-render";

/** Fun pie chart: "What powers Ez2Chart" — playful breakdown with distinct colors */
const ABOUT_PIE_DATA = [
  { name: "AI Magic", value: 35, fill: "#6C5DD3" },   // purple — tech/AI
  { name: "Design", value: 25, fill: "#0D9488" },    // teal — creativity
  { name: "Data", value: 20, fill: "#2563EB" },    // blue — data/analytics
  { name: "Coffee", value: 15, fill: "#D97706" },  // amber — fuel
  { name: "Vibes", value: 5, fill: "#E11D48" },    // rose — fun
];

export function AboutChart() {
  const chart = renderChart(ABOUT_PIE_DATA, "shadcn:pie", {
    withTooltip: true,
    withAnimation: true,
    className: "min-h-[220px] w-full sm:min-h-[260px] lg:min-h-[280px]",
  });

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-sm sm:p-8 lg:p-10">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
        What powers Ez2Chart
      </p>
      <div className="min-h-[220px] w-full sm:min-h-[260px] lg:min-h-[280px]">{chart}</div>
    </div>
  );
}
