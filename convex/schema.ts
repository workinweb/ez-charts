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
    favorited: v.boolean(),
    withTooltip: v.boolean(),
    withAnimation: v.boolean(),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // ── User Settings ───────────────────────────────────────────────────────
  // Per-user preferences: dashboard layout, feature flags, etc.
  // One row per user — upserted on change.
  userSettings: defineTable({
    userId: v.string(),
    /** Dashboard card order + visibility */
    dashboardCardOrder: v.optional(v.array(v.string())),
    /** Whether to auto-save documents from chat */
    saveDocumentsOnDb: v.optional(v.boolean()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

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
