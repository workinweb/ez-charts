export function ChartRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-white/80 px-4 py-3.5">
      <div className="size-12 shrink-0 animate-pulse rounded-2xl bg-[#3D4035]/10" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-48 animate-pulse rounded bg-[#3D4035]/10" />
        <div className="h-3 w-24 animate-pulse rounded bg-[#3D4035]/8" />
      </div>
      <div className="size-8 shrink-0 animate-pulse rounded-full bg-[#3D4035]/10" />
      <div className="h-8 w-16 shrink-0 animate-pulse rounded-lg bg-[#3D4035]/10" />
    </div>
  );
}

export function ChartListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ChartRowSkeleton key={i} />
      ))}
    </div>
  );
}
