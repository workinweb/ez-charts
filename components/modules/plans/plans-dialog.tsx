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
import { cn } from "@/lib/utils";
import { ArrowRight, Coins, Zap } from "lucide-react";

export type PlanTier = "free" | "pro" | "max";

const PLANS: {
  tier: PlanTier;
  label: string;
  credits: number;
  price: string;
  tagline: string;
}[] = [
  {
    tier: "free",
    label: "Free",
    credits: 100,
    price: "$0",
    tagline: "Enough to get the hang of it",
  },
  {
    tier: "pro",
    label: "Pro",
    credits: 250,
    price: "$4.99/mo",
    tagline: "For when you’re really cooking",
  },
  {
    tier: "max",
    label: "Max",
    credits: 700,
    price: "$8.99/mo",
    tagline: "Go wild.",
  },
];

interface PlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlansDialog({ open, onOpenChange }: PlansDialogProps) {
  const { data: session } = authClient.useSession();
  const settings = useQuery(api.userSettings.get, session?.user ? {} : "skip");
  const upsertPlan = useMutation(api.userSettings.upsert);

  const currentTier = (settings?.planTier ?? "free") as PlanTier;

  async function handleSelectPlan(tier: PlanTier) {
    if (tier === currentTier) return;
    try {
      await upsertPlan({ planTier: tier });
      onOpenChange(false);
    } catch {
      // Error handling - could add toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md rounded-[28px] sm:rounded-[32px]"
        showCloseButton
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[22px] font-semibold tracking-tight text-[#3D4035]">
            Pick your pace
          </DialogTitle>
          <p className="text-[13px] text-[#3D4035]/55">
            Credits fuel the AI. Top up whenever you need.
          </p>
        </DialogHeader>

        <div className="space-y-3">
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
                  "group relative overflow-hidden rounded-[24px] transition-all",
                  isPro
                    ? "bg-[#354052] p-5 text-white"
                    : "bg-[#E9EEF0]/80 p-4 ring-1 ring-[#3D4035]/6",
                  isCurrent && !isPro && "ring-2 ring-[#6C5DD3]/40",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "text-[17px] font-semibold",
                          isPro ? "text-white" : "text-[#3D4035]",
                        )}
                      >
                        {plan.label}
                      </span>
                      <span
                        className={cn(
                          "text-[13px]",
                          isPro ? "text-white/60" : "text-[#3D4035]/50",
                        )}
                      >
                        {plan.credits}{" "}
                        <Coins
                          className={cn(
                            "inline size-3 -mt-px",
                            isPro ? "text-white/50" : "text-[#6C5DD3]/60",
                          )}
                        />
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-0.5 text-[12px]",
                        isPro ? "text-white/50" : "text-[#3D4035]/45",
                      )}
                    >
                      {plan.tagline}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={cn(
                        "text-[18px] font-bold tabular-nums",
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
                          "gap-1.5 rounded-xl text-[12px] font-semibold",
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
                          "flex items-center gap-1 text-[11px] font-medium",
                          isPro ? "text-white/60" : "text-[#3D4035]/45",
                        )}
                      >
                        <Zap className="size-3" />
                        You’re here
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
