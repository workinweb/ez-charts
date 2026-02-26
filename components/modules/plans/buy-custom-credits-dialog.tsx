"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAction } from "convex/react";
import { ArrowRight, Coins, Loader2 } from "lucide-react";
import { useState } from "react";

const CREDITS_PER_DOLLAR = 40;

/** Stripe minimum is $0.50 — show minimum credits in UI */
const MIN_CREDITS_FOR_STRIPE = Math.ceil((50 / 100) * CREDITS_PER_DOLLAR);

interface BuyCustomCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuyCustomCreditsDialog({
  open,
  onOpenChange,
}: BuyCustomCreditsDialogProps) {
  const [creditsInput, setCreditsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const credits = Math.max(0, parseInt(creditsInput, 10) || 0);
  const priceDollars = credits / CREDITS_PER_DOLLAR;
  const canContinue = credits >= MIN_CREDITS_FOR_STRIPE;

  const createCheckout = useAction(api.stripe.stripe.createCreditPurchaseCheckout);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    if (!canContinue) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      const { url } = await createCheckout({
        credits,
        successUrl: `${base}/ezcharts/credits?checkout=success`,
        cancelUrl: `${base}/ezcharts/credits`,
      });
      if (url) window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start checkout");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md rounded-[28px] sm:rounded-[32px]"
        showCloseButton
        onOpenAutoFocus={() => {
          setCreditsInput("");
          setError(null);
        }}
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[22px] font-semibold tracking-tight text-[#3D4035]">
            Buy custom credits
          </DialogTitle>
          <p className="text-[13px] text-[#3D4035]/55">
            Add credits on demand at {CREDITS_PER_DOLLAR} credits per dollar
            (min. {MIN_CREDITS_FOR_STRIPE} credits).
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="credits-input"
              className="mb-1.5 block text-[13px] font-medium text-[#3D4035]"
            >
              Number of credits
            </label>
            <Input
              id="credits-input"
              type="number"
              min={MIN_CREDITS_FOR_STRIPE}
              step={10}
              placeholder="e.g. 100"
              value={creditsInput}
              onChange={(e) =>
                setCreditsInput(
                  e.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
              className="h-11 rounded-xl text-[15px]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
              {error}
            </p>
          )}

          <div
            className={cn(
              "flex items-center justify-between rounded-2xl bg-[#E9EEF0]/80 px-4 py-3.5 ring-1 ring-[#3D4035]/6",
              !credits && "opacity-60",
            )}
          >
            <div className="flex items-center gap-2">
              <Coins className="size-5 text-[#6C5DD3]/60" />
              <span className="text-[15px] font-medium text-[#3D4035]">
                {credits > 0 ? (
                  <>
                    <span className="tabular-nums font-semibold">{credits}</span>{" "}
                    credits
                  </>
                ) : (
                  "Enter amount"
                )}
              </span>
            </div>
            <span className="text-[17px] font-bold tabular-nums text-[#3D4035]">
              {credits > 0 ? `$${priceDollars.toFixed(2)}` : "—"}
            </span>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!canContinue || isSubmitting}
            className="w-full gap-2 rounded-xl bg-[#6C5DD3] py-2.5 text-[15px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
