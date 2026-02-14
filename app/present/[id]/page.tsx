"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { getChartTypeByName } from "@/components/rosencharts";
import { useChartById } from "@/hooks/use-charts";
import { useSlidesStore } from "@/stores/slides-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SlideViewPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const slides = useSlidesStore((s) => s.slides);

  // Support "auto-{chartId}" for single-chart presentation
  const isAutoPresent = id?.startsWith("auto-");
  const chartIdForAuto = isAutoPresent ? id!.replace(/^auto-/, "") : null;
  const slideFromStore = slides.find((s) => s.id === id);
  const slide = isAutoPresent && chartIdForAuto
    ? {
        id: id!,
        name: "Chart",
        chartIds: [chartIdForAuto],
        type: "custom" as const,
        createdAt: "",
      }
    : slideFromStore;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalSlides = slide?.chartIds.length ?? 0;
  const currentChartId = slide?.chartIds[currentIndex];
  const currentChart = useChartById(currentChartId ?? undefined);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        }
      }
    }

    function handleFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }

    window.addEventListener("keydown", handleKey);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, [goNext, goPrev]);

  if (!slide || !id) {
    notFound();
  }

  const chartEl = currentChart
    ? getChartTypeByName(
        currentChart.data as Parameters<typeof getChartTypeByName>[0],
        currentChart.chartType,
        {
          withTooltip: currentChart.withTooltip ?? true,
          withAnimation: currentChart.withAnimation ?? true,
          className: "min-h-[320px] w-full",
        },
      )
    : null;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#F5F7F8]">
      {/* Minimal top bar — just back + title + controls */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 rounded-xl text-[#3D4035]/60 hover:text-[#3D4035]"
          >
            <Link href="/slides">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to slides</span>
            </Link>
          </Button>

          <div className="mx-1 hidden h-5 w-px bg-border/40 sm:block" />

          <div>
            <h1 className="text-[14px] font-semibold text-[#3D4035] sm:text-[15px]">
              {slide.name}
            </h1>
            {totalSlides > 1 && (
              <p className="text-[11px] text-[#3D4035]/40 sm:text-[12px]">
                {totalSlides} chart{totalSlides !== 1 ? "s" : ""} in this deck
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalSlides > 1 && (
            <span className="rounded-lg bg-[#BCBDEA]/20 px-3 py-1 text-[12px] font-semibold text-[#6C5DD3]">
              {currentIndex + 1} / {totalSlides}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="rounded-xl text-[#3D4035]/40 hover:text-[#3D4035]"
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Full-page slide content */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Previous button */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className={cn(
              "absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/[0.04] transition-all sm:left-6 sm:size-12",
              currentIndex === 0
                ? "cursor-not-allowed opacity-30"
                : "hover:bg-white hover:shadow-lg",
            )}
            aria-label="Previous chart"
          >
            <ChevronLeft className="size-5 text-[#3D4035]/70" />
          </button>
        )}

        {/* Scrollable chart area — matches /charts/[id] flow layout */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-12 sm:py-8">
          <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
            {currentChart && (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-[#3D4035] sm:text-2xl">
                  {currentChart.title}
                </h2>
                <p className="mt-1 text-[13px] text-[#3D4035]/50">
                  {currentChart.source} · {currentChart.date}
                </p>
              </div>
            )}
            <div className="rounded-[28px] bg-white/90 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
              <div className="min-h-[360px] w-full">{chartEl}</div>
            </div>
          </div>
        </div>

        {/* Next button */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === totalSlides - 1}
            className={cn(
              "absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/[0.04] transition-all sm:right-6 sm:size-12",
              currentIndex === totalSlides - 1
                ? "cursor-not-allowed opacity-30"
                : "hover:bg-white hover:shadow-lg",
            )}
            aria-label="Next chart"
          >
            <ChevronRight className="size-5 text-[#3D4035]/70" />
          </button>
        )}
      </div>

      {/* Bottom dot indicators for multi-chart slides */}
      {totalSlides > 1 && (
        <div className="flex shrink-0 items-center justify-center gap-2 py-4">
          {slide.chartIds.map((cId, idx) => (
            <button
              key={cId}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "size-2.5 rounded-full transition-all",
                idx === currentIndex
                  ? "scale-125 bg-[#6C5DD3]"
                  : "bg-[#3D4035]/20 hover:bg-[#3D4035]/40",
              )}
              aria-label={`Go to chart ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
