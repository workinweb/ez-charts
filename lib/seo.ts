/**
 * SEO config — base URL, site name, default metadata.
 * Uses SITE_URL from env (e.g. https://ezcharts.com) or Vercel URL.
 */
const baseUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://ezcharts.com");

export const siteConfig = {
  name: "Ez2Chart",
  description:
    "AI-powered charts from your input or file data. Generate stunning visualizations with an AI chatbot, then refine with manual controls. No code required.",
  url: baseUrl,
  ogImage: `${baseUrl}/og.png`,
  twitterHandle: "@ez2chart",
  keywords: [
    "AI charts",
    "data visualization",
    "chart generator",
    "AI chart maker",
    "data analytics",
    "visualization tool",
    "bar chart",
    "pie chart",
    "line chart",
  ],
} as const;
