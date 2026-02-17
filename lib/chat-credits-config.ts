/**
 * Re-export from Convex — single source of truth for token-to-credits config.
 * Edit convex/chatCreditsConfig.ts to change pricing.
 */
export {
  DEFAULT_CREDITS,
  LONG_CREDITS,
  EXTRA_LARGE_CREDITS,
  TOKENS_FOR_LONG,
  TOKENS_FOR_EXTRA_LARGE,
  tokensToCredits,
} from "../convex/chatCreditsConfig";
