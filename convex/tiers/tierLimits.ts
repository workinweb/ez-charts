/**
 * Plan tier limits — single source of truth for Convex and UI.
 */
export type PlanTier = "free" | "pro" | "max";

/** Settings shape needed to compute effective tier (from userSettings). */
export type SettingsForEffectiveTier = {
  planTier?: PlanTier | null;
  tierAvailableUntil?: number | null;
  scheduledDowngradeTier?: PlanTier | null;
};

/**
 * Effective tier for limits and display. When a paid user schedules downgrade
 * (cancel_at_period_end), they keep full access until tierAvailableUntil.
 * After that, we use scheduledDowngradeTier. If user renews, we clear those
 * and use planTier.
 */
export function getEffectiveTier(
  settings: SettingsForEffectiveTier | null,
  now: number = Date.now(),
): PlanTier {
  const tier = (settings?.planTier ?? "free") as PlanTier;
  const until = settings?.tierAvailableUntil;
  const scheduled = (settings?.scheduledDowngradeTier ?? "free") as PlanTier;
  if (until != null && now >= until) {
    return scheduled;
  }
  return tier;
}

export const TIER_LIMITS = {
  free: {
    credits: 50,
    maxCharts: 5,
    maxSlides: 1,
    maxDocuments: 0,
    canSaveDocuments: false,
  },
  pro: {
    credits: 300,
    maxCharts: Infinity,
    maxSlides: Infinity,
    maxDocuments: 25,
    canSaveDocuments: true,
  },
  max: {
    credits: 650,
    maxCharts: Infinity,
    maxSlides: Infinity,
    maxDocuments: Infinity,
    canSaveDocuments: true,
  },
} as const satisfies Record<
  PlanTier,
  {
    credits: number;
    maxCharts: number;
    maxSlides: number;
    maxDocuments: number;
    canSaveDocuments: boolean;
  }
>;

export const TIER_DOC: Record<
  PlanTier,
  { tagline: string; bullets: string[] }
> = {
  free: {
    tagline: "Enough to get the hang of it",
    bullets: [
      "50 credits to spend on AI help",
      "Up to 5 saved charts and 1 slide deck",
      "Documents can be used in chat but are not saved to storage (upload disabled)",
      "Export to PNG",
      "Data presentations",
    ],
  },
  pro: {
    tagline: "For when you're really cooking",
    bullets: [
      "300 credits per month",
      "Unlimited charts and slide decks",
      "Up to 25 documents saved to your account",
      "Shareable slide links — anyone with the link can view",
      "Export to PNG",
      "Data presentations",
    ],
  },
  max: {
    tagline: "Go wild.",
    bullets: [
      "650 credits per month",
      "Unlimited charts and slide decks",
      "Unlimited documents",
      "Shareable slide links — anyone with the link can view",
      "Export to PNG",
      "Data presentations",
    ],
  },
};
