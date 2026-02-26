import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { tokensToCredits } from "../credits/chatCreditsConfig";

/**
 * Chat mutations — like chart creation: create at start, update continuously.
 * conversationId: null = new conversation; exists = append to it.
 */

const chartLibraryValidator = v.union(
  v.literal("shadcn"),
  v.literal("rosencharts"),
);

const tokenUsageValidator = v.optional(
  v.object({
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
  }),
);

const messageValidator = v.object({
  role: v.string(),
  content: v.string(),
  chartType: v.optional(v.string()),
  chartTitle: v.optional(v.string()),
  chartData: v.optional(v.any()),
  feedback: v.optional(v.union(v.literal("liked"), v.literal("disliked"))),
  tokenUsage: tokenUsageValidator,
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
    const userId = identity.subject;

    // Compute credits for assistant messages — use OUTPUT tokens only to avoid
    // charging for our system prompt and conversation history.
    let creditsCharged = 0;
    if (args.message.role === "assistant" && args.message.tokenUsage) {
      const outputTokens = args.message.tokenUsage.outputTokens ?? 0;
      creditsCharged = tokensToCredits(outputTokens);

      if (creditsCharged > 0) {
        const settings = await ctx.db
          .query("userSettings")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .unique();

        const currentCredits = settings?.credits ?? 0;
        // Never store negative credits — minimum is 0
        const newCredits = Math.max(0, currentCredits - creditsCharged);

        if (settings) {
          await ctx.db.patch(settings._id, {
            credits: newCredits,
            updatedAt: now,
          });
        }
      }
    }

    const msgId = await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      userId,
      role: args.message.role,
      content: args.message.content,
      metadata:
        args.message.chartType || args.message.feedback
          ? {
              chartType: args.message.chartType,
              feedback: args.message.feedback,
            }
          : undefined,
      inputTokens: args.message.tokenUsage?.inputTokens,
      outputTokens: args.message.tokenUsage?.outputTokens,
      totalTokens: args.message.tokenUsage?.totalTokens,
      creditsCharged: creditsCharged || undefined,
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
