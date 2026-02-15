/**
 * Plan tier limits for server-side enforcement.
 * Mirrors lib/tier-limits.ts for Convex mutations.
 */
export const TIER_LIMITS = {
  free: {
    maxCharts: 10,
    maxSlides: 2,
    maxDocuments: 0,
  },
  pro: {
    maxCharts: Infinity,
    maxSlides: Infinity,
    maxDocuments: 15,
  },
  max: {
    maxCharts: Infinity,
    maxSlides: Infinity,
    maxDocuments: Infinity,
  },
} as const;

export type PlanTier = keyof typeof TIER_LIMITS;
