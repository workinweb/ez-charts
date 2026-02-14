"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ChevronRight } from "lucide-react";
import { useSlidesStore } from "@/stores/slides-store";
import { getChartById } from "@/lib/charts-data";
import { useChartsList } from "@/hooks/use-charts";
import { cn } from "@/lib/utils";

export function RecentSlideDecks() {
  const charts = useChartsList();
  const slides = useSlidesStore((s) => s.slides);
  const customDecks = slides.filter((s) => s.type === "custom").slice(0, 4);

  if (customDecks.length === 0) {
    return (
      <Card className="col-span-full rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8 md:col-span-6">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-[20px] font-medium text-[#3D4035]">
            Recent Slide Decks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Layers className="size-12 text-[#3D4035]/15" />
            <p className="text-[14px] font-medium text-[#3D4035]/60">
              No custom slide decks yet
            </p>
            <Link
              href="/slides"
              className="text-[13px] font-semibold text-[#6C5DD3] hover:underline"
            >
              Create your first deck →
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full rounded-[28px] bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8 md:col-span-6">
      <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[20px] font-medium text-[#3D4035]">
          Recent Slide Decks
        </CardTitle>
        <CardAction>
          <Link
            href="/slides"
            className="text-[13px] font-semibold text-[#6C5DD3] hover:underline"
          >
            View all
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col gap-4">
          {customDecks.map((slide) => {
            const chartCount = slide.chartIds.length;
            const firstChart = getChartById(slide.chartIds[0], charts);
            const iconBg = firstChart?.iconBg ?? "bg-[#6C5DD3]/20";
            return (
              <Link
                key={slide.id}
                href={`/present/${slide.id}`}
                className="flex items-center gap-6 rounded-[28px] p-3 transition-colors hover:bg-black/[0.02]"
              >
                <div
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center rounded-[22px]",
                    iconBg,
                  )}
                >
                  <Layers className="size-6 text-[#3D4035]" strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-medium text-[#3D4035]">
                    {slide.name}
                  </p>
                  <p className="text-[12px] text-[#3D4035]/50">
                    {chartCount} chart{chartCount !== 1 ? "s" : ""} ·{" "}
                    {slide.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="h-5 rounded-md border-0 bg-[#6C5DD3]/15 px-2 text-[11px] font-semibold text-[#6C5DD3]">
                    Present
                  </Badge>
                  <ChevronRight className="size-4 text-[#3D4035]/40" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
