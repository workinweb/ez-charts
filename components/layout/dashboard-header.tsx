"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-5 rounded-[40px] bg-white/80 px-10 py-10 shadow-sm ring-1 ring-black/[0.02] sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <h1 className="text-[32px] font-medium tracking-tight text-[#3D4035]">
          Dashboard
        </h1>
        <p className="text-[16px] text-[#3D4035]/60">
          AI-powered charts from your input or file data
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <div className="ml-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-10 rounded-full bg-[#BCBDEA] text-[#3D4035]/80 hover:bg-[#A098E5] hover:text-[#3D4035]"
          >
            <RefreshCw className="size-4.5" />
          </Button>
        </div>

        <div className="ml-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-10 rounded-full bg-[#BCBDEA] text-[#3D4035]/80 hover:bg-[#A098E5] hover:text-[#3D4035]"
          >
            <Settings className="size-4.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
