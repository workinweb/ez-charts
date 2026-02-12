"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { PageSearchBar } from "@/components/layout/page-search-bar";
import { cn } from "@/lib/utils";
import { useSlidesStore } from "@/stores/slides-store";
import { CreateSlideDialog } from "@/components/modules/slides/create-slide-dialog";
import { getChartById } from "@/lib/charts-data";
import { Presentation, Layers, ChevronRight, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function matchesSlide(
  slide: { name: string; chartIds: string[] },
  q: string,
  getChartByIdFn: typeof getChartById,
): boolean {
  if (slide.name.toLowerCase().includes(q)) return true;
  const chart = getChartByIdFn(slide.chartIds[0]);
  return (
    !!chart &&
    (chart.source.toLowerCase().includes(q) ||
      chart.title.toLowerCase().includes(q))
  );
}

export default function SlidesPage() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { slides, removeSlide } = useSlidesStore();
  const customSlides = slides.filter((s) => s.type === "custom");
  const autoSlides = slides.filter((s) => s.type === "auto");

  const filteredCustom = useMemo(() => {
    if (!search.trim()) return customSlides;
    const q = search.toLowerCase().trim();
    return customSlides.filter((s) => matchesSlide(s, q, getChartById));
  }, [customSlides, search]);

  const filteredAuto = useMemo(() => {
    if (!search.trim()) return autoSlides;
    const q = search.toLowerCase().trim();
    return autoSlides.filter((s) => matchesSlide(s, q, getChartById));
  }, [autoSlides, search]);

  const totalFiltered = filteredCustom.length + filteredAuto.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-6 sm:pb-8">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
          <PageSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search slides…"
            count={totalFiltered}
            countLabel={totalFiltered === 1 ? "slide" : "slides"}
            addButton={<CreateSlideDialog triggerLabel="Add new" />}
          />

          {totalFiltered === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] bg-white/80 py-24 text-center shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px]">
              <Presentation className="size-12 text-[#3D4035]/20" />
              <p className="text-[15px] font-medium text-[#3D4035]/70">
                {search.trim() ? "No matching slides" : "No slides yet"}
              </p>
              <p className="max-w-sm text-[13px] text-[#3D4035]/50">
                {search.trim()
                  ? "Try a different search term."
                  : "Create a custom slide deck or present any chart."}
              </p>
            </div>
          ) : (
            <>
              {/* Custom slide decks */}
              {filteredCustom.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h2 className="flex items-center gap-2 text-[14px] font-semibold text-[#3D4035]/70">
                    <Layers className="size-4" />
                    Custom Decks
                  </h2>
                  <div className="rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
                    <div className="flex flex-col gap-4">
                      {filteredCustom.map((slide) => {
                        const chartCount = slide.chartIds.length;
                        const firstChart = getChartById(slide.chartIds[0]);
                        const Icon = firstChart?.icon ?? Presentation;
                        const iconBg = firstChart?.iconBg ?? "bg-[#6C5DD3]/20";
                        const iconColor =
                          firstChart?.iconColor ?? "text-[#3D4035]";
                        return (
                          <div
                            key={slide.id}
                            className="flex items-center gap-6 rounded-[28px] p-3 transition-colors hover:bg-black/[0.02]"
                          >
                            <div
                              className={cn(
                                "flex size-16 shrink-0 items-center justify-center rounded-[24px]",
                                iconBg,
                              )}
                            >
                              <Layers
                                className={cn("size-7", iconColor)}
                                strokeWidth={2}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-[17px] font-medium text-[#3D4035]">
                                {slide.name}
                              </p>
                              <p className="text-[13px] text-[#3D4035]/50">
                                {chartCount} chart{chartCount !== 1 ? "s" : ""}{" "}
                                · {slide.createdAt}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  id: slide.id,
                                  name: slide.name,
                                })
                              }
                              className="shrink-0 rounded-full p-2 text-[#3D4035]/30 transition-colors hover:bg-red-50 hover:text-red-500"
                              aria-label="Delete slide deck"
                            >
                              <Trash2 className="size-4" />
                            </button>

                            <Link
                              href={`/present/${slide.id}`}
                              className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[#6C5DD3] hover:underline"
                            >
                              Present
                              <ChevronRight className="size-3.5" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* Auto slides (one per chart) */}
              {filteredAuto.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h2 className="flex items-center gap-2 text-[14px] font-semibold text-[#3D4035]/70">
                    <Presentation className="size-4" />
                    Individual Charts
                  </h2>
                  <div className="rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
                    <div className="flex flex-col gap-4">
                      {filteredAuto.map((slide) => {
                        const chart = getChartById(slide.chartIds[0]);
                        if (!chart) return null;
                        const Icon = chart.icon;
                        return (
                          <Link
                            key={slide.id}
                            href={`/present/${slide.id}`}
                            className="flex items-center gap-6 rounded-[28px] p-3 transition-colors hover:bg-black/[0.02]"
                          >
                            <div
                              className={cn(
                                "flex size-16 shrink-0 items-center justify-center rounded-[24px]",
                                chart.iconBg,
                              )}
                            >
                              <Icon
                                className={cn("size-7", chart.iconColor)}
                                strokeWidth={2}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-[17px] font-medium text-[#3D4035]">
                                {slide.name}
                              </p>
                              <p className="text-[13px] text-[#3D4035]/50">
                                {chart.source} · {chart.date}
                              </p>
                            </div>

                            <span className="flex items-center gap-1 text-[13px] font-semibold text-[#6C5DD3]">
                              Present
                              <ChevronRight className="size-3.5" />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete slide deck?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently removed.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && removeSlide(deleteTarget.id)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
