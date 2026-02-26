"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Presentation, Copy, Pencil } from "lucide-react";
import { renderChart } from "@/lib/chart/chart-render";
import type { Id } from "@/convex/_generated/dataModel";
import { useChartByIdWithStatus, useChartsMutations } from "@/hooks/use-charts";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";

export default function ChartDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const { chart, isLoading, isNotFound } = useChartByIdWithStatus(id);
  const mutations = useChartsMutations();

  if (isNotFound) notFound();
  if (isLoading || !chart) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
        <Navbar />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-[#6C5DD3]/20 border-t-[#6C5DD3]" />
        </div>
      </div>
    );
  }

  const chartEl = renderChart(chart.data, chart.chartType, {
    withTooltip: chart.withTooltip ?? true,
    withAnimation: chart.withAnimation ?? true,
    className: "min-h-[320px] w-full",
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-6 sm:pb-8">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 text-[#3D4035]/70 hover:text-[#3D4035]"
            >
              <Link href="/ezcharts/charts">
                <ArrowLeft className="size-4" />
                Back to charts
              </Link>
            </Button>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="sm"
              asChild
              aria-label="Edit chart"
              title="Edit chart"
              className="gap-2 text-[#3D4035]/70 hover:text-[#3D4035]"
            >
              <Link href={`/ezcharts/edit?chart=${id}`}>
                <Pencil className="size-3.5" />
                Edit
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => mutations.duplicate(id as Id<"charts">)}
              aria-label="Duplicate chart"
              title="Duplicate chart"
              className="gap-2 text-[#3D4035]/70 hover:text-[#3D4035]"
            >
              <Copy className="size-3.5" />
              Duplicate
            </Button>

            <Button
              size="sm"
              asChild
              aria-label="Present chart"
              title="Present chart"
              className="gap-2 rounded-xl bg-[#6C5DD3] text-[12px] font-semibold text-white hover:bg-[#5a4dbf]"
            >
              <Link href={`/present/auto-${id}`}>
                <Presentation className="size-3.5" />
                Present
              </Link>
            </Button>
          </div>

          <header className="space-y-1">
            <h1 className="text-2xl font-semibold text-[#3D4035] sm:text-3xl">
              {chart.title}
            </h1>
            <p className="text-[14px] text-[#3D4035]/50">
              {chart.source} · {chart.date}
            </p>
          </header>

          <div className="rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
            <div className="min-h-[360px] w-full">{chartEl}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
