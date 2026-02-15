"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Presentation, Layers, Zap } from "lucide-react";
import { useChartsList } from "@/hooks/use-charts";
import { useSlidesList } from "@/hooks/use-slides";

export function SlidesOverview() {
  const charts = useChartsList();
  const { slides: slideDecks } = useSlidesList();
  const totalCount = charts.length; // Charts you can present
  const customCount = slideDecks.length; // Multi-chart decks

  return (
    <Card className="col-span-full rounded-[32px] bg-[#354052] text-white ring-0 lg:col-span-5 p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-[18px] font-medium text-white/90">
          Slides
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4 p-0">
        <div className="flex flex-col justify-between rounded-[28px] bg-[#6C5DD3] p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Presentation className="size-4 text-white/80" />
            <p className="text-[13px] font-medium text-white/80">
              Total Slides
            </p>
          </div>
          <p className="text-[11px] font-medium text-white/50">
            Charts you can present
          </p>
          <div className="mt-8">
            <span className="text-[32px] font-light leading-none tracking-tight text-white lg:text-[48px]">
              {totalCount}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[28px] bg-[#e87c5c]/90 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-white/90" />
            <p className="text-[13px] font-medium text-white/90">
              Custom Decks
            </p>
          </div>
          <p className="text-[11px] font-medium text-white/70">
            Multi-chart presentations
          </p>
          <div className="mt-8">
            <span className="text-[32px] font-light leading-none tracking-tight text-white lg:text-[48px]">
              {customCount}
            </span>
          </div>
        </div>
      </CardContent>

      <div className="mt-4">
        <Link
          href="/slides"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
        >
          <Zap className="size-3.5" />
          View all slides
        </Link>
      </div>
    </Card>
  );
}
