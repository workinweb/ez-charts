"use client";

export function UserSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* Dashboard cards section skeleton */}
      <section className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded-lg bg-[#3D4035]/10" />
            <div className="h-4 w-72 animate-pulse rounded bg-[#3D4035]/8" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-border/40 bg-white/80 px-4 py-3.5"
            >
              <div className="size-4 animate-pulse rounded bg-[#3D4035]/10" />
              <div className="size-4 animate-pulse rounded bg-[#3D4035]/10" />
              <div className="h-4 flex-1 animate-pulse rounded bg-[#3D4035]/10" style={{ width: `${60 + i * 5}%` }} />
            </div>
          ))}
        </div>
      </section>

      {/* Chat preferences section skeleton */}
      <section className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
        <div className="h-5 w-40 animate-pulse rounded-lg bg-[#3D4035]/10" />
        <div className="mt-1 mb-6 h-4 w-56 animate-pulse rounded bg-[#3D4035]/8" />
        <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-white/80 px-4 py-3.5">
          <div className="size-4 animate-pulse rounded bg-[#3D4035]/10" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-36 animate-pulse rounded bg-[#3D4035]/10" />
            <div className="h-3 w-full animate-pulse rounded bg-[#3D4035]/8" />
          </div>
        </div>
      </section>
    </div>
  );
}
