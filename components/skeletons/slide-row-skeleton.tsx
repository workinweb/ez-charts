export function SlideRowSkeleton() {
  return (
    <div className="flex items-center gap-6 rounded-[28px] p-3">
      <div className="size-16 shrink-0 animate-pulse rounded-[24px] bg-[#3D4035]/10" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-5 w-40 animate-pulse rounded bg-[#3D4035]/10" />
        <div className="h-3 w-24 animate-pulse rounded bg-[#3D4035]/8" />
      </div>
      <div className="size-8 shrink-0 animate-pulse rounded-full bg-[#3D4035]/10" />
      <div className="size-8 shrink-0 animate-pulse rounded-full bg-[#3D4035]/10" />
      <div className="h-8 w-16 shrink-0 animate-pulse rounded-lg bg-[#3D4035]/10" />
    </div>
  );
}

export function SlideListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SlideRowSkeleton key={i} />
      ))}
    </div>
  );
}
