"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface SettingsEditorProps {
  chartType: string;
  withTooltip: boolean;
  withAnimation: boolean;
  onTooltipChange: (v: boolean) => void;
  onAnimationChange: (v: boolean) => void;
  chartSettings: Record<string, unknown>;
  onChartSettingsChange: (v: Record<string, unknown>) => void;
}

export function SettingsEditor({
  chartType,
  withTooltip,
  withAnimation,
  onTooltipChange,
  onAnimationChange,
  chartSettings,
  onChartSettingsChange,
}: SettingsEditorProps) {
  const areaFillStyle =
    (chartSettings.areaFillStyle as "gradient" | "full" | "outline") ?? "gradient";
  const withLabels =
    (chartSettings.withLabels as boolean | undefined) ?? true;
  const withLegend =
    (chartSettings.withLegend as boolean | undefined) ?? true;

  const lineType =
    (chartSettings.lineType as "curved" | "linear" | "step") ?? "curved";

  const isBarChart =
    chartType === "shadcn:bar" ||
    chartType === "shadcn:bar-stacked" ||
    chartType === "shadcn:bar-horizontal";
  const isStackedBar = chartType === "shadcn:bar-stacked";
  const isHorizontalBar = chartType === "shadcn:bar-horizontal";
  const categoryLabelPosition =
    (chartSettings.categoryLabelPosition as "inside" | "outside") ?? "inside";

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-[13px] font-semibold tracking-wide text-[#3D4035]/60 uppercase">
        Display options
      </h3>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]">
        <div>
          <p className="text-[14px] font-medium text-[#3D4035]">Tooltips</p>
          <p className="text-[12px] text-[#3D4035]/50">Show value on hover</p>
        </div>
        <Switch checked={withTooltip} onCheckedChange={onTooltipChange} />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]">
        <div>
          <p className="text-[14px] font-medium text-[#3D4035]">Animation</p>
          <p className="text-[12px] text-[#3D4035]/50">Animate chart on load</p>
        </div>
        <Switch checked={withAnimation} onCheckedChange={onAnimationChange} />
      </div>

      {isBarChart && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]">
          <div>
            <p className="text-[14px] font-medium text-[#3D4035]">Labels</p>
            <p className="text-[12px] text-[#3D4035]/50">
              Show values on bars
            </p>
          </div>
          <Switch
            checked={withLabels}
            onCheckedChange={(v) =>
              onChartSettingsChange({ ...chartSettings, withLabels: v })
            }
          />
        </div>
      )}

      {isHorizontalBar && (
        <div className="flex flex-col gap-2 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]">
          <div>
            <p className="text-[14px] font-medium text-[#3D4035]">
              Category label position
            </p>
            <p className="text-[12px] text-[#3D4035]/50">
              On bar or outside (axis)
            </p>
          </div>
          <Select
            value={categoryLabelPosition}
            onValueChange={(v) =>
              onChartSettingsChange({
                ...chartSettings,
                categoryLabelPosition: v as "inside" | "outside",
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inside">On bar</SelectItem>
              <SelectItem value="outside">Outside (axis)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isStackedBar && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]">
          <div>
            <p className="text-[14px] font-medium text-[#3D4035]">Legend</p>
            <p className="text-[12px] text-[#3D4035]/50">
              Show series legend
            </p>
          </div>
          <Switch
            checked={withLegend}
            onCheckedChange={(v) =>
              onChartSettingsChange({ ...chartSettings, withLegend: v })
            }
          />
        </div>
      )}

      {chartType === "shadcn:line" && (
        <div className="flex flex-col gap-2 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]">
          <div>
            <p className="text-[14px] font-medium text-[#3D4035]">Line type</p>
            <p className="text-[12px] text-[#3D4035]/50">
              Curved, linear, or step
            </p>
          </div>
          <Select
            value={lineType}
            onValueChange={(v) =>
              onChartSettingsChange({
                ...chartSettings,
                lineType: v as "curved" | "linear" | "step",
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="curved">Curved</SelectItem>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="step">Step</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {chartType === "area" && (
        <div className="flex flex-col gap-2 rounded-xl bg-white/60 px-4 py-3 ring-1 ring-black/[0.03]">
          <div>
            <p className="text-[14px] font-medium text-[#3D4035]">Area fill style</p>
            <p className="text-[12px] text-[#3D4035]/50">
              Gradient, solid, or outlined
            </p>
          </div>
          <Select
            value={areaFillStyle}
            onValueChange={(v) =>
              onChartSettingsChange({
                ...chartSettings,
                areaFillStyle: v as "gradient" | "full" | "outline",
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="full">Full (solid)</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
