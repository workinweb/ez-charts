import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

/**
 * Better Auth client for use in React components.
 *
 * Usage:
 *   import { authClient } from "@/lib/auth-client";
 *   const { data: session } = authClient.useSession();
 *   await authClient.signIn.email({ email, password });
 *   await authClient.signUp.email({ email, password, name });
 *   await authClient.signOut();
 */
export const authClient = createAuthClient({
  // Explicit baseURL for production stability (Next.js inlines NEXT_PUBLIC_* at build)
  ...(process.env.NEXT_PUBLIC_SITE_URL && {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  }),
  plugins: [convexClient()],
});
