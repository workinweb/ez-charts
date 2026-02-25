import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";

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
  plugins: [convexClient(), nextCookies()],
});
