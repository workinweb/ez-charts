"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BarChart3, Plus } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/layout/navbar";
import { PageSearchBar } from "@/components/layout/page-search-bar";
import { useChartsPaginated, useChartsMutations } from "@/hooks/use-charts";
import { useChartsStore } from "@/stores/charts-store";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ChartRow } from "./_components/chart-row";
import { DeleteChartDialog } from "./_components/delete-chart-dialog";
import { ChartListSkeleton } from "@/components/skeletons/chart-row-skeleton";
import { DEFAULT_PAGE_SIZE } from "@/hooks/use-pagination";
import { Button } from "@/components/ui/button";

export default function ChartsPage() {
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const { charts, results, status, loadMore, isLoading } = useChartsPaginated();
  const search = useChartsStore((s) => s.chartsSearch);
  const setSearch = useChartsStore((s) => s.setChartsSearch);
  const mutations = useChartsMutations();

  const filtered = useMemo(() => {
    if (!search.trim()) return charts;
    const q = search.toLowerCase().trim();
    return charts.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.source.toLowerCase().includes(q)
    );
  }, [charts, search]);

  // Client-side pagination for search (Convex returns all loaded pages)
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / DEFAULT_PAGE_SIZE));
  const startIdx = (page - 1) * DEFAULT_PAGE_SIZE;
  const paginatedItems = filtered.slice(startIdx, startIdx + DEFAULT_PAGE_SIZE);

  const handleRemove = async (id: string) => {
    await mutations.remove(id as Id<"charts">);
    setDeleteTarget(null);
  };

  const handleToggleFavorite = async (id: string) => {
    await mutations.toggleFavorite(id as Id<"charts">);
  };

  const handleDuplicate = async (id: string) => {
    await mutations.duplicate(id as Id<"charts">);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-4 sm:pb-6 md:px-5 lg:px-6 lg:pb-8 xl:px-6 xl:pb-8">
        <div className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-6">
          <PageSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search charts…"
            count={filtered.length}
            countLabel="charts"
            addButton={
              <Link href="/ezcharts/edit">
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

          {isLoading && results.length === 0 ? (
            <div className="rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
              <ChartListSkeleton count={6} />
            </div>
          ) : filtered.length === 0 ? (
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
                  {paginatedItems.map((chart) => (
                    <ChartRow
                      key={chart.id}
                      chart={chart}
                      showEdit
                      onDuplicate={handleDuplicate}
                      onDelete={setDeleteTarget}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
                {(status === "CanLoadMore" || status === "LoadingMore") &&
                  filtered.length === charts.length && (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => loadMore(DEFAULT_PAGE_SIZE)}
                        disabled={status === "LoadingMore"}
                        className="rounded-xl border border-border/60 px-4 py-2 text-[13px] font-medium text-[#3D4035]/70 hover:bg-black/[0.02] disabled:opacity-50"
                      >
                        {status === "LoadingMore" ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
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

      <DeleteChartDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
}
