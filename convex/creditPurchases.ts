/**
 * Credit purchase history — records when users buy credits.
 *
 * Usage:
 *
 * 1. Record a purchase (from BuyCustomCreditsDialog after payment success):
 *    await convex.mutation(api.creditPurchases.record, {
 *      credits: 100,
 *      planTier: "pro",
 *      amountCents: 250,  // $2.50
 *      currency: "usd",
 *      paymentId: "pi_xxx",  // Stripe id for idempotency
 *      source: "one_time",
 *    });
 *
 * 2. List user's purchase history:
 *    const purchases = useQuery(api.creditPurchases.list, { limit: 20 });
 *
 * 3. Record without adding to balance (tracking only):
 *    await convex.mutation(api.creditPurchases.record, {
 *      credits: 50,
 *      planTier: "free",
 *      source: "promo",
 *      addToBalance: false,
 *    });
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const planTierValidator = v.union(
  v.literal("free"),
  v.literal("pro"),
  v.literal("max"),
);

const sourceValidator = v.optional(
  v.union(
    v.literal("subscription"),
    v.literal("one_time"),
    v.literal("plan_upgrade"),
    v.literal("promo"),
  ),
);

/**
 * List credit purchases for the authenticated user, newest first.
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    const limit = args.limit ?? 50;
    return ctx.db
      .query("creditPurchases")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Record a credit purchase for the authenticated user.
 * Optionally adds the credits to the user's balance (default: true).
 * Use paymentId when integrating Stripe to prevent duplicate credits on webhook retries.
 */
export const record = mutation({
  args: {
    credits: v.number(),
    planTier: planTierValidator,
    amountCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    source: sourceValidator,
    /** If true, adds credits to userSettings. Set false for tracking-only (e.g. promos already applied). */
    addToBalance: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const addToBalance = args.addToBalance ?? true;

    // Idempotency: if paymentId provided and already exists, skip
    if (args.paymentId) {
      const existing = await ctx.db
        .query("creditPurchases")
        .withIndex("by_payment_id", (q) => q.eq("paymentId", args.paymentId))
        .unique();
      if (existing) return existing._id;
    }

    const now = Date.now();

    // Insert purchase record
    const purchaseId = await ctx.db.insert("creditPurchases", {
      userId,
      credits: args.credits,
      planTier: args.planTier,
      amountCents: args.amountCents,
      currency: args.currency,
      paymentId: args.paymentId,
      source: args.source,
      createdAt: now,
    });

    if (addToBalance) {
      const settings = await ctx.db
        .query("userSettings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();

      if (settings) {
        const current = settings.credits ?? 0;
        await ctx.db.patch(settings._id, {
          credits: current + args.credits,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("userSettings", {
          userId,
          credits: args.credits,
          updatedAt: now,
        });
      }
    }

    return purchaseId;
  },
});
