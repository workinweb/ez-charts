"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { toPng } from "html-to-image";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Link2,
  Maximize2,
  Minimize2,
  Check,
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import { getMergedChartSettings, renderChart } from "@/lib/chart/chart-render";
import {
  useChartByIdWithStatus,
  useChartForPresent,
} from "@/hooks/use-charts";
import {
  useSlideForPresent,
  useSlidesMutations,
} from "@/hooks/use-slides";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

export default function SlideViewPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  // Support "auto-{chartId}" for single-chart presentation
  const isAutoPresent = id?.startsWith("auto-");
  const chartIdForAuto = isAutoPresent ? id!.replace(/^auto-/, "") : null;
  const {
    slide: slideFromConvex,
    isOwner,
    canChangeShare,
    isLoading,
    isNotFound,
  } = useSlideForPresent(isAutoPresent ? undefined : id);
  const slide =
    isAutoPresent && chartIdForAuto
      ? {
          id: id!,
          name: "Chart",
          chartIds: [chartIdForAuto],
          type: "custom" as const,
          createdAt: "",
        }
      : slideFromConvex;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chartScale, setChartScale] = useState(100); // 0-100%, scales both width and height (zoom)
  const chartCardRef = useRef<HTMLDivElement>(null);
  const { updateShareSetting } = useSlidesMutations();

  const totalSlides = slide?.chartIds.length ?? 0;
  const currentChartId = slide?.chartIds[currentIndex];
  const isSharedView = !isAutoPresent && !!slideFromConvex && !isOwner;
  const effectiveIsOwner = isAutoPresent || isOwner;
  const chartFromOwner = useChartByIdWithStatus(
    !isSharedView ? currentChartId ?? undefined : undefined,
  );
  const chartFromShared = useChartForPresent(
    isSharedView ? (currentChartId ?? undefined) : undefined,
    isSharedView ? (id as Id<"slides">) : undefined,
    isSharedView,
  );
  const { chart: currentChart, isLoading: chartLoading, isNotFound: chartNotFound } =
    isSharedView ? chartFromShared : chartFromOwner;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const exportChartAsImage = useCallback(async () => {
    const el = chartCardRef.current;
    if (!el || !currentChart) return;
    setExporting(true);
    try {
      const filename = `${currentChart.title.replace(/[^a-z0-9]/gi, "_").slice(0, 50)}.png`;
      const dataUrl = await toPng(el, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [currentChart]);

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

  if (!id) notFound();
  if (!isAutoPresent && isNotFound) notFound();
  if (!isAutoPresent && isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F5F7F8]">
        <div className="size-8 animate-spin rounded-full border-2 border-[#6C5DD3]/20 border-t-[#6C5DD3]" />
      </div>
    );
  }
  if (!slide) notFound();

  const chartEl = currentChart
    ? renderChart(currentChart.data, currentChart.chartType, {
        chartSettings: getMergedChartSettings(currentChart),
        presentationMode: true,
      })
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
            <Link href={effectiveIsOwner ? "/ezcharts/slides" : "/"}>
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">
                {effectiveIsOwner ? "Back to slides" : "Back"}
              </span>
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

        <div className="flex flex-wrap items-center gap-3">
          {currentChart && (
            <label
              className="flex items-center gap-3"
              role="group"
              aria-label="Chart zoom (scale)"
            >
              <span className="text-[11px] font-medium text-[#3D4035]/60">
                Zoom
              </span>
              <input
                type="range"
                min={50}
                max={100}
                value={chartScale}
                onChange={(e) => setChartScale(Number(e.target.value))}
                className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-[#3D4035]/15 accent-[#6C5DD3] sm:w-32"
              />
              <span className="min-w-10 text-[11px] text-[#3D4035]/70">
                {chartScale}%
              </span>
            </label>
          )}
          {slide && !isAutoPresent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Share slide"
                  title={canChangeShare ? "Share slide" : "Upgrade to Pro to share"}
                  className={cn(
                    "relative rounded-xl text-[#3D4035]/40 hover:text-[#3D4035]",
                    !canChangeShare && "opacity-70",
                  )}
                >
                  <Link2 className="size-4" />
                  {!canChangeShare && (
                    <Crown
                      className="absolute -right-0.5 -top-0.5 size-2.5 text-[#6C5DD3]"
                      aria-hidden
                    />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-56 p-2 [&>[data-slot=dropdown-menu-item]]:py-2.5"
              >
                {canChangeShare ? (
                  <>
                    <DropdownMenuItem
                      onClick={async () => {
                        const url = `${typeof window !== "undefined" ? window.location.origin : ""}/present/${slide.id}`;
                        await navigator.clipboard.writeText(url);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? (
                        <>
                          <Check className="size-4" />
                          Copied!
                        </>
                      ) : (
                        "Copy link"
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1.5" />
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      onClick={() =>
                        updateShareSetting(slide.id as Id<"slides">, "restricted")
                      }
                      className={
                        (slide.shareSetting ?? "restricted") === "restricted"
                          ? "bg-accent"
                          : ""
                      }
                    >
                      Only I can view
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      onClick={() =>
                        updateShareSetting(slide.id as Id<"slides">, "available")
                      }
                      className={
                        (slide.shareSetting ?? "restricted") === "available"
                          ? "bg-accent"
                          : ""
                      }
                    >
                      Anyone with link can view
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/ezcharts"
                      className="flex items-center gap-2"
                    >
                      <Crown className="size-4 text-[#6C5DD3]" />
                      Upgrade to Pro or Max to share slides
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {currentChart && effectiveIsOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={exporting}
                  aria-label="Download"
                  title="Download"
                  className="rounded-xl text-[#3D4035]/40 hover:text-[#3D4035]"
                >
                  {exporting ? (
                    <div className="size-4 animate-spin rounded-full border-2 border-[#3D4035]/20 border-t-[#3D4035]" />
                  ) : (
                    <Download className="size-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-48 p-2 [&_[data-slot=dropdown-menu-item]]:py-2.5"
              >
                <DropdownMenuItem
                  onClick={exportChartAsImage}
                  disabled={exporting}
                >
                  <Download className="size-4" />
                  PNG
                </DropdownMenuItem>
                {/* Future: PDF, SVG, etc. */}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
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

        {/* Full-space chart area — presentation style */}
        <div className="flex min-h-0 flex-1 px-4 py-4 sm:px-8 sm:py-6">
          {/* Wrapper establishes explicit dimensions so % on child resolves correctly */}
          <div className="flex min-h-0 w-full flex-1 items-center justify-center">
            <div
              ref={chartCardRef}
              className="flex min-h-0 min-w-0 flex-col gap-4 overflow-hidden"
              style={{
                width: `${chartScale}%`,
                height: `${chartScale}%`,
              }}
            >
              {currentChart && (
                <div className="shrink-0 text-center">
                  <h2 className="text-xl font-semibold text-[#3D4035] sm:text-2xl">
                    {currentChart.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-[#3D4035]/50">
                    {currentChart.source} · {currentChart.date}
                  </p>
                </div>
              )}
              <div className="flex min-h-0 flex-1 flex-col rounded-[28px] bg-white/90 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
                <div className="flex min-h-[320px] flex-1 w-full">
                  {chartLoading ? (
                    <div className="flex h-[360px] w-full flex-col items-center justify-center gap-3">
                      <div className="size-8 animate-spin rounded-full border-2 border-[#6C5DD3]/20 border-t-[#6C5DD3]" />
                      <p className="text-[14px] text-[#3D4035]/60">
                        Loading chart…
                      </p>
                    </div>
                  ) : !currentChart ? (
                    <div className="flex min-h-[320px] w-full flex-1 flex-col items-center justify-center gap-3 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full bg-[#e87c5c]/10">
                        <AlertCircle className="size-7 text-[#e87c5c]" />
                      </div>
                      <h3 className="text-[16px] font-semibold text-[#3D4035]">
                        Chart unavailable
                      </h3>
                      <p className="max-w-sm text-[14px] text-[#3D4035]/60">
                        This chart could not be retrieved. It may have been
                        deleted or no longer exists, or you don&apos;t have
                        permission to view it.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="mt-2"
                      >
                        <Link
                          href={effectiveIsOwner ? "/ezcharts/slides" : "/"}
                          className="gap-2"
                        >
                          <ArrowLeft className="size-4" />
                          {effectiveIsOwner ? "Back to slides" : "Back"}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    chartEl
                  )}
                </div>
              </div>
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

      {/* Bottom dot indicators + slide counter for multi-chart slides */}
      {totalSlides > 1 && (
        <div className="flex shrink-0 items-center justify-center gap-4 py-4">
          <div className="flex items-center gap-2">
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
          <span className="rounded-lg bg-[#BCBDEA]/20 px-3 py-1 text-[12px] font-semibold text-[#6C5DD3]">
            {currentIndex + 1} / {totalSlides}
          </span>
        </div>
      )}
    </div>
  );
}
