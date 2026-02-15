/**
 * Plan tier limits and documentation.
 * Used for UI messaging, enforcement in Convex, and Plans dialog.
 */
export type PlanTier = "free" | "pro" | "max";

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
    credits: 700,
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
    ],
  },
  pro: {
    tagline: "For when you're really cooking",
    bullets: [
      "250 credits per month",
      "Unlimited charts and slide decks",
      "Up to 15 documents saved to your account",
    ],
  },
  max: {
    tagline: "Go wild.",
    bullets: [
      "700 credits per month",
      "Unlimited charts and slide decks",
      "Unlimited documents",
    ],
  },
};
