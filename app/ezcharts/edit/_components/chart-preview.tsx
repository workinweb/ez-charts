"use client";

import { Eye, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isChartTypeCompatible,
  transformChartData,
} from "@/components/charts/rosencharts";
import type { ChartTypeKey } from "@/components/charts/rosencharts";
import {
  CHART_LIBRARIES,
  getChartTypesByLibrary,
  isShadcnChartType,
} from "@/lib/chart-registry";

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
            <Select
              value={chartType}
              onValueChange={(v) => {
                const newType = v;
                const fromRosencharts = !isShadcnChartType(chartType);
                const toRosencharts = !isShadcnChartType(newType);
                const sameLibrary = fromRosencharts === toRosencharts;
                const compatible =
                  sameLibrary &&
                  fromRosencharts &&
                  isChartTypeCompatible(
                    chartType as ChartTypeKey,
                    newType as ChartTypeKey,
                  );
                if (compatible) {
                  const transformed = transformChartData(
                    data,
                    chartType as ChartTypeKey,
                    newType as ChartTypeKey,
                  );
                  onChartTypeChange(v, transformed);
                } else if (sameLibrary && isShadcnChartType(newType)) {
                  const shadcnCartesian = [
                    "shadcn:bar",
                    "shadcn:area",
                    "shadcn:line",
                  ];
                  const shadcnPieLike = ["shadcn:pie", "shadcn:radial"];
                  const fromCartesian = shadcnCartesian.includes(chartType);
                  const toCartesian = shadcnCartesian.includes(newType);
                  const fromPieLike = shadcnPieLike.includes(chartType);
                  const toPieLike = shadcnPieLike.includes(newType);
                  if (
                    (fromCartesian && toCartesian) ||
                    (fromPieLike && toPieLike)
                  ) {
                    onChartTypeChange(v, data);
                  } else {
                    onIncompatibleType(newType);
                  }
                } else {
                  onIncompatibleType(newType);
                }
              }}
            >
              <SelectTrigger className="w-full rounded-xl border-black/[0.06] bg-white/60 text-[14px] sm:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_LIBRARIES.map((lib) => {
                  const types = getChartTypesByLibrary()[lib.id];
                  if (!types.length) return null;
                  return (
                    <SelectGroup key={lib.id}>
                      <SelectLabel className="text-[11px] font-semibold uppercase tracking-wider">
                        {lib.label}
                      </SelectLabel>
                      {types.map((ct) => {
                        const fromRosencharts = !isShadcnChartType(chartType);
                        const toRosencharts = !isShadcnChartType(ct.key);
                        const sameLibrary = fromRosencharts === toRosencharts;
                        const compatible =
                          sameLibrary &&
                          fromRosencharts &&
                          isChartTypeCompatible(
                            chartType as ChartTypeKey,
                            ct.key as ChartTypeKey,
                          );
                        const shadcnCompatible =
                          sameLibrary &&
                          isShadcnChartType(ct.key) &&
                          ([
                            "shadcn:bar",
                            "shadcn:area",
                            "shadcn:line",
                          ].includes(ct.key)
                            ? [
                                "shadcn:bar",
                                "shadcn:area",
                                "shadcn:line",
                              ].includes(chartType)
                            : ["shadcn:pie", "shadcn:radial"].includes(
                                chartType,
                              ));
                        const canSwitch = compatible || shadcnCompatible;
                        return (
                          <SelectItem key={ct.key} value={ct.key}>
                            <span className="flex items-center gap-2">
                              {ct.label}
                              {!canSwitch && (
                                <Lock className="size-3.5 shrink-0 text-[#3D4035]/40" />
                              )}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
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
