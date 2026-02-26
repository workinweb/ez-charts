import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/next";

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
  ],
});

/** Arcjet instance for opinions: 3 feedback submissions per user per 24h */
export const ajOpinions = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: protectionMode,
      characteristics: ["userId"],
      window: "24h",
      max: 3,
    }),
  ],
});
