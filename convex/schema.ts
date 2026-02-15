import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ─── App Data Schema ────────────────────────────────────────────────────────
// All user-owned data tables for Charts AI.
// Every table includes `userId` for ownership + RLS, indexed for fast queries.
//
// Auth tables (user, session, account, verification) are handled by the
// Better Auth component and live in convex/betterAuth/schema.ts.

export default defineSchema({
  // ── Charts ──────────────────────────────────────────────────────────────
  // Each chart created by a user (via chat, editor, or import).
  charts: defineTable({
    userId: v.string(),
    title: v.string(),
    chartType: v.string(),
    /** Serialized chart data (flexible shape per chart type) */
    data: v.any(),
    source: v.string(),
    /** Deprecated: feedback moved to chatMessages metadata (Conversation+Message+Result) */
    feedback: v.optional(v.union(v.literal("liked"), v.literal("disliked"))),
    favorited: v.boolean(),
    withTooltip: v.boolean(),
    withAnimation: v.boolean(),
    /** Soft delete: false when user removes; never returned to user */
    isVisible: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // ── Slide Decks ─────────────────────────────────────────────────────────
  // A named collection of charts presented in order.
  slides: defineTable({
    userId: v.string(),
    name: v.string(),
    /** Ordered array of chart IDs in this deck */
    chartIds: v.array(v.string()),
    /** Soft delete: false when user removes; never returned to user */
    isVisible: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // ── Documents ───────────────────────────────────────────────────────────
  // Uploaded/parsed files saved by the user.
  documents: defineTable({
    userId: v.string(),
    name: v.string(),
    /** File size in bytes */
    size: v.number(),
    /** MIME type */
    mimeType: v.string(),
    /** Parsed text content (for search/AI usage) */
    content: v.string(),
    /** Optional Convex file storage ID for the original file */
    storageId: v.optional(v.id("_storage")),
    /** Soft delete: false when user removes; never returned to user */
    isVisible: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // ── User Settings ───────────────────────────────────────────────────────
  // Per-user preferences: dashboard layout, feature flags, credits/plan, etc.
  // One row per user — upserted on change.
  userSettings: defineTable({
    userId: v.string(),
    /** Dashboard card order + visibility */
    dashboardCardOrder: v.optional(v.array(v.string())),
    /** Whether to auto-save documents from chat */
    saveDocumentsOnDb: v.optional(v.boolean()),
    /** Credits available for AI usage (Free: 100, Pro: 500, Max: 1000) */
    credits: v.optional(v.number()),
    /** Plan tier: free | pro | max */
    planTier: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("max"))),
    /** Timestamp (ms) of next credit renewal. On renew, add 1 month to this. */
    renewDate: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ── Chat History (optional, for future persistence) ─────────────────────
  // Stores chat conversations so they survive page refresh.
  chatConversations: defineTable({
    userId: v.string(),
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"]),

  chatMessages: defineTable({
    conversationId: v.id("chatConversations"),
    userId: v.string(),
    role: v.string(), // "user" | "assistant" | "system"
    content: v.string(),
    /** Optional metadata (attached files, chart context, etc.) */
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_created", ["conversationId", "createdAt"]),

  /** Links Conversation + chart result + feedback. Full conversation in chatMessages. */
  chatResults: defineTable({
    conversationId: v.id("chatConversations"),
    /** useChat message id — to update feedback when user clicks like/dislike */
    clientMessageId: v.optional(v.string()),
    userId: v.string(),

    chartType: v.string(),
    chartTitle: v.string(),
    chartData: v.any(),
    feedback: v.union(
      v.literal("liked"),
      v.literal("disliked"),
      v.literal("nofeedback"),
    ),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_message", ["conversationId", "clientMessageId"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  // ── Stripe (prepared for future) ────────────────────────────────────────
  // Subscription and payment records. Uncomment when integrating Stripe.
  // subscriptions: defineTable({
  //   userId: v.string(),
  //   stripeSubscriptionId: v.string(),
  //   stripePriceId: v.string(),
  //   status: v.string(), // "active" | "canceled" | "past_due" | "trialing"
  //   currentPeriodStart: v.number(),
  //   currentPeriodEnd: v.number(),
  //   cancelAtPeriodEnd: v.boolean(),
  //   createdAt: v.number(),
  //   updatedAt: v.number(),
  // })
  //   .index("by_user", ["userId"])
  //   .index("by_stripe_id", ["stripeSubscriptionId"]),
  //
  // payments: defineTable({
  //   userId: v.string(),
  //   stripePaymentIntentId: v.string(),
  //   amount: v.number(),
  //   currency: v.string(),
  //   status: v.string(),
  //   createdAt: v.number(),
  // })
  //   .index("by_user", ["userId"])
  //   .index("by_stripe_id", ["stripePaymentIntentId"]),
});
