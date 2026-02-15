"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { TIER_LIMITS, type PlanTier } from "@/lib/tier-limits";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { BarChart3, FileText, Presentation, Search, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";

type TabId = "charts" | "slides" | "documents";

const TAB_CONFIG: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "charts", label: "Charts", icon: BarChart3 },
  { id: "slides", label: "Slide decks", icon: Presentation },
  { id: "documents", label: "Documents", icon: FileText },
];

interface DowngradeLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetTier: PlanTier;
  targetTierLabel: string;
  onSuccess?: () => void;
}

export function DowngradeLimitModal({
  open,
  onOpenChange,
  targetTier,
  targetTierLabel,
  onSuccess,
}: DowngradeLimitModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("charts");
  const [search, setSearch] = useState("");
  const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
  const [selectedSlides, setSelectedSlides] = useState<Set<string>>(new Set());
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const charts = useQuery(api.charts.listForPlanSelection) ?? [];
  const slides = useQuery(api.slides.listForPlanSelection) ?? [];
  const documents = useQuery(api.documents.listForPlanSelection) ?? [];

  const applyDowngrade = useMutation(api.planLimits.applyDowngradeSelection);

  const limits = TIER_LIMITS[targetTier];
  const maxCharts = limits.maxCharts;
  const maxSlides = limits.maxSlides;
  const maxDocuments = limits.maxDocuments;

  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) {
      const visibleCharts = charts.filter((c) => c.blockedByTier !== true);
      const visibleSlides = slides.filter((s) => s.blockedByTier !== true);
      const visibleDocs = documents.filter((d) => d.blockedByTier !== true);
      setSelectedCharts(
        new Set(visibleCharts.slice(0, maxCharts).map((c) => c._id))
      );
      setSelectedSlides(
        new Set(visibleSlides.slice(0, maxSlides).map((s) => s._id))
      );
      setSelectedDocs(
        new Set(visibleDocs.slice(0, maxDocuments).map((d) => d._id))
      );
      setSearch("");
    }
    prevOpen.current = open;
  }, [open, maxCharts, maxSlides, maxDocuments, charts, slides, documents]);

  const filteredCharts = useMemo(() => {
    if (!search.trim()) return charts;
    const q = search.toLowerCase();
    return charts.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.source?.toLowerCase().includes(q)
    );
  }, [charts, search]);
  const filteredSlides = useMemo(() => {
    if (!search.trim()) return slides;
    const q = search.toLowerCase();
    return slides.filter((s) => s.name.toLowerCase().includes(q));
  }, [slides, search]);
  const filteredDocuments = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase();
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q)
    );
  }, [documents, search]);

  function toggleChart(id: string) {
    setSelectedCharts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < maxCharts) next.add(id);
      return next;
    });
  }
  function toggleSlide(id: string) {
    setSelectedSlides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < maxSlides) next.add(id);
      return next;
    });
  }
  function toggleDoc(id: string) {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < maxDocuments) next.add(id);
      return next;
    });
  }

  const canAccept =
    selectedCharts.size <= maxCharts &&
    selectedSlides.size <= maxSlides &&
    selectedDocs.size <= maxDocuments;

  async function handleAccept() {
    if (!canAccept) return;
    setSubmitting(true);
    try {
      await applyDowngrade({
        targetTier,
        chartIdsToKeep: Array.from(selectedCharts) as Id<"charts">[],
        slideIdsToKeep: Array.from(selectedSlides) as Id<"slides">[],
        documentIdsToKeep: Array.from(selectedDocs) as Id<"documents">[],
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // TODO: toast error
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    onOpenChange(false);
  }

  const searchPlaceholder =
    activeTab === "charts"
      ? "Search charts by title or source…"
      : activeTab === "slides"
        ? "Search slide decks by name…"
        : "Search documents by name or content…";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl rounded-[28px] sm:rounded-[32px] p-0 overflow-hidden flex flex-col max-h-[85vh]"
        showCloseButton
      >
        <DialogHeader className="p-6 pb-4 space-y-1">
          <DialogTitle className="text-[22px] font-semibold text-[#3D4035]">
            Choose what stays visible
          </DialogTitle>
          <p className="text-[14px] text-[#3D4035]/60">
            Your {targetTierLabel} plan limits: {maxCharts} charts, {maxSlides} slide decks,{" "}
            {maxDocuments} documents. Select which to keep accessible.
          </p>
        </DialogHeader>

        <p className="px-6 text-[13px] text-[#3D4035]/70 bg-amber-50/80 border-y border-amber-200/60 py-3">
          Nothing will be erased. Items you don’t select will be hidden until you upgrade again.
        </p>

        <div className="flex border-b border-[#3D4035]/10 px-6">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === "charts"
                ? charts.length
                : tab.id === "slides"
                  ? slides.length
                  : documents.length;
            const limit =
              tab.id === "charts"
                ? maxCharts
                : tab.id === "slides"
                  ? maxSlides
                  : maxDocuments;
            const overLimit = count > limit;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-[14px] font-medium border-b-2 -mb-px transition-colors",
                  activeTab === tab.id
                    ? "border-[#6C5DD3] text-[#6C5DD3]"
                    : "border-transparent text-[#3D4035]/60 hover:text-[#3D4035]",
                )}
              >
                <Icon className="size-4" />
                {tab.label}
                {overLimit && (
                  <span className="text-[11px] text-amber-600 font-medium">
                    ({count}/{limit})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#3D4035]/40" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-[200px] rounded-xl border border-[#3D4035]/10 bg-[#3D4035]/[0.02]">
            {activeTab === "charts" && (
              <ul className="divide-y divide-[#3D4035]/5">
                {filteredCharts.length === 0 ? (
                  <li className="py-8 text-center text-[14px] text-[#3D4035]/50">
                    {search ? "No matching charts" : "No charts"}
                  </li>
                ) : (
                  filteredCharts.map((chart) => {
                    const id = chart._id;
                    const selected = selectedCharts.has(id);
                    const disabled =
                      !selected && selectedCharts.size >= maxCharts;
                    return (
                      <li
                        key={id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-[#3D4035]/5",
                          disabled && "opacity-60",
                        )}
                        onClick={() => !disabled && toggleChart(id)}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => !disabled && toggleChart(id)}
                          disabled={disabled}
                          className="rounded-md"
                        />
                        <span className="flex-1 truncate text-[14px] text-[#3D4035]">
                          {chart.title}
                        </span>
                        <span className="text-[12px] text-[#3D4035]/50">
                          {chart.source}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
            {activeTab === "slides" && (
              <ul className="divide-y divide-[#3D4035]/5">
                {filteredSlides.length === 0 ? (
                  <li className="py-8 text-center text-[14px] text-[#3D4035]/50">
                    {search ? "No matching slide decks" : "No slide decks"}
                  </li>
                ) : (
                  filteredSlides.map((slide) => {
                    const id = slide._id;
                    const selected = selectedSlides.has(id);
                    const disabled =
                      !selected && selectedSlides.size >= maxSlides;
                    return (
                      <li
                        key={id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-[#3D4035]/5",
                          disabled && "opacity-60",
                        )}
                        onClick={() => !disabled && toggleSlide(id)}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => !disabled && toggleSlide(id)}
                          disabled={disabled}
                          className="rounded-md"
                        />
                        <span className="flex-1 truncate text-[14px] text-[#3D4035]">
                          {slide.name}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
            {activeTab === "documents" && (
              <ul className="divide-y divide-[#3D4035]/5">
                {filteredDocuments.length === 0 ? (
                  <li className="py-8 text-center text-[14px] text-[#3D4035]/50">
                    {search ? "No matching documents" : "No documents"}
                  </li>
                ) : (
                  filteredDocuments.map((doc) => {
                    const id = doc._id;
                    const selected = selectedDocs.has(id);
                    const disabled = !selected && selectedDocs.size >= maxDocuments;
                    return (
                      <li
                        key={id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-[#3D4035]/5",
                          disabled && "opacity-60",
                        )}
                        onClick={() => !disabled && toggleDoc(id)}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => !disabled && toggleDoc(id)}
                          disabled={disabled}
                          className="rounded-md"
                        />
                        <span className="flex-1 truncate text-[14px] text-[#3D4035]">
                          {doc.name}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#3D4035]/10">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!canAccept || submitting}
            className="rounded-xl bg-[#6C5DD3] hover:bg-[#5a4dbf] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Accept"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
