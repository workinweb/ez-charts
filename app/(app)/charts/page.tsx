"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BarChart3, Plus } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { PageSearchBar } from "@/components/layout/page-search-bar";
import { useAllCharts, useChartsStore } from "@/stores/charts-store";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination, DEFAULT_PAGE_SIZE } from "@/hooks/use-pagination";
import { Button } from "@/components/ui/button";
import { ChartRow } from "./_components/chart-row";
import { DeleteChartDialog } from "./_components/delete-chart-dialog";

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
        c.title.toLowerCase().includes(q) || c.source.toLowerCase().includes(q),
    );
  }, [items, search]);

  const { paginatedItems, page, setPage, totalPages, totalItems } =
    usePagination(filtered, DEFAULT_PAGE_SIZE);

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
                  {paginatedItems.map((chart) => (
                    <ChartRow
                      key={chart.id}
                      chart={chart}
                      showEdit
                      onDuplicate={duplicateChart}
                      onDelete={setDeleteTarget}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
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

      <DeleteChartDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(id) => {
          removeChart(id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
