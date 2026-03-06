"use client";

import { BarChart3, Bot, FileText, Pencil, Presentation } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ROTATION_MS = 5000;

const ITEMS = [
  {
    id: "charts",
    icon: BarChart3,
    label: "Charts",
    headline: "Save and organize your work",
    description:
      "All your charts in one place. Find them quickly, share with a link, or embed in presentations.",
  },
  {
    id: "editor",
    icon: Pencil,
    label: "Editor",
    headline: "Full control over your data",
    description:
      "Edit data in a spreadsheet or expandable cards. Tweak colors per slice or series. Toggle tooltips and animations—no code required.",
  },
  {
    id: "ai-assistant",
    icon: Bot,
    label: "AI Assistant",
    headline: "Chat with your data",
    description:
      'Ask in plain English: "Make a bar chart of quarterly revenue" or "Turn this into a donut." The AI creates and refines charts on the fly.',
  },
  {
    id: "slides",
    icon: Presentation,
    label: "Slide decks",
    headline: "Present your data",
    description:
      "Build slide decks from your charts. One click to add, drag to reorder. Present with confidence.",
  },
  {
    id: "documents",
    icon: FileText,
    label: "Documents",
    headline: "Your data, ready for the AI",
    description:
      "Upload CSV, Excel, or PDF. The AI reads it and suggests the right chart. Pro plans save files to your account.",
  },
] as const;

