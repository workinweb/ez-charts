/**
 * Token-to-credits configuration for AI chat usage.
 * Edit these values to adjust pricing tiers.
 *
 * We charge on OUTPUT tokens only — not input. This avoids overcharging for:
 * - Our large system prompt (CHART_SYSTEM_PROMPT, schema docs)
 * - Conversation history / prior messages
 *
 * Tiers (based on output tokens = what the AI generated):
 * | Type                  | Credits | Typical use                    |
 * |-----------------------|---------|--------------------------------|
 * | Default chat response | 3       | Short answers, simple charts   |
 * | Long / multi-step     | 5       | Multi-step, complex charts    |
 * | Extra large           | 8       | Summaries, slides, big tasks   |
 */

/** Default chat response (short answers, simple charts) */
export const DEFAULT_CREDITS = 3;

/** Long or multi-step response (complex charts, multiple steps) */
export const LONG_CREDITS = 5;

/** Extra large tasks (summaries, slides, heavy outputs) */
export const EXTRA_LARGE_CREDITS = 8;

/** Output token threshold above which we charge LONG_CREDITS */
export const OUTPUT_TOKENS_FOR_LONG = 400;

/** Output token threshold above which we charge EXTRA_LARGE_CREDITS */
export const OUTPUT_TOKENS_FOR_EXTRA_LARGE = 800;

/**
 * Compute credits from token count. Uses OUTPUT tokens only to avoid charging
 * for our system prompt and conversation context.
 *
 * - 0 to OUTPUT_TOKENS_FOR_LONG → DEFAULT_CREDITS (3)
 * - OUTPUT_TOKENS_FOR_LONG+1 to OUTPUT_TOKENS_FOR_EXTRA_LARGE → LONG_CREDITS (5)
 * - OUTPUT_TOKENS_FOR_EXTRA_LARGE+1 and up → EXTRA_LARGE_CREDITS (8)
 */
export function tokensToCredits(outputTokens: number): number {
  if (outputTokens <= 0) return 0;
  if (outputTokens <= OUTPUT_TOKENS_FOR_LONG) return DEFAULT_CREDITS;
  if (outputTokens <= OUTPUT_TOKENS_FOR_EXTRA_LARGE) return LONG_CREDITS;
  return EXTRA_LARGE_CREDITS;
}
