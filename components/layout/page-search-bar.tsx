"use client";

import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageSearchBarProps {
  /** Current search query */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Total count to display, e.g. "5 charts" */
  count: number;
  countLabel: string; // e.g. "charts" or "slides"
  /** Optional "Add new" button */
  addButton?: React.ReactNode;
  className?: string;
}

export function PageSearchBar({
  value,
  onChange,
  placeholder = "Search…",
  count,
  countLabel,
  addButton,
  className,
}: PageSearchBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[28px] bg-white/80 p-4 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:px-6 sm:py-3.5",
        className,
      )}
    >
      <div className="relative flex min-w-0 flex-1">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#3D4035]/40" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border-0 bg-[#E9EEF0]/60 py-2.5 pl-10 pr-4 text-[14px] text-[#3D4035] placeholder:text-[#3D4035]/40 focus:outline-none focus:ring-2 focus:ring-[#BCBDEA]/50"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Badge className="h-8 shrink-0 rounded-xl border-0 bg-[#6C5DD3] px-4 py-0 text-[11px] font-semibold text-white shadow-none">
          {count} {countLabel}
        </Badge>
        {addButton}
      </div>
    </div>
  );
}
