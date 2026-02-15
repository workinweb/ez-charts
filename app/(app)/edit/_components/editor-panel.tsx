"use client";

import { Database, Paintbrush, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorTab, EditorShape } from "./editor-types";
import { DataEditor } from "./data-editor";
import { StyleEditor } from "./style-editor";
import { SettingsEditor } from "./settings-editor";
import { ShadcnDataEditor } from "./shadcn/shadcn-data-editor";
import { ShadcnStyleEditor } from "./shadcn/shadcn-style-editor";

const tabs: { id: EditorTab; label: string; icon: React.ElementType }[] = [
  { id: "data", label: "Data", icon: Database },
  { id: "style", label: "Colors", icon: Paintbrush },
  { id: "settings", label: "Settings", icon: Settings2 },
];

interface EditorPanelProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  chartType: string;
  editorShape: EditorShape | null;
  data: unknown;
  onDataChange: (data: unknown) => void;
  withTooltip: boolean;
  withAnimation: boolean;
  onTooltipChange: (v: boolean) => void;
  onAnimationChange: (v: boolean) => void;
}

const isShadcnChart = (chartType: string) => chartType.startsWith("shadcn:");

export function EditorPanel({
  activeTab,
  onTabChange,
  chartType,
  editorShape,
  data,
  onDataChange,
  withTooltip,
  withAnimation,
  onTooltipChange,
  onAnimationChange,
}: EditorPanelProps) {
  const useShadcnEditors = isShadcnChart(chartType);
  return (
    <div className="order-2 flex min-w-0 flex-col gap-4 sm:gap-5">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl bg-white/80 p-1 shadow-sm ring-1 ring-black/[0.02] sm:rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium transition-colors sm:gap-2 sm:rounded-xl sm:px-3 sm:text-[13px]",
                activeTab === tab.id
                  ? "bg-[#6C5DD3]/10 text-[#6C5DD3]"
                  : "text-[#3D4035]/50 hover:bg-black/[0.03] hover:text-[#3D4035]/70",
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel content — overflow-auto lets narrow panels scroll to reveal clipped controls */}
      <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[28px] sm:p-5 lg:rounded-[40px] lg:p-6">
        {activeTab === "data" &&
          (useShadcnEditors ? (
            <ShadcnDataEditor
              chartType={chartType}
              data={data}
              onChange={onDataChange}
            />
          ) : (
            editorShape && (
              <DataEditor
                shape={editorShape}
                data={data}
                onChange={onDataChange}
              />
            )
          ))}
        {activeTab === "style" &&
          (useShadcnEditors ? (
            <ShadcnStyleEditor
              chartType={chartType}
              data={data}
              onChange={onDataChange}
            />
          ) : (
            editorShape && (
              <StyleEditor
                shape={editorShape}
                data={data}
                onChange={onDataChange}
              />
            )
          ))}
        {activeTab === "settings" && (
          <SettingsEditor
            withTooltip={withTooltip}
            withAnimation={withAnimation}
            onTooltipChange={onTooltipChange}
            onAnimationChange={onAnimationChange}
          />
        )}
      </div>
    </div>
  );
}
