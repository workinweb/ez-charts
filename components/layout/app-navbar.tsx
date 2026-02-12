"use client";

import {
  ChevronDown,
  MoreHorizontal,
  Share,
  ExternalLink,
  Bookmark,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppNavbar() {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border/40 bg-[#E9EEF0] px-3 sm:px-4">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Logo */}
        <div className="ml-1 flex items-center gap-1.5 sm:ml-2">
          <div className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600">
            <span className="text-[8px] font-bold text-white">C</span>
          </div>
          <span className="text-[13px] font-semibold text-foreground/80">
            CalyxFlow
          </span>
          <ChevronDown className="hidden size-3 text-foreground/40 sm:block" />
        </div>

        {/* Icon buttons — hide on small mobile */}
        <div className="ml-1 hidden items-center gap-0.5 sm:flex">
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-lg text-foreground/40 hover:text-foreground/70"
          >
            <Share className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-lg text-foreground/40 hover:text-foreground/70"
          >
            <Bookmark className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Center — tabs — hide on small mobile */}
      <div className="hidden items-center gap-1 sm:flex">
        <span className="rounded-lg bg-foreground/8 px-3 py-1 text-[12px] font-medium text-foreground/70">
          Dashboard
        </span>

        <div className="mx-2 h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5">
          <Home className="size-3.5 text-foreground/40" />
          <span className="text-[12px] font-medium text-foreground/60">
            Home page
          </span>
          <ChevronDown className="size-3 text-foreground/30" />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-xs"
          className="rounded-lg text-foreground/40"
        >
          <MoreHorizontal className="size-3.5" />
        </Button>

        <Button
          size="xs"
          className="rounded-lg bg-[#7c6ee8] px-3 text-[11px] font-semibold text-white hover:bg-[#6b5dd4]"
        >
          Upgrade
        </Button>
      </div>
    </header>
  );
}
