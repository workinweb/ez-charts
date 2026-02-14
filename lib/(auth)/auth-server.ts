import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

/**
 * Server-side auth helpers for Next.js.
 *
 * - handler: Route handler for /api/auth/[...all]
 * - preloadAuthQuery: Preload Convex queries in server components
 * - isAuthenticated: Check if the current request is authenticated
 * - getToken: Get the auth token for the current request
 * - fetchAuthQuery/fetchAuthMutation/fetchAuthAction: Run Convex functions with auth
 */
export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});
