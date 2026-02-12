"use client";

import { Link2 } from "lucide-react";

export function LinksSection() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-foreground/5">
        <Link2 className="size-8 text-foreground/40" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Links</h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Saved links and shared chart URLs.
      </p>
    </div>
  );
}
