"use client";

import { Switch } from "@/components/ui/switch";

interface SettingsEditorProps {
  withTooltip: boolean;
  withAnimation: boolean;
  onTooltipChange: (v: boolean) => void;
  onAnimationChange: (v: boolean) => void;
}

export function SettingsEditor({
  withTooltip,
  withAnimation,
  onTooltipChange,
  onAnimationChange,
}: SettingsEditorProps) {
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
    </div>
  );
}
