"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Heart, Loader2, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { PageSearchBar } from "@/components/layout/page-search-bar";
import { cn } from "@/lib/utils";
import { useAllCharts, useChartsStore } from "@/stores/charts-store";

export default function ChartsPage() {
  const [loading] = useState(false);
  const [search, setSearch] = useState("");
  const items = useAllCharts();
  const toggleFavorite = useChartsStore((s) => s.toggleFavorite);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase().trim();
    return items.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.source.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-6 sm:pb-8">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
          <PageSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search charts…"
            count={filtered.length}
            countLabel="charts"
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <Loader2 className="size-10 animate-spin text-[#3D4035]/40" />
              <p className="text-[14px] text-[#3D4035]/60">
                Loading your charts…
              </p>
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
            <div className="rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
              <div className="flex flex-col gap-5">
                {filtered.map((chart) => {
                  const Icon = chart.icon;
                  return (
                    <Link
                      key={chart.id}
                      href={`/charts/${chart.id}`}
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

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(chart.id);
                        }}
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

                      <div className="text-right">
                        <p className="text-[13px] font-medium text-[#3D4035]/50">
                          {chart.date}
                        </p>
                        <span className="mt-1 inline-block text-[13px] font-semibold text-[#6C5DD3]">
                          Open →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
