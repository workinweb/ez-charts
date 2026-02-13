import { query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

/**
 * Get the currently authenticated user from the Better Auth session.
 * Returns null if not authenticated.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
