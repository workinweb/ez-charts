"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAllCharts, useChartsStore } from "@/stores/charts-store";

export function RecentCharts() {
  const items = useAllCharts();
  const toggleFavorite = useChartsStore((s) => s.toggleFavorite);

  // Show the 4 most recent charts (last items first)
  const recentItems = [...items].reverse().slice(0, 4);

  return (
    <Card className="col-span-full rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8 md:col-span-6">
      <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-4">
          <CardTitle className="text-[20px] font-medium text-[#3D4035]">
            Recent Charts
          </CardTitle>
          <Badge className="h-[24px] rounded-lg border-0 bg-[#6C5DD3] px-3 text-[12px] font-semibold text-white shadow-none">
            Live
          </Badge>
        </div>
        <CardAction></CardAction>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col gap-5">
          {recentItems.map((chart) => {
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
                  <p className="text-[13px] text-[#3D4035]/50">{chart.source}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFavorite(chart.id)}
                  className="shrink-0 rounded-full p-2 text-[#3D4035]/40 transition-colors hover:bg-black/[0.04] hover:text-[#3D4035]/70"
                  aria-label={chart.favorited ? "Remove from favorites" : "Add to favorites"}
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
                  <Link
                    href={`/charts/${chart.id}`}
                    className="mt-1 inline-block text-[13px] font-semibold text-[#6C5DD3] hover:underline"
                  >
                    Open
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
