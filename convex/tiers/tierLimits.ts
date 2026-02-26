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
    credits: 100,
    maxCharts: 10,
    maxSlides: 2,
    maxDocuments: 0,
    canSaveDocuments: false,
  },
  pro: {
    credits: 250,
    maxCharts: Infinity,
    maxSlides: Infinity,
    maxDocuments: 15,
    canSaveDocuments: true,
  },
  max: {
    credits: 600,
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
      "100 credits to spend on AI help",
      "Up to 10 saved charts and 2 slide decks",
      "Documents can be used in chat but are not saved to storage (upload disabled)",
      "Export to PNG",
      "Data presentations",
    ],
  },
  pro: {
    tagline: "For when you're really cooking",
    bullets: [
      "250 credits per month",
      "Unlimited charts and slide decks",
      "Up to 15 documents saved to your account",
      "Export to PNG",
      "Data presentations",
    ],
  },
  max: {
    tagline: "Go wild.",
    bullets: [
      "600 credits per month",
      "Unlimited charts and slide decks",
      "Unlimited documents",
      "Export to PNG",
      "Data presentations",
    ],
  },
};
