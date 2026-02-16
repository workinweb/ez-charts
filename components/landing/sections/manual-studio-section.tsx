"use client";

import { Database, Paintbrush, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type EditorTab = "data" | "colors" | "settings";

const TABS: { id: EditorTab; label: string; icon: React.ElementType }[] = [
  { id: "data", label: "Data", icon: Database },
  { id: "colors", label: "Colors", icon: Paintbrush },
  { id: "settings", label: "Settings", icon: Settings2 },
];

const ROTATION_MS = 7000;

/** Min-height (px) per tab for smooth height transitions */
const TAB_HEIGHTS: Record<EditorTab, number> = {
  data: 340,
  colors: 280,
  settings: 200,
};

export function ManualStudioSection() {
  const [activeTab, setActiveTab] = useState<EditorTab>("data");
  const [isAutomatic, setIsAutomatic] = useState(true);

  useEffect(() => {
    if (!isAutomatic) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const idx = TABS.findIndex((t) => t.id === prev);
        const next = TABS[(idx + 1) % TABS.length];
        return next.id;
      });
    }, ROTATION_MS);
    return () => clearInterval(interval);
  }, [isAutomatic]);

  return (
    <section className="translate-y-[-50px] overflow-hidden rounded-t-[3rem]  bg-[#111827] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-center gap-20 lg:flex-row-reverse">
          <div className="relative flex w-full flex-col gap-6 lg:w-1/2">
            {/* Automatic / Manual toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#1F2937] p-3 shadow-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Preview mode
              </p>
              <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
                <button
                  type="button"
                  onClick={() => setIsAutomatic(true)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                    isAutomatic
                      ? "bg-[#6C5DD3]/20 text-[#6C5DD3]"
                      : "text-slate-400 hover:text-slate-300",
                  )}
                >
                  Automatic
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutomatic(false)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                    !isAutomatic
                      ? "bg-[#6C5DD3]/20 text-[#6C5DD3]"
                      : "text-slate-400 hover:text-slate-300",
                  )}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* Editor tabs */}
            <div className="rounded-2xl border border-white/10 bg-[#1F2937] p-3 shadow-xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Editor panel
              </p>
              <div className="flex gap-1 rounded-xl bg-white/5 p-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:text-slate-300",
                        isActive
                          ? "bg-[#6C5DD3]/20 text-[#6C5DD3]"
                          : "text-slate-400",
                      )}
                    >
                      <Icon className="size-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content: cycles Data / Colors / Settings */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ minHeight: `${TAB_HEIGHTS[activeTab]}px` }}
            >
              {/* Data tab content */}
              {activeTab === "data" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  <div className="rounded-2xl border border-white/10 bg-[#1F2937] p-3 shadow-xl">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Spreadsheet view
                    </p>
                    <div className="overflow-hidden rounded-xl border border-white/5 bg-[#111827]">
                      <div className="flex border-b border-white/5 bg-white/5">
                        <div className="flex-1 border-r border-white/5 px-2 py-2 text-[10px] font-semibold text-slate-400">
                          month
                        </div>
                        <div className="flex-1 border-r border-white/5 px-2 py-2 text-[10px] font-semibold text-slate-400">
                          series1
                        </div>
                        <div className="flex-1 px-2 py-2 text-[10px] font-semibold text-slate-400">
                          series2
                        </div>
                      </div>
                      <div className="flex border-b border-white/5">
                        <div className="flex-1 border-r border-white/5 px-2 py-2 text-[11px] text-slate-300">
                          Jan
                        </div>
                        <div className="flex-1 border-r border-white/5 px-2 py-2 text-[11px] text-slate-300">
                          120
                        </div>
                        <div className="flex-1 px-2 py-2 text-[11px] text-slate-300">
                          85
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-1 border-r border-white/5 px-2 py-2 text-[11px] text-slate-300">
                          Feb
                        </div>
                        <div className="flex-1 border-r border-white/5 px-2 py-2 text-[11px] text-slate-300">
                          180
                        </div>
                        <div className="flex-1 px-2 py-2 text-[11px] text-slate-300">
                          95
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#1F2937] p-3 shadow-xl">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Cards view
                    </p>
                    <div className="space-y-2 rounded-xl border border-white/5 bg-[#111827] p-3">
                      <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                        <div className="size-3 text-slate-500">⋮⋮</div>
                        <span className="flex-1 text-xs font-medium text-slate-300">
                          Item A
                        </span>
                        <span className="text-slate-500">▾</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-[#6C5DD3]/10 px-3 py-2 ring-1 ring-[#6C5DD3]/30">
                        <div className="size-3 text-slate-500">⋮⋮</div>
                        <span className="flex-1 text-xs font-medium text-white">
                          Item B
                        </span>
                        <span className="text-slate-400">▴</span>
                      </div>
                      <div className="rounded-lg bg-white/5 px-3 py-2 pl-8">
                        <div className="mb-2 flex gap-2">
                          <span className="text-[10px] text-slate-500">
                            Label
                          </span>
                          <span className="text-[10px] text-slate-300">
                            Item B
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[10px] text-slate-500">
                            Value
                          </span>
                          <span className="text-[10px] text-slate-300">42</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Colors tab content */}
              {activeTab === "colors" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  <div className="rounded-2xl border border-white/10 bg-[#1F2937] p-3 shadow-xl">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Slice colors
                    </p>
                    <div className="space-y-2 rounded-xl border border-white/5 bg-[#111827] p-3">
                      {[
                        { name: "Revenue", color: "#6C5DD3" },
                        { name: "Costs", color: "#3D4035" },
                        { name: "Profit", color: "#10B981" },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2"
                        >
                          <span className="flex-1 text-xs font-medium text-slate-300">
                            {item.name}
                          </span>
                          <div
                            className="size-6 cursor-pointer rounded-md border border-white/10"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#1F2937] p-3 shadow-xl">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Series colors
                    </p>
                    <div className="flex flex-wrap gap-3 rounded-xl border border-white/5 bg-[#111827] p-4">
                      {[
                        "#6C5DD3",
                        "#8B5CF6",
                        "#0EA5E9",
                        "#10B981",
                        "#F59E0B",
                      ].map((c) => (
                        <div
                          key={c}
                          className="size-8 cursor-pointer rounded-full ring-2 ring-white/20 transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings tab content */}
              {activeTab === "settings" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  <div className="rounded-2xl border border-white/10 bg-[#1F2937] p-3 shadow-xl">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Display options
                    </p>
                    <div className="space-y-2 rounded-xl border border-white/5 bg-[#111827] p-3">
                      <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-3">
                        <div>
                          <p className="text-xs font-medium text-slate-300">
                            Tooltips
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Show value on hover
                          </p>
                        </div>
                        <div className="h-5 w-9 rounded-full bg-[#6C5DD3] p-0.5">
                          <div className="ml-auto size-4 rounded-full bg-white" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-3">
                        <div>
                          <p className="text-xs font-medium text-slate-300">
                            Animation
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Animate chart on load
                          </p>
                        </div>
                        <div className="h-5 w-9 rounded-full bg-white/20 p-0.5">
                          <div className="size-4 rounded-full bg-slate-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="mb-8 size-12 rounded-full bg-[#6C5DD3]" />
            <h2 className="mb-6 text-4xl font-medium uppercase leading-tight tracking-tight text-white">
              Manual control when{" "}
              <span className="text-slate-400">you need it.</span>
            </h2>
            <p className="mb-10 text-lg font-medium leading-relaxed text-slate-400">
              Prefer spreadsheets or expandable cards? Choose your style. Edit
              data, tweak colors, and adjust settings—all without leaving the
              editor.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
                <h4 className="mb-2 font-bold text-white">Data & Colors</h4>
                <p className="text-xs leading-relaxed text-slate-400">
                  Spreadsheet or cards for data. Full color control for styling.
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
                <h4 className="mb-2 font-bold text-white">Your Preference</h4>
                <p className="text-xs leading-relaxed text-slate-400">
                  Set your editor style in account settings. Same UX everywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
