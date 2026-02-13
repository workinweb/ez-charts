"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  BarChart3,
  Trash2,
  Copy,
  Pencil,
  Plus,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { PageSearchBar } from "@/components/layout/page-search-bar";
import { cn } from "@/lib/utils";
import { useAllCharts, useChartsStore } from "@/stores/charts-store";
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
import {
  usePagination,
  DEFAULT_PAGE_SIZE,
} from "@/lib/use-pagination";
import { Button } from "@/components/ui/button";

export default function ChartsPage() {
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const items = useAllCharts();
  const search = useChartsStore((s) => s.chartsSearch);
  const setSearch = useChartsStore((s) => s.setChartsSearch);
  const toggleFavorite = useChartsStore((s) => s.toggleFavorite);
  const removeChart = useChartsStore((s) => s.removeChart);
  const duplicateChart = useChartsStore((s) => s.duplicateChart);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase().trim();
    return items.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.source.toLowerCase().includes(q)
    );
  }, [items, search]);

  const {
    paginatedItems,
    page,
    setPage,
    totalPages,
    totalItems,
  } = usePagination(filtered, DEFAULT_PAGE_SIZE);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-6 sm:pb-8">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
          <PageSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search charts…"
            count={totalItems}
            countLabel="charts"
            addButton={
              <Link href="/edit">
                <Button
                  size="sm"
                  className="gap-2 rounded-xl bg-[#6C5DD3] text-[12px] font-semibold text-white hover:bg-[#5a4dbf]"
                >
                  <Plus className="size-3.5" />
                  Add new
                </Button>
              </Link>
            }
          />

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] bg-white/80 py-24 text-center shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px]">
              <BarChart3 className="size-12 text-[#3D4035]/20" />
              <p className="text-[15px] font-medium text-[#3D4035]/70">
                {search.trim() ? "No matching charts" : "No charts yet"}
              </p>
              <p className="max-w-sm text-[13px] text-[#3D4035]/50">
                {search.trim()
                  ? "Try a different search term."
                  : "Create charts with the AI assistant or import your data."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
                <div className="flex flex-col gap-5">
                  {paginatedItems.map((chart) => {
                  const Icon = chart.icon;
                  return (
                    <div
                      key={chart.id}
                      className="flex items-center gap-6 rounded-[28px] p-3 transition-colors hover:bg-black/[0.02]"
                    >
                      <div
                        className={cn(
                          "flex size-16 shrink-0 items-center justify-center rounded-[24px]",
                          chart.iconBg
                        )}
                      >
                        <Icon
                          className={cn("size-7", chart.iconColor)}
                          strokeWidth={2}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[17px] font-medium text-[#3D4035]">
                          {chart.title}
                        </p>
                        <p className="text-[13px] text-[#3D4035]/50">
                          {chart.source}
                        </p>
                      </div>

                      <Link
                        href={`/edit?chart=${chart.id}`}
                        className="shrink-0 rounded-full p-2 text-[#3D4035]/30 transition-colors hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3]"
                        aria-label="Edit chart"
                      >
                        <Pencil className="size-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => duplicateChart(chart.id)}
                        className="shrink-0 rounded-full p-2 text-[#3D4035]/30 transition-colors hover:bg-black/[0.04] hover:text-[#3D4035]/70"
                        aria-label="Duplicate chart"
                      >
                        <Copy className="size-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({ id: chart.id, title: chart.title })
                        }
                        className="shrink-0 rounded-full p-2 text-[#3D4035]/30 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete chart"
                      >
                        <Trash2 className="size-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(chart.id)}
                        className="shrink-0 rounded-full p-2 text-[#3D4035]/40 transition-colors hover:bg-black/[0.04] hover:text-[#3D4035]/70"
                        aria-label={
                          chart.favorited
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        {chart.favorited ? (
                          <Heart className="size-5 fill-[#6C5DD3] text-[#6C5DD3]" />
                        ) : (
                          <Heart className="size-5" />
                        )}
                      </button>

                      <Link
                        href={`/charts/${chart.id}`}
                        className="flex shrink-0 flex-col items-end gap-1 text-right"
                      >
                        <p className="text-[13px] font-medium text-[#3D4035]/50">
                          {chart.date}
                        </p>
                        <span className="text-[13px] font-semibold text-[#6C5DD3] hover:underline">
                          Open →
                        </span>
                      </Link>
                    </div>
                  );
                })}
                </div>
              </div>

              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chart?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && removeChart(deleteTarget.id)
              }
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
