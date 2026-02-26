import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ─── App Data Schema ────────────────────────────────────────────────────────
// All user-owned data tables for Ez Charts.
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
    /** shadcn | rosencharts — inferred from chartType when missing (legacy) */
    chartLibrary: v.optional(
      v.union(v.literal("shadcn"), v.literal("rosencharts")),
    ),
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
    /** Blocked by plan tier limit — not shown in lists; separate from isVisible (removal) */
    blockedByTier: v.optional(v.boolean()),
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
    /** Blocked by plan tier limit — not shown in lists; separate from isVisible (removal) */
    blockedByTier: v.optional(v.boolean()),
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
    /** Blocked by plan tier limit — not shown in lists; separate from isVisible (removal) */
    blockedByTier: v.optional(v.boolean()),
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
    /** Chart data editor style: table (shadcn-like) or items (expandable cards) */
    chartDataEditorMode: v.optional(
      v.union(v.literal("table"), v.literal("items")),
    ),
    /** Credits available for AI usage (Free: 100, Pro: 500, Max: 1000) */
    credits: v.optional(v.number()),
    /** Plan tier: free | pro | max */
    planTier: v.optional(
      v.union(v.literal("free"), v.literal("pro"), v.literal("max")),
    ),
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
    /** Token usage for AI responses (assistant messages only) */
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    /** Credits charged for this message (from tokensToCredits) */
    creditsCharged: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_created", ["conversationId", "createdAt"])
    .index("by_user_created", ["userId", "createdAt"]),

  /** Links Conversation + chart result + feedback. Full conversation in chatMessages. */
  chatResults: defineTable({
    conversationId: v.id("chatConversations"),
    /** useChat message id — to update feedback when user clicks like/dislike */
    clientMessageId: v.optional(v.string()),
    userId: v.string(),

    /** shadcn | rosencharts — inferred from chartType when missing (legacy) */
    chartLibrary: v.optional(
      v.union(v.literal("shadcn"), v.literal("rosencharts")),
    ),
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

  // ── Credit Purchases ────────────────────────────────────────────────────
  // Records when a user buys credits (one-time or via plan upgrade).
  // Linked to user for purchase history and analytics.
  creditPurchases: defineTable({
    userId: v.string(),
    /** Credits purchased/added */
    credits: v.number(),
    /** Plan tier at time of purchase (free | pro | max) */
    planTier: v.union(v.literal("free"), v.literal("pro"), v.literal("max")),
    /** Price paid in smallest currency unit (cents for USD). Optional for promos. */
    amountCents: v.optional(v.number()),
    /** Currency code, e.g. "usd" */
    currency: v.optional(v.string()),
    /** Payment provider reference (Stripe payment intent ID, etc.) for idempotency */
    paymentId: v.optional(v.string()),
    /** How the purchase was made */
    source: v.optional(
      v.union(
        v.literal("subscription"),
        v.literal("one_time"),
        v.literal("plan_upgrade"),
        v.literal("promo"),
      ),
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_payment_id", ["paymentId"]),

  // ── Opinions / Feedback ──────────────────────────────────────────────────
  // User feedback. Public list; create/upvote require auth.
  opinions: defineTable({
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    content: v.string(),
    category: v.string(),
    /** Custom label when category is "other" */
    categoryCustom: v.optional(v.string()),
    upvoteCount: v.number(),
    /** When true, hidden from the public list (e.g. addressed by team) */
    resolved: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_category_created", ["category", "createdAt"])
    .index("by_upvoteCount", ["upvoteCount"])
    .index("by_category_upvoteCount", ["category", "upvoteCount"])
    .index("by_user", ["userId"]),

  opinionUpvotes: defineTable({
    opinionId: v.id("opinions"),
    userId: v.string(),
    createdAt: v.number(),
  })
    .index("by_opinion", ["opinionId"])
    .index("by_user", ["userId"])
    .index("by_opinion_user", ["opinionId", "userId"]),

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
