"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Lock, Search } from "lucide-react";
import {
  CHART_LIBRARIES,
  getChartTypesByLibrary,
  type ChartLibraryId,
} from "@/lib/chart-registry";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface ChartLibrarySelectorProps {
  selectedChartKey: string | null;
  onSelect: (key: string) => void;
  /** When provided, shows Lock icon for incompatible types (e.g. edit page) */
  isDisabled?: (key: string) => boolean;
  /** Control library from outside, or leave undefined for internal state */
  activeLibrary?: ChartLibraryId;
  /** Callback when library changes (for controlled mode) */
  onLibraryChange?: (lib: ChartLibraryId) => void;
  className?: string;
}

/** Infer library from chart key */
function getLibraryFromKey(key: string): ChartLibraryId {
  return key.startsWith("shadcn:") ? "shadcn" : "rosencharts";
}

export function ChartLibrarySelector({
  selectedChartKey,
  onSelect,
  isDisabled,
  activeLibrary: controlledLib,
  onLibraryChange,
  className,
}: ChartLibrarySelectorProps) {
  const [internalLib, setInternalLib] = useState<ChartLibraryId>(() =>
    selectedChartKey ? getLibraryFromKey(selectedChartKey) : "rosencharts",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const activeLibrary = controlledLib ?? internalLib;

  useEffect(() => {
    if (selectedChartKey) {
      const lib = getLibraryFromKey(selectedChartKey);
      if (controlledLib == null) setInternalLib(lib);
    }
  }, [selectedChartKey, controlledLib]);

  const typesByLib = getChartTypesByLibrary();
  const allTypes = typesByLib[activeLibrary] ?? [];
  const filteredTypes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allTypes;
    return allTypes.filter(
      (ct) =>
        ct.label.toLowerCase().includes(q) ||
        ct.key.toLowerCase().includes(q),
    );
  }, [allTypes, searchQuery]);

  const setLibrary = (lib: ChartLibraryId) => {
    if (controlledLib == null) setInternalLib(lib);
    setSearchQuery("");
    onLibraryChange?.(lib);
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-xl border border-black/6 bg-white/80",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1">
        {/* Left: library icons sidebar */}
        <div className="flex shrink-0 flex-col items-center gap-1.5 border-r border-black/6 bg-[#3D4035]/3 px-2 py-3">
          {CHART_LIBRARIES.map((lib) => {
            const LibIcon = lib.icon;
            const isActive = activeLibrary === lib.id;
            const typesCount = typesByLib[lib.id]?.length ?? 0;
            if (typesCount === 0) return null;

            return (
              <button
                key={lib.id}
                type="button"
                onClick={() => setLibrary(lib.id)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg px-3 py-2.5 transition-colors",
                  isActive
                    ? "bg-primary/12 text-primary ring-1 ring-primary/20"
                    : "text-[#3D4035]/50 hover:bg-black/3 hover:text-[#3D4035]/70",
                )}
                title={lib.label}
              >
                <LibIcon className="size-4" strokeWidth={1.7} />
              </button>
            );
          })}
        </div>

        {/* Right: search + chart types list */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-black/6 px-3 py-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#3D4035]/40" />
              <Input
                type="search"
                placeholder="Search charts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 rounded-lg border-black/6 bg-white/60 pl-8 pr-3 text-[13px] placeholder:text-[#3D4035]/40"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {filteredTypes.length === 0 ? (
              <div className="py-10 text-center text-[12px] text-[#3D4035]/40">
                {searchQuery.trim()
                  ? "No matching charts"
                  : "No chart types"}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredTypes.map((ct) => {
                  const disabled = isDisabled?.(ct.key) ?? false;
                  const isSelected = selectedChartKey === ct.key;
                  const Icon = ct.icon;

                  return (
                    <button
                      key={ct.key}
                      type="button"
                      onClick={() => {
                        if (disabled) return;
                        onSelect(ct.key);
                      }}
                      disabled={disabled}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors",
                        isSelected
                          ? "bg-primary/12 text-primary"
                          : "text-[#3D4035] hover:bg-black/4",
                        disabled && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <Icon
                        className="size-3.5 shrink-0"
                        strokeWidth={1.7}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {ct.label}
                      </span>
                      {disabled ? (
                        <Lock className="size-3 shrink-0 text-[#3D4035]/40" />
                      ) : isSelected ? (
                        <Check className="size-3.5 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
