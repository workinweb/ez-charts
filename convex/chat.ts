import { v } from "convex/values";
import { mutation } from "./_generated/server";
/**
 * Chat mutations — like chart creation: create at start, update continuously.
 * conversationId: null = new conversation; exists = append to it.
 */

const chartLibraryValidator = v.union(v.literal("shadcn"), v.literal("rosencharts"));

const messageValidator = v.object({
  role: v.string(),
  content: v.string(),
  chartType: v.optional(v.string()),
  chartTitle: v.optional(v.string()),
  chartData: v.optional(v.any()),
  feedback: v.optional(v.union(v.literal("liked"), v.literal("disliked"))),
});

const resultValidator = v.object({
  clientMessageId: v.optional(v.string()),
  chartLibrary: chartLibraryValidator,
  chartType: v.string(),
  chartTitle: v.string(),
  chartData: v.any(),
  feedback: v.union(
    v.literal("liked"),
    v.literal("disliked"),
    v.literal("nofeedback"),
  ),
});

/** Create a new conversation (call when first message is sent). */
export const createConversation = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const now = Date.now();
    return ctx.db.insert("chatConversations", {
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Add a message to an existing conversation (and optionally a chart result). */
export const addMessage = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    message: messageValidator,
    result: v.optional(resultValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) return null;

    const now = Date.now();
    const msgId = await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      userId: identity.subject,
      role: args.message.role,
      content: args.message.content,
      metadata:
        args.message.chartType || args.message.feedback
          ? { chartType: args.message.chartType, feedback: args.message.feedback }
          : undefined,
      createdAt: now,
    });

    if (args.result) {
      await ctx.db.insert("chatResults", {
        conversationId: args.conversationId,
        clientMessageId: args.result.clientMessageId,
        userId: identity.subject,
        chartLibrary: args.result.chartLibrary,
        chartType: args.result.chartType,
        chartTitle: args.result.chartTitle,
        chartData: args.result.chartData,
        feedback: args.result.feedback,
        createdAt: now,
      });
    }

    await ctx.db.patch(args.conversationId, { updatedAt: now });
    return msgId;
  },
});

/** Update feedback on a chart result (when user clicks like/dislike after sync). */
export const updateChartResultFeedback = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    clientMessageId: v.string(),
    feedback: v.union(
      v.literal("liked"),
      v.literal("disliked"),
      v.literal("nofeedback"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) return null;

    const existing = await ctx.db
      .query("chatResults")
      .withIndex("by_conversation_message", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("clientMessageId", args.clientMessageId),
      )
      .first();

    if (!existing) return null;
    await ctx.db.patch(existing._id, { feedback: args.feedback });
    return existing._id;
  },
});
