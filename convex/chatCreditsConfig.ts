/**
 * Token-to-credits configuration for AI chat usage.
 * Edit these values to adjust pricing tiers.
 *
 * Tiers:
 * | Type                  | Credits | Typical use                    |
 * |-----------------------|---------|--------------------------------|
 * | Default chat response | 3       | Short answers, simple charts   |
 * | Long / multi-step     | 5       | Multi-step, complex charts    |
 * | Extra large           | 8       | Summaries, slides, big tasks  |
 */

/** Default chat response (short answers, simple charts) */
export const DEFAULT_CREDITS = 3;

/** Long or multi-step response (complex charts, multiple steps) */
export const LONG_CREDITS = 5;

/** Extra large tasks (summaries, slides, heavy outputs) */
export const EXTRA_LARGE_CREDITS = 8;

/** Token threshold above which we charge LONG_CREDITS */
export const TOKENS_FOR_LONG = 800;

/** Token threshold above which we charge EXTRA_LARGE_CREDITS */
export const TOKENS_FOR_EXTRA_LARGE = 1500;

/**
 * Compute credits from token count using tiered pricing.
 * - 0 to TOKENS_FOR_LONG → DEFAULT_CREDITS (3)
 * - TOKENS_FOR_LONG+1 to TOKENS_FOR_EXTRA_LARGE → LONG_CREDITS (5)
 * - TOKENS_FOR_EXTRA_LARGE+1 and up → EXTRA_LARGE_CREDITS (8)
 */
export function tokensToCredits(totalTokens: number): number {
  if (totalTokens <= 0) return 0;
  if (totalTokens <= TOKENS_FOR_LONG) return DEFAULT_CREDITS;
  if (totalTokens <= TOKENS_FOR_EXTRA_LARGE) return LONG_CREDITS;
  return EXTRA_LARGE_CREDITS;
}
