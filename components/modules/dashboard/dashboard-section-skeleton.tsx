"use client";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { cn } from "@/lib/utils";

/** Grid column span classes for skeleton cards */
const SPAN_CLASS: Record<number, string> = {
  3: "xl:col-span-3",
  6: "xl:col-span-6",
  12: "xl:col-span-12",
};

function SkeletonCard({ span = 6 }: { span?: number }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border border-border/40 bg-white/80 p-6",
        SPAN_CLASS[span] ?? SPAN_CLASS[6]
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="h-5 w-24 animate-pulse rounded-lg bg-[#3D4035]/10" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-[#3D4035]/8" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-[#3D4035]/8" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-[#3D4035]/8" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSectionSkeleton() {
  return (
    <>
      <DashboardHeader />
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-12">
        <SkeletonCard span={6} />
        <SkeletonCard span={3} />
        <SkeletonCard span={3} />
        <SkeletonCard span={6} />
        <SkeletonCard span={6} />
        <SkeletonCard span={6} />
        <SkeletonCard span={6} />
      </div>
    </>
  );
}
