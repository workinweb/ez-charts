"use client";

import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/(auth)/auth-client";
import { useQuery } from "convex/react";

/** Minimum credits required to send a chat message (matches convex/chatCreditsConfig DEFAULT_CREDITS) */
export const MIN_CHAT_CREDITS = 3;

export type FeatureId = "chat" | "createChart" | "createSlide" | "saveDocument";

export interface FeatureCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Central hook to check if a feature is available based on tier limits.
 * Use canUse(feature) to disable buttons / block actions when limits are reached.
 */
export function useFeatureCheck() {
  const { data: session } = authClient.useSession();
  const tierUsage = useQuery(
    api.tiers.planLimits.tierUsage,
    session?.user ? {} : "skip",
  );

  const canUse = (feature: FeatureId): FeatureCheckResult => {
    if (!session?.user) {
      return { allowed: false, reason: "Sign in to use this feature" };
    }
    if (tierUsage === undefined) {
      return { allowed: true }; // Loading: allow to avoid flicker; server will reject if over limit
    }

    const {
      creditsUsed,
      chartsUsed,
      chartsLimit,
      slidesUsed,
      slidesLimit,
      documentsUsed,
      documentsLimit,
      planTier,
    } = tierUsage;

    switch (feature) {
      case "chat":
        if ((creditsUsed ?? 0) < MIN_CHAT_CREDITS) {
          return {
            allowed: false,
            reason: `Insufficient credits (need at least ${MIN_CHAT_CREDITS}). Upgrade your plan to continue.`,
          };
        }
        return { allowed: true };

      case "createChart":
        if (chartsUsed >= chartsLimit) {
          return {
            allowed: false,
            reason: `Chart limit reached (${chartsLimit} for ${planTier} plan). Upgrade to save more.`,
          };
        }
        return { allowed: true };

      case "createSlide":
        if (slidesUsed >= slidesLimit) {
          return {
            allowed: false,
            reason: `Slide deck limit reached (${slidesLimit} for ${planTier} plan). Upgrade to create more.`,
          };
        }
        return { allowed: true };

      case "saveDocument":
        if (documentsLimit === 0) {
          return {
            allowed: false,
            reason:
              "Document saving is not available on the Free plan. Upgrade to Pro.",
          };
        }
        if (documentsUsed >= documentsLimit) {
          return {
            allowed: false,
            reason: `Document limit reached (${documentsLimit} for ${planTier} plan). Upgrade to save more.`,
          };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  };

  return {
    canUse,
    tierUsage: tierUsage ?? null,
    isLoading: session?.user && tierUsage === undefined,
  };
}
