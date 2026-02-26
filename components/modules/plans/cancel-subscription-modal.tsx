"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { cn } from "@/lib/utils";
import { HelpCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface CancelSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  stripeCustomerId?: string;
}

export function CancelSubscriptionModal({
  open,
  onOpenChange,
  onSuccess,
  stripeCustomerId,
}: CancelSubscriptionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const createBillingPortal = useAction(
    api.stripe.stripe.createBillingPortalSession,
  );

  async function handleCancel() {
    if (!stripeCustomerId) return;
    setSubmitting(true);
    try {
      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      const { url } = await createBillingPortal({
        returnUrl: `${base}/ezcharts/user`,
        stripeCustomerId,
      });
      if (url) window.location.assign(url);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Billing portal error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md rounded-[28px] sm:rounded-[32px] p-0 overflow-hidden"
        showCloseButton
      >
        <DialogHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 space-y-3">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-[22px] sm:text-[24px] font-semibold text-[#3D4035]">
              Cancel subscription
            </DialogTitle>
            <HelpCircle
              className="size-5 text-[#3D4035]/50 shrink-0"
              aria-hidden
            />
          </div>

          <div
            className={cn(
              "rounded-xl border border-[#3D4035]/10 bg-[#3D4035]/5 p-4 text-[14px] text-[#3D4035]/80 leading-relaxed space-y-4",
            )}
          >
            <div>
              <p className="font-medium text-[#3D4035] mb-1">
                If you want to cancel:
              </p>
              <p>
                Cancel to stop billing. You&apos;ll be taken to the billing
                portal to turn off auto-renewal. You&apos;ll keep access until
                the end of your billing period.
              </p>
            </div>
            <div>
              <p className="font-medium text-[#3D4035] mb-1">
                If you want to downgrade:
              </p>
              <p>
                Cancel your current subscription first. You&apos;ll keep access
                until the end of your billing period, then you can create a new
                subscription whenever you&apos;re ready.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex justify-end gap-3 px-6 sm:px-8 pb-6 sm:pb-8">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Keep subscription
          </Button>
          <Button
            onClick={handleCancel}
            disabled={!stripeCustomerId || submitting}
            className="rounded-xl bg-[#3D4035] hover:bg-[#3D4035]/90 text-white disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Cancel subscription"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
