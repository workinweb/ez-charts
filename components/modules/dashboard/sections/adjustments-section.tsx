"use client";

import { SlidersHorizontal } from "lucide-react";

export function AdjustmentsSection() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-foreground/5">
        <SlidersHorizontal className="size-8 text-foreground/40" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Adjustments</h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Fine-tune chart settings and display options.
      </p>
    </div>
  );
}
