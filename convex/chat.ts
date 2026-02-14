import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Chat mutations — save ended conversations for internal prompt improvement.
 * Uses chatConversations + chatMessages. Not exposed to users.
 */

const messageValidator = v.object({
  role: v.string(),
  content: v.string(),
  chartType: v.optional(v.string()),
  feedback: v.optional(v.union(v.literal("liked"), v.literal("disliked"))),
});

/** Save a conversation snapshot when user starts new chat (conversation ended). */
export const saveEndedConversation = mutation({
  args: {
    messages: v.array(messageValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    if (args.messages.length === 0) return null;

    const now = Date.now();
    const convId = await ctx.db.insert("chatConversations", {
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });

    for (const msg of args.messages) {
      await ctx.db.insert("chatMessages", {
        conversationId: convId,
        userId: identity.subject,
        role: msg.role,
        content: msg.content,
        metadata:
          msg.chartType || msg.feedback
            ? { chartType: msg.chartType, feedback: msg.feedback }
            : undefined,
        createdAt: now,
      });
    }

    return convId;
  },
});
