"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { authClient } from "@/lib/(auth)/auth-client";
import { TIER_DOC, TIER_LIMITS, type PlanTier } from "@/lib/tier-limits";
import { cn } from "@/lib/utils";
import { ArrowRight, Coins, Zap } from "lucide-react";
import { useState } from "react";
import { DowngradeLimitModal } from "./downgrade-limit-modal";

export type { PlanTier };

const PLANS: {
  tier: PlanTier;
  label: string;
  credits: number;
  price: string;
}[] = [
  { tier: "free", label: "Free", credits: 100, price: "$0" },
  { tier: "pro", label: "Pro", credits: 250, price: "$4.99/mo" },
  { tier: "max", label: "Max", credits: 600, price: "$9.99/mo" },
];

interface PlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlansDialog({ open, onOpenChange }: PlansDialogProps) {
  const { data: session } = authClient.useSession();
  const settings = useQuery(api.userSettings.get, session?.user ? {} : "skip");
  const charts = useQuery(api.charts.list, session?.user ? {} : "skip");
  const slides = useQuery(api.slides.list, session?.user ? {} : "skip");
  const documents = useQuery(api.documents.list, session?.user ? {} : "skip");
  const hasBlockedItems = useQuery(api.planLimits.hasBlockedItems, session?.user ? {} : "skip");
  const upsertPlan = useMutation(api.userSettings.upsert);
  const [downgradeModal, setDowngradeModal] = useState<{
    open: boolean;
    targetTier: PlanTier;
    targetLabel: string;
  }>({ open: false, targetTier: "free", targetLabel: "Free" });

  const currentTier = (settings?.planTier ?? "free") as PlanTier;

  const chartCount = charts?.length ?? 0;
  const slideCount = slides?.length ?? 0;
  const docCount = documents?.length ?? 0;

  function hasOverflowForTier(tier: PlanTier) {
    const lim = TIER_LIMITS[tier];
    return (
      chartCount > lim.maxCharts ||
      slideCount > lim.maxSlides ||
      docCount > lim.maxDocuments
    );
  }

  async function handleSelectPlan(tier: PlanTier) {
    if (tier === currentTier) return;
    const isDowngrade =
      (tier === "free" && currentTier !== "free") ||
      (tier === "pro" && currentTier === "max");
    const isUpgrade =
      (tier === "pro" && currentTier === "free") ||
      (tier === "max" && currentTier !== "max");

    const needsSelectionModal =
      (isDowngrade && hasOverflowForTier(tier)) ||
      (isUpgrade && hasBlockedItems === true);

    if (needsSelectionModal) {
      const plan = PLANS.find((p) => p.tier === tier);
      setDowngradeModal({
        open: true,
        targetTier: tier,
        targetLabel: plan?.label ?? tier,
      });
    } else {
      try {
        await upsertPlan({ planTier: tier });
        onOpenChange(false);
      } catch {
        // Error handling - could add toast
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl w-[95vw] sm:w-full rounded-[28px] sm:rounded-[32px] p-6 sm:p-8"
        showCloseButton
      >
        <DialogHeader className="space-y-2 mb-8">
          <DialogTitle className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-[#3D4035]">
            Pick your pace
          </DialogTitle>
          <p className="text-[15px] text-[#3D4035]/55">
            Credits fuel the AI. Top up whenever you need.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.tier;
            const isUpgrade =
              (plan.tier === "pro" && currentTier === "free") ||
              (plan.tier === "max" && currentTier !== "max");
            const isDowngrade =
              (plan.tier === "free" && currentTier !== "free") ||
              (plan.tier === "pro" && currentTier === "max");
            const isPro = plan.tier === "pro";

            return (
              <div
                key={plan.tier}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[24px] sm:rounded-[28px] transition-all",
                  isPro
                    ? "bg-[#354052] p-6 sm:p-8 text-white"
                    : "bg-[#E9EEF0]/80 p-6 sm:p-8 ring-1 ring-[#3D4035]/6",
                  isCurrent && !isPro && "ring-2 ring-[#6C5DD3]/40",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span
                        className={cn(
                          "text-[20px] sm:text-[22px] font-semibold",
                          isPro ? "text-white" : "text-[#3D4035]",
                        )}
                      >
                        {plan.label}
                      </span>
                      <span
                        className={cn(
                          "text-[15px] sm:text-[16px]",
                          isPro ? "text-white/60" : "text-[#3D4035]/50",
                        )}
                      >
                        {plan.credits}{" "}
                        <Coins
                          className={cn(
                            "inline size-4 -mt-px",
                            isPro ? "text-white/50" : "text-[#6C5DD3]/60",
                          )}
                        />
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-1.5 text-[14px] sm:text-[15px]",
                        isPro ? "text-white/50" : "text-[#3D4035]/45",
                      )}
                    >
                      {TIER_DOC[plan.tier].tagline}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-3">
                    <span
                      className={cn(
                        "text-[22px] sm:text-[24px] font-bold tabular-nums",
                        isPro ? "text-white" : "text-[#3D4035]",
                      )}
                    >
                      {plan.price}
                    </span>
                    {!isCurrent ? (
                      <Button
                        size="sm"
                        onClick={() => handleSelectPlan(plan.tier)}
                        className={cn(
                          "gap-2 rounded-xl text-[13px] sm:text-[14px] font-semibold px-4 py-2",
                          isPro
                            ? "bg-white text-[#354052] hover:bg-white/90"
                            : isUpgrade
                              ? "bg-[#6C5DD3] text-white hover:bg-[#5a4dbf]"
                              : "border border-[#3D4035]/25 bg-transparent text-[#3D4035]/80 hover:bg-[#3D4035]/5",
                        )}
                      >
                        {isUpgrade ? "Upgrade" : "Downgrade"}
                        <ArrowRight className="size-3" />
                      </Button>
                    ) : (
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-[13px] font-medium",
                          isPro ? "text-white/60" : "text-[#3D4035]/45",
                        )}
                      >
                        <Zap className="size-4" />
                        You’re here
                      </span>
                    )}
                  </div>
                </div>

                <ul className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3 border-t border-[#3D4035]/10 pt-4 sm:pt-5">
                  {TIER_DOC[plan.tier].bullets.map((b, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex items-start gap-3 text-[14px] sm:text-[15px] leading-relaxed",
                        isPro ? "text-white/80" : "text-[#3D4035]/70",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 size-1.5 shrink-0 rounded-full",
                          isPro ? "bg-white/60" : "bg-[#6C5DD3]/50",
                        )}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </DialogContent>

      <DowngradeLimitModal
        open={downgradeModal.open}
        onOpenChange={(o) =>
          setDowngradeModal((p) => ({ ...p, open: o }))
        }
        targetTier={downgradeModal.targetTier}
        targetTierLabel={downgradeModal.targetLabel}
        onSuccess={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
