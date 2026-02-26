"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { TIER_LIMITS, type PlanTier } from "@/lib/tiers/tier-limits";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import {
  BarChart3,
  FileText,
  Presentation,
  Loader2,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface DowngradeLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetTier: PlanTier;
  targetTierLabel: string;
  onSuccess?: () => void;
  /** When true, Confirm redirects to Stripe billing portal instead of applyDowngrade */
  hasPaidSubscription?: boolean;
  onPaidDowngrade?: () => Promise<void>;
}

type ItemType = "charts" | "slides" | "documents";

function formatLimit(n: number): string {
  return n === Infinity ? "unlimited" : String(n);
}

const SECTION_CONFIG: {
  id: ItemType;
  label: string;
  labelPlural: string;
  icon: React.ElementType;
}[] = [
  { id: "charts", label: "Chart", labelPlural: "Charts", icon: BarChart3 },
  {
    id: "slides",
    label: "Slide deck",
    labelPlural: "Slide decks",
    icon: Presentation,
  },
  {
    id: "documents",
    label: "Document",
    labelPlural: "Documents",
    icon: FileText,
  },
];

export function DowngradeLimitModal({
  open,
  onOpenChange,
  targetTier,
  targetTierLabel,
  onSuccess,
  hasPaidSubscription,
  onPaidDowngrade,
}: DowngradeLimitModalProps) {
  const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
  const [selectedSlides, setSelectedSlides] = useState<Set<string>>(new Set());
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const charts = useQuery(api.charts.charts.listForPlanSelection) ?? [];
  const slides = useQuery(api.charts.slides.listForPlanSelection) ?? [];
  const documents =
    useQuery(api.documents.documents.listForPlanSelection) ?? [];

  const applyDowngrade = useMutation(
    api.tiers.planLimits.applyDowngradeSelection,
  );

  const limits = TIER_LIMITS[targetTier];
  const maxCharts = limits.maxCharts;
  const maxSlides = limits.maxSlides;
  const maxDocuments = limits.maxDocuments;

  const initializeSelection = useCallback(() => {
    const visibleCharts = charts.filter((c) => c.blockedByTier !== true);
    const visibleSlides = slides.filter((s) => s.blockedByTier !== true);
    const visibleDocs = documents.filter((d) => d.blockedByTier !== true);
    setSelectedCharts(
      new Set(visibleCharts.slice(0, maxCharts).map((c) => c._id)),
    );
    setSelectedSlides(
      new Set(visibleSlides.slice(0, maxSlides).map((s) => s._id)),
    );
    setSelectedDocs(
      new Set(visibleDocs.slice(0, maxDocuments).map((d) => d._id)),
    );
  }, [charts, slides, documents, maxCharts, maxSlides, maxDocuments]);

  useEffect(() => {
    if (open) {
      initializeSelection();
    }
  }, [open, initializeSelection]);

  const toggleChart = (id: string) => {
    setSelectedCharts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < maxCharts) next.add(id);
      return next;
    });
  };
  const toggleSlide = (id: string) => {
    setSelectedSlides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < maxSlides) next.add(id);
      return next;
    });
  };
  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < maxDocuments) next.add(id);
      return next;
    });
  };

  const canAccept =
    selectedCharts.size <= maxCharts &&
    selectedSlides.size <= maxSlides &&
    selectedDocs.size <= maxDocuments;

  const hiddenCount = useMemo(() => {
    const chartHidden =
      charts.filter((c) => c.blockedByTier !== true).length -
      selectedCharts.size;
    const slideHidden =
      slides.filter((s) => s.blockedByTier !== true).length -
      selectedSlides.size;
    const docHidden =
      documents.filter((d) => d.blockedByTier !== true).length -
      selectedDocs.size;
    return chartHidden + slideHidden + docHidden;
  }, [charts, slides, documents, selectedCharts, selectedSlides, selectedDocs]);

  async function handleAccept() {
    if (!canAccept) return;
    setSubmitting(true);
    try {
      if (hasPaidSubscription && onPaidDowngrade) {
        await onPaidDowngrade();
        onOpenChange(false);
        onSuccess?.();
      } else {
        await applyDowngrade({
          targetTier,
          chartIdsToKeep: Array.from(selectedCharts) as Id<"charts">[],
          slideIdsToKeep: Array.from(selectedSlides) as Id<"slides">[],
          documentIdsToKeep: Array.from(selectedDocs) as Id<"documents">[],
        });
        onOpenChange(false);
        onSuccess?.();
      }
    } catch {
      // TODO: toast error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col overflow-x-hidden overflow-y-hidden rounded-[24px] p-6 sm:w-full sm:max-w-3xl sm:rounded-[32px] sm:p-10 lg:max-w-5xl xl:max-w-6xl"
        showCloseButton
      >
        <DialogHeader className="shrink-0 px-6 sm:px-8 pt-6 sm:pt-8 pb-4 space-y-3">
          <DialogTitle className="text-[22px] sm:text-[26px] font-semibold text-[#3D4035]">
            Downgrade to {targetTierLabel}
          </DialogTitle>

          <div className="rounded-xl bg-[#3D4035]/5 border border-[#3D4035]/10 p-4 flex gap-3">
            <Info className="size-5 shrink-0 text-[#6C5DD3] mt-0.5" />
            <div className="text-[14px] sm:text-[15px] text-[#3D4035]/90 leading-relaxed space-y-1">
              <p className="font-medium text-[#3D4035]">
                The {targetTierLabel} plan lets you keep{" "}
                <strong>{formatLimit(maxCharts)} charts</strong>,{" "}
                <strong>{formatLimit(maxSlides)} slide decks</strong>, and{" "}
                <strong>{formatLimit(maxDocuments)} documents</strong> visible.
              </p>
              <p className="text-[#3D4035]/70">
                Select which items stay visible. Anything you don't select will
                be hidden (not deleted) until you upgrade again.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 pb-4 space-y-6">
          {SECTION_CONFIG.map((section) => {
            const Icon = section.icon;
            const items =
              section.id === "charts"
                ? charts
                : section.id === "slides"
                  ? slides
                  : documents;
            const selected =
              section.id === "charts"
                ? selectedCharts
                : section.id === "slides"
                  ? selectedSlides
                  : selectedDocs;
            const max =
              section.id === "charts"
                ? maxCharts
                : section.id === "slides"
                  ? maxSlides
                  : maxDocuments;
            const toggle =
              section.id === "charts"
                ? toggleChart
                : section.id === "slides"
                  ? toggleSlide
                  : toggleDoc;
            const visibleCount = items.filter(
              (i) => (i as { blockedByTier?: boolean }).blockedByTier !== true,
            ).length;

            const label =
              section.id === "charts"
                ? (i: (typeof charts)[0]) => i.title
                : section.id === "slides"
                  ? (i: (typeof slides)[0]) => i.name
                  : (i: (typeof documents)[0]) => i.name;
            const sublabel =
              section.id === "charts"
                ? (i: (typeof charts)[0]) => (i as { source?: string }).source
                : () => undefined;

            const overLimit = visibleCount > max;

            return (
              <section key={section.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-[15px] font-semibold text-[#3D4035]">
                    <Icon className="size-4 text-[#3D4035]/60" />
                    {section.labelPlural}
                    <span
                      className={cn(
                        "text-[13px] font-normal",
                        overLimit ? "text-amber-600" : "text-[#3D4035]/50",
                      )}
                    >
                      {max === Infinity
                        ? `(${selected.size} selected)`
                        : `(${selected.size} of ${max} selected)`}
                    </span>
                  </h3>
                </div>

                <div className="rounded-xl border border-[#3D4035]/10 bg-[#3D4035]/2 max-h-[180px] overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="py-6 text-center text-[14px] text-[#3D4035]/50">
                      No {section.labelPlural.toLowerCase()}
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#3D4035]/5">
                      {items.map((item) => {
                        const id = (item as { _id: string })._id;
                        const isSelected = selected.has(id);
                        const disabled = !isSelected && selected.size >= max;
                        return (
                          <li
                            key={id}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                              disabled && "opacity-50 cursor-not-allowed",
                              !disabled && "hover:bg-[#3D4035]/5",
                            )}
                            onClick={() => !disabled && toggle(id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => !disabled && toggle(id)}
                              disabled={disabled}
                              className="rounded-md shrink-0"
                            />
                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                              <span
                                className={cn(
                                  "text-[14px] break-words min-w-0",
                                  isSelected
                                    ? "text-[#3D4035]"
                                    : "text-[#3D4035]/70",
                                )}
                              >
                                {label(item as never)}
                              </span>
                              {sublabel(item as never) && (
                                <span className="text-[12px] text-[#3D4035]/45 shrink-0 sm:max-w-[200px] truncate">
                                  {sublabel(item as never)}
                                </span>
                              )}
                            </div>
                            {isSelected ? (
                              <Eye className="size-4 shrink-0 text-emerald-600/80" />
                            ) : (
                              <EyeOff className="size-4 shrink-0 text-[#3D4035]/30" />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-8 py-4 border-t border-[#3D4035]/10 bg-[#3D4035]/2 rounded-b-[28px] sm:rounded-b-[32px]">
          <p className="text-[13px] text-[#3D4035]/60">
            {hiddenCount > 0 ? (
              <>
                <strong className="text-[#3D4035]/80">{hiddenCount}</strong>{" "}
                item{hiddenCount !== 1 ? "s" : ""} will be hidden until you
                upgrade.
              </>
            ) : (
              <>All items fit within your new plan limits.</>
            )}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
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
              ) : hasPaidSubscription ? (
                "Manage in Billing"
              ) : (
                "Confirm downgrade"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
