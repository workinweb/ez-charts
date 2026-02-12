"use client";

import { Bookmark } from "lucide-react";

export function SavedSection() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-foreground/5">
        <Bookmark className="size-8 text-foreground/40" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Saved</h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Your bookmarked and favorite charts.
      </p>
    </div>
  );
}
