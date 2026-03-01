"use client";

import { useState } from "react";
import { ChevronDown, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  isChartTypeCompatible,
  transformChartData,
} from "@/components/charts/rosencharts";
import type { ChartTypeKey } from "@/components/charts/rosencharts";
import { ChartLibrarySelector } from "@/components/chart-library-selector";
import {
  getChartTypesByLibrary,
  isShadcnChartType,
} from "@/lib/chart/chart-registry";
import { getDefaultDataForChartType } from "@/lib/chart/chart-defaults";
import { cn } from "@/lib/utils";

interface ChartPreviewProps {
  title: string;
  chartType: string;
  data: unknown;
  previewEl: React.ReactNode;
  onTitleChange: (title: string) => void;
  onChartTypeChange: (chartType: string, newData?: unknown) => void;
  onIncompatibleType: (target: string) => void;
}

export function ChartPreview({
  title,
  chartType,
  data,
  previewEl,
  onTitleChange,
  onChartTypeChange,
  onIncompatibleType,
}: ChartPreviewProps) {
  const [chartPopoverOpen, setChartPopoverOpen] = useState(false);

  /** Incompatible types show Lock icon (data will be erased) but remain clickable → confirmation dialog */
  const requiresConfirmation = (key: string) => {
    const fromRosencharts = !isShadcnChartType(chartType);
    const toRosencharts = !isShadcnChartType(key);
    const sameLibrary = fromRosencharts === toRosencharts;
    const compatible =
      sameLibrary &&
      fromRosencharts &&
      isChartTypeCompatible(chartType as ChartTypeKey, key as ChartTypeKey);
    if (compatible) return false;
    if (sameLibrary && isShadcnChartType(key)) {
      const shadcnCartesian = [
        "shadcn:bar",
        "shadcn:bar-horizontal",
        "shadcn:bar-stacked",
        "shadcn:area",
        "shadcn:line",
      ];
      const shadcnPieLike = ["shadcn:pie", "shadcn:radial"];
      const fromCartesian = shadcnCartesian.includes(chartType);
      const toCartesian = shadcnCartesian.includes(key);
      const fromPieLike = shadcnPieLike.includes(chartType);
      const toPieLike = shadcnPieLike.includes(key);
      return !((fromCartesian && toCartesian) || (fromPieLike && toPieLike));
    }
    return true;
  };

  const handleChartTypeSelect = (newType: string) => {
    const fromRosencharts = !isShadcnChartType(chartType);
    const toRosencharts = !isShadcnChartType(newType);
    const sameLibrary = fromRosencharts === toRosencharts;
    const compatible =
      sameLibrary &&
      fromRosencharts &&
      isChartTypeCompatible(chartType as ChartTypeKey, newType as ChartTypeKey);
    if (compatible) {
      const transformed = transformChartData(
        data,
        chartType as ChartTypeKey,
        newType as ChartTypeKey,
      );
      onChartTypeChange(newType, transformed);
    } else if (sameLibrary && isShadcnChartType(newType)) {
      const shadcnCartesian = [
        "shadcn:bar",
        "shadcn:bar-horizontal",
        "shadcn:bar-stacked",
        "shadcn:area",
        "shadcn:line",
      ];
      const shadcnPieLike = ["shadcn:pie", "shadcn:radial"];
      const fromCartesian = shadcnCartesian.includes(chartType);
      const toCartesian = shadcnCartesian.includes(newType);
      const fromPieLike = shadcnPieLike.includes(chartType);
      const toPieLike = shadcnPieLike.includes(newType);
      if ((fromCartesian && toCartesian) || (fromPieLike && toPieLike)) {
        if (newType === "shadcn:bar-horizontal") {
          onChartTypeChange(newType, getDefaultDataForChartType(newType));
        } else {
          onChartTypeChange(newType, data);
        }
      } else {
        onIncompatibleType(newType);
      }
    } else {
      onIncompatibleType(newType);
    }
    setChartPopoverOpen(false);
  };

  const currentLabel =
    getChartTypesByLibrary()
      .rosencharts.concat(getChartTypesByLibrary().shadcn)
      .find((c) => c.key === chartType)?.label ?? "Select chart type";

  return (
    <div className="order-1 flex min-w-0 flex-col gap-4 sm:gap-5">
      {/* Title + type */}
      <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[28px] sm:p-5 lg:rounded-[40px] lg:p-6">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="chart-title"
              className="text-[12px] font-medium text-[#3D4035]/60"
            >
              Chart title
            </Label>
            <Input
              id="chart-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full rounded-xl border-black/[0.06] bg-white/60 text-[15px] font-medium text-[#3D4035] focus-visible:ring-[#6C5DD3]/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] font-medium text-[#3D4035]/60">
              Chart type
            </Label>
            <Popover open={chartPopoverOpen} onOpenChange={setChartPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between rounded-xl border-black/[0.06] bg-white/60 text-[14px] font-normal sm:w-[220px]",
                    "hover:bg-white/80 focus-visible:ring-[#6C5DD3]/30",
                  )}
                >
                  {currentLabel}
                  <ChevronDown className="size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-auto p-0 rounded-2xl border-black/[0.06] bg-white shadow-xl overflow-hidden"
              >
                <ChartLibrarySelector
                  key={chartType ?? "none"}
                  selectedChartKey={chartType}
                  onSelect={handleChartTypeSelect}
                  requiresConfirmation={requiresConfirmation}
                  className="h-[380px] w-[300px]"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Chart preview */}
      <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[28px] sm:p-6 lg:rounded-[40px] lg:p-8">
        <div className="mb-2 flex items-center gap-2 sm:mb-3">
          <Eye className="size-4 shrink-0 text-[#3D4035]/40" />
          <span className="text-[12px] font-medium tracking-wide text-[#3D4035]/40 uppercase">
            Live Preview
          </span>
        </div>
        <div className="min-h-[220px] w-full sm:min-h-[280px] lg:min-h-[360px]">
          {previewEl}
        </div>
      </div>
    </div>
  );
}
