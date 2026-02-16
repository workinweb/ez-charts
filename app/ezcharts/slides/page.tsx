"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { PageSearchBar } from "@/components/layout/page-search-bar";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { useSlidesStore } from "@/stores/slides-store";
import { useSlidesList, useSlidesMutations } from "@/hooks/use-slides";
import { CreateSlideDialog } from "./_components/create-slide-dialog";
import { EditSlideDialog } from "./_components/edit-slide-dialog";
import { getChartById } from "@/lib/charts-data";
import { useChartsList } from "@/hooks/use-charts";
import {
  Presentation,
  Layers,
  ChevronRight,
  Trash2,
  Pencil,
} from "lucide-react";
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
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination, DEFAULT_PAGE_SIZE } from "@/hooks/use-pagination";
import { SlideListSkeleton } from "@/components/skeletons/slide-row-skeleton";

function matchesSlide(
  slide: { name: string; chartIds: string[] },
  q: string,
  getChartByIdFn: (id: string) => { title: string; source: string } | undefined,
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
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const charts = useChartsList();
  const { slides, isLoading: slidesLoading } = useSlidesList();
  const mutations = useSlidesMutations();
  const search = useSlidesStore((s) => s.slidesSearch);
  const setSearch = useSlidesStore((s) => s.setSlidesSearch);
  const editSlide = useSlidesStore((s) => s.editingSlide);
  const setEditSlide = useSlidesStore((s) => s.setEditingSlide);
  const customSlides = slides;

  const filteredCustom = useMemo(() => {
    if (!search.trim()) return customSlides;
    const q = search.toLowerCase().trim();
    return customSlides.filter((s) =>
      matchesSlide(s, q, (id) => getChartById(id, charts))
    );
  }, [customSlides, search, charts]);

  const { paginatedItems, page, setPage, totalPages, totalItems } =
    usePagination(filteredCustom, DEFAULT_PAGE_SIZE);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-4 sm:pb-6 md:px-5 lg:px-6 lg:pb-8 xl:px-6 xl:pb-8">
        <div className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-6">
          <PageSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search slides…"
            count={totalItems}
            countLabel={totalItems === 1 ? "slide" : "slides"}
            addButton={<CreateSlideDialog triggerLabel="Add new" />}
          />

          {slidesLoading && slides.length === 0 ? (
            <div className="rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
              <SlideListSkeleton count={6} />
            </div>
          ) : totalItems === 0 ? (
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
            <div className="flex flex-col gap-6">
              {/* Custom slide decks */}
              <section className="flex flex-col gap-3">
                <div className="rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
                  <div className="flex flex-col gap-4">
                    {paginatedItems.map((slide) => {
                      const chartCount = slide.chartIds.length;
                      const firstChart = getChartById(slide.chartIds[0], charts);
                      const iconBg = firstChart?.iconBg ?? "bg-[#6C5DD3]/20";
                      const iconColor =
                        firstChart?.iconColor ?? "text-[#3D4035]";
                      return (
                        <div
                          key={slide.id}
                          className="flex flex-wrap items-center gap-3 rounded-[28px] p-3 transition-colors hover:bg-black/[0.02] sm:gap-6"
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

                          <div className="min-w-0 flex-1 basis-32">
                            <p className="text-[17px] font-medium text-[#3D4035]">
                              {slide.name}
                            </p>
                            <p className="text-[13px] text-[#3D4035]/50">
                              {chartCount} chart{chartCount !== 1 ? "s" : ""} ·{" "}
                              {slide.createdAt}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <button
                                type="button"
                                onClick={() => setEditSlide(slide)}
                                className="shrink-0 rounded-full p-2 text-[#3D4035]/30 transition-colors hover:bg-black/[0.04] hover:text-[#3D4035]/70"
                                aria-label="Edit slide deck"
                                title="Edit slide deck"
                              >
                                <Pencil className="size-4" />
                              </button>

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
                                title="Delete slide deck"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>

                            <Link
                              href={`/present/${slide.id}`}
                              className="flex items-center gap-1 text-[13px] font-semibold text-[#6C5DD3] hover:underline"
                            >
                              Present
                              <ChevronRight className="size-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      <EditSlideDialog
        open={!!editSlide}
        onOpenChange={(open) => !open && setEditSlide(null)}
        slide={editSlide}
      />

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
              onClick={async () => {
                if (deleteTarget) {
                  await mutations.remove(deleteTarget.id as Id<"slides">);
                  setDeleteTarget(null);
                }
              }}
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
