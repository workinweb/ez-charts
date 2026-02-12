import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";

// Check if we're in development mode
const isDevMode = !!process.env.NEXT_PUBLIC_IS_DEV_MODE;
const protectionMode = isDevMode ? "DRY_RUN" : "LIVE";

export const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: protectionMode }),
    // Create a bot detection rule
    detectBot({
      mode: protectionMode, // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        "CATEGORY:GOOGLE",
        "CATEGORY:VERCEL",
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: protectionMode,
      characteristics: ["ip.src"],
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: 15, // Refill 10 tokens per interval
      interval: "1d", // Refill every day
      capacity: 40, // Bucket capacity of 10 tokens
    }),
  ],
});
