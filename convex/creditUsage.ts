/**
 * Credit usage history — records when credits were spent (from chatMessages).
 */
import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

/**
 * Paginated list of credit usage for the authenticated user.
 * Returns chat messages that consumed credits (creditsCharged > 0), newest first.
 */
export const listUsagePaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    const userId = identity.subject;

    // Query all user messages, paginate; filter for credit usage in handler.
    // We request more items since only assistant messages with creditsCharged are relevant.
    const result = await ctx.db
      .query("chatMessages")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(args.paginationOpts);

    const usagePage = result.page.filter(
      (m) =>
        m.role === "assistant" &&
        typeof m.creditsCharged === "number" &&
        m.creditsCharged > 0,
    );

    return {
      ...result,
      page: usagePage,
    };
  },
});
