/**
 * Chat statistics — user-based counts for dashboard.
 */
import { query } from "../_generated/server";

/**
 * Returns the number of conversations and user messages for the authenticated user.
 */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { conversationsCount: 0, userMessagesCount: 0 };

    const userId = identity.subject;

    const conversations = await ctx.db
      .query("chatConversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .collect();

    const userMessagesCount = messages.filter((m) => m.role === "user").length;

    return {
      conversationsCount: conversations.length,
      userMessagesCount,
    };
  },
});