export function TrustedBySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutomatic, setIsAutomatic] = useState(true);

  const active = ITEMS[activeIndex].id;
  const current = ITEMS[activeIndex];

  useEffect(() => {
    if (!isAutomatic) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % ITEMS.length);
    }, ROTATION_MS);
    return () => clearInterval(interval);
  }, [isAutomatic]);

  return (
    <section className="bg-[#F2F4F7] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <div className="mb-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6C5DD3]">
            Our Tool for you
          </div>
          <h2 className="mb-4 text-3xl font-medium uppercase tracking-tight text-slate-900 md:text-4xl">
            Everything in one place
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base font-medium text-slate-600">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.id} className="flex items-center gap-1.5">
                  <Icon className="size-4 text-[#6C5DD3]" strokeWidth={1.75} />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#F8FAFC] shadow-xl">
          <div className="flex flex-col gap-8 p-8 lg:flex-row lg:items-stretch lg:gap-12 lg:p-10">
            {/* Left: selector cards only */}
            <div className="flex flex-1 flex-col">
              <div className="space-y-3">
                {ITEMS.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveIndex(idx);
                        setIsAutomatic(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors",
                        isActive
                          ? "border-[#6C5DD3]/40 bg-[#6C5DD3]/5 ring-1 ring-[#6C5DD3]/20"
                          : "border-slate-200/80 bg-white hover:border-slate-200",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg border",
                          isActive
                            ? "border-[#6C5DD3]/30 bg-white text-[#6C5DD3]"
                            : "border-slate-200 bg-slate-50 text-slate-500",
                        )}
                      >
                        <Icon className="size-5" strokeWidth={1.75} />
                      </div>
                      <span
                        className={cn(
                          "font-semibold",
                          isActive ? "text-slate-900" : "text-slate-600",
                        )}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: dynamic visual + Save and organize + Preview toggle */}
            <div className="flex min-h-[340px] flex-1 flex-col gap-6 lg:min-h-[400px]">
              <div className="w-full max-w-xl shrink-0">
                {active === "charts" && (
                  <div
                    key="charts"
                    className="animate-in fade-in duration-300 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
                  >
                    <div className="mb-5 flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-slate-300" />
                      <div className="size-2.5 rounded-full bg-slate-300" />
                      <div className="size-2.5 rounded-full bg-slate-300" />
                      <span className="ml-2 text-xs font-medium text-slate-500">
                        My Charts
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="aspect-4/3 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                        >
                          <div className="flex h-full items-end gap-0.5">
                            <div className="h-[40%] flex-1 rounded-sm bg-slate-200" />
                            <div className="h-[65%] flex-1 rounded-sm bg-slate-200" />
                            <div className="h-[50%] flex-1 rounded-sm bg-slate-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {active === "editor" && (
                  <div
                    key="editor"
                    className="animate-in fade-in duration-300 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
                  >
                    <div className="mb-5 flex gap-2">
                      {["Data", "Colors", "Settings"].map((tab, i) => (
                        <div
                          key={tab}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium",
                            i === 0
                              ? "bg-[#6C5DD3]/10 text-[#6C5DD3]"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                      {["Jan", "Feb", "Mar", "Apr"].map((m, i) => (
                        <div
                          key={m}
                          className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2"
                        >
                          <span className="text-xs text-slate-600">{m}</span>
                          <span className="text-xs font-medium text-slate-800">
                            {[186, 305, 237, 73][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {active === "ai-assistant" && (
                  <div
                    key="ai-assistant"
                    className="animate-in fade-in duration-300 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <div className="size-8 shrink-0 rounded-full bg-[#6C5DD3]/10" />
                      <div className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs text-slate-700">
                        Make a bar chart of Q1 revenue
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="size-8 shrink-0 overflow-hidden rounded-full bg-slate-200" />
                      <div className="rounded-xl bg-[#6C5DD3]/10 px-4 py-2.5 text-xs text-slate-700">
                        Here&apos;s your chart. Want to change the colors?
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
                      <input
                        type="text"
                        placeholder="Reply..."
                        className="flex-1 bg-transparent px-3 py-1.5 text-xs focus:outline-none"
                        readOnly
                      />
                      <button className="rounded-full bg-[#6C5DD3] p-1.5 text-white">
                        →
                      </button>
                    </div>
                  </div>
                )}

                {active === "slides" && (
                  <div
                    key="slides"
                    className="animate-in fade-in duration-300 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
                  >
                    <div className="mb-5 flex gap-3">
                      <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-5">
                        <div className="mb-4 h-2.5 w-3/4 rounded bg-slate-200" />
                        <div className="flex gap-3">
                          <div className="h-20 flex-1 rounded bg-slate-100" />
                          <div className="h-20 flex-1 rounded bg-slate-100" />
                        </div>
                      </div>
                      <div className="flex w-24 flex-col gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="aspect-video rounded border border-slate-200 bg-white"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Slide 1 of 4</p>
                  </div>
                )}

                {active === "documents" && (
                  <div
                    key="documents"
                    className="animate-in fade-in duration-300 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
                  >
                    <div className="mb-5 flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-slate-300" />
                      <span className="text-xs font-medium text-slate-500">
                        Documents
                      </span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: "Q4 revenue.csv", ext: "csv" },
                        { name: "Sales report.xlsx", ext: "xlsx" },
                        { name: "Summary.pdf", ext: "pdf" },
                      ].map((f) => (
                        <div
                          key={f.name}
                          className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3"
                        >
                          <div className="flex size-10 items-center justify-center rounded bg-slate-200 text-xs font-medium text-slate-500">
                            .{f.ext}
                          </div>
                          <span className="flex-1 truncate text-base text-slate-700">
                            {f.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Save and organize + Preview toggle — under dynamic part */}
              <div className="flex flex-col gap-4">
                <div key={active} className="animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-slate-900">
                    {current.headline}
                  </h3>
                  <p className="mt-3 text-slate-600">{current.description}</p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Preview
                  </span>
                  <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => setIsAutomatic(true)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                        isAutomatic
                          ? "bg-[#6C5DD3]/20 text-[#6C5DD3]"
                          : "text-slate-500 hover:text-slate-700",
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
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  {ITEMS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setActiveIndex(i);
                        setIsAutomatic(false);
                      }}
                      className={cn(
                        "size-2 rounded-full transition-colors",
                        i === activeIndex
                          ? "bg-[#6C5DD3]"
                          : "bg-slate-200 hover:bg-slate-300",
                      )}
                      aria-label={`Show ${ITEMS[i].label}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
