/**
 * Stripe subscription integration.
 *
 * - createCheckoutSession: Action for authenticated users to start checkout
 * - webhookHandler: Processes Stripe webhooks and syncs to subscriptions + userSettings
 */

import { v } from "convex/values";
import { action, internalMutation } from "../_generated/server";
import { TIER_LIMITS, type PlanTier } from "../tiers/tierLimits";
import Stripe from "stripe";

const planTierValidator = v.union(
  v.literal("free"),
  v.literal("pro"),
  v.literal("max"),
);

/** Map Stripe price ID to our plan tier */
function priceToPlan(priceId: string): PlanTier | null {
  const proPrice = process.env.STRIPE_PRICE_PRO;
  const maxPrice = process.env.STRIPE_PRICE_MAX;
  if (priceId === proPrice) return "pro";
  if (priceId === maxPrice) return "max";
  return null;
}

function nextRenewDate(): number {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

/**
 * Create a Stripe Checkout session for subscription.
 * Returns the URL to redirect the user to.
 */
export const createCheckoutSession = action({
  args: {
    plan: planTierValidator,
    successUrl: v.string(),
    cancelUrl: v.string(),
    /** When upgrading from existing plan: cancel this sub first, then use this customer for checkout */
    stripeCustomerId: v.optional(v.string()),
    subscriptionIdToCancel: v.optional(v.string()),
  },
  handler: async (ctx, {
    plan,
    successUrl,
    cancelUrl,
    stripeCustomerId,
    subscriptionIdToCancel,
  }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const email = identity.email ?? undefined;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error("Stripe is not configured");

    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRICE_PRO
        : process.env.STRIPE_PRICE_MAX;
    if (!priceId || !priceId.startsWith("price_"))
      throw new Error(
        `Stripe price ID not configured for plan: ${plan}. Add STRIPE_PRICE_PRO and STRIPE_PRICE_MAX as Stripe Price IDs (e.g. price_xxx) in Convex env. See Stripe Dashboard → Products → your product → add Price.`,
      );

    const stripe = new Stripe(stripeKey);

    if (subscriptionIdToCancel) {
      const sub = await stripe.subscriptions.retrieve(subscriptionIdToCancel);
      const subUserId = sub.metadata?.userId as string | undefined;
      if (subUserId && subUserId !== userId)
        throw new Error("Subscription does not belong to this user");
      await stripe.subscriptions.cancel(subscriptionIdToCancel);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, plan },
      subscription_data: { metadata: { userId, plan } },
      ...(stripeCustomerId
        ? { customer: stripeCustomerId }
        : { customer_email: email }),
    });

    if (!session.url) throw new Error("Failed to create checkout session");
    return { url: session.url };
  },
});

/** Credits per dollar for one-time purchases (must match buy-custom-credits-dialog) */
const CREDITS_PER_DOLLAR = 40;

/** Stripe minimum charge is $0.50 USD */
const MIN_AMOUNT_CENTS = 50;

/**
 * Create a Stripe Checkout session for one-time credit purchase.
 * Returns the URL to redirect the user to. On payment success, the webhook
 * (payment_intent.succeeded) adds credits and records in creditPurchases.
 */
export const createCreditPurchaseCheckout = action({
  args: {
    credits: v.number(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, { credits, successUrl, cancelUrl }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const email = identity.email ?? undefined;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error("Stripe is not configured");

    if (credits < 1) throw new Error("Credits must be at least 1");

    const priceDollars = credits / CREDITS_PER_DOLLAR;
    const amountCents = Math.round(priceDollars * 100);
    if (amountCents < MIN_AMOUNT_CENTS) {
      throw new Error(
        `Minimum charge is $${(MIN_AMOUNT_CENTS / 100).toFixed(2)}. Purchase at least ${Math.ceil((MIN_AMOUNT_CENTS / 100) * CREDITS_PER_DOLLAR)} credits.`,
      );
    }

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${credits} credits`,
              description: `One-time purchase of ${credits} credits for Ez Charts (${CREDITS_PER_DOLLAR} credits per dollar)`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, credits: String(credits) },
      payment_intent_data: {
        metadata: { userId, credits: String(credits) },
      },
      customer_email: email,
    });

    if (!session.url) throw new Error("Failed to create checkout session");
    return { url: session.url };
  },
});

/**
 * Create a Stripe Billing Portal session for managing subscription.
 * Pass stripeCustomerId from client (from userSettings.get) to avoid circular deps.
 */
export const createBillingPortalSession = action({
  args: {
    returnUrl: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, { returnUrl, stripeCustomerId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error("Stripe is not configured");

    if (!stripeCustomerId)
      throw new Error(
        "No subscription found. Upgrade first to manage billing.",
      );

    const stripe = new Stripe(stripeKey);
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    if (!session.url)
      throw new Error("Failed to create billing portal session");
    return { url: session.url };
  },
});

/**
 * Internal mutation called by the webhook to upsert a subscription and sync userSettings.
 */
export const processSubscriptionEvent = internalMutation({
  args: {
    userId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    plan: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    trialStart: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let userId = args.userId;
    if (!userId) {
      const existingSub = await ctx.db
        .query("subscriptions")
        .withIndex("by_stripe_subscription", (q) =>
          q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
        )
        .unique();
      userId = existingSub?.userId;
      if (!userId) {
        console.error(
          "[Stripe] processSubscriptionEvent: no userId and no existing subscription for",
          args.stripeSubscriptionId,
        );
        return;
      }
    }
    const planTier = priceToPlan(args.stripePriceId) ?? "pro";

    console.log(
      "[Stripe] processSubscriptionEvent",
      "userId:",
      args.userId,
      "status:",
      args.status,
      "planTier:",
      planTier,
      "priceId:",
      args.stripePriceId,
    );

    // Upsert subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .unique();

    const subDoc = {
      userId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      plan: args.plan,
      status: args.status,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      trialStart: args.trialStart,
      trialEnd: args.trialEnd,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, subDoc);
    } else {
      await ctx.db.insert("subscriptions", {
        ...subDoc,
        createdAt: now,
      });
    }

    // Sync userSettings.planTier and credits when subscription is active or trialing
    const isActive = args.status === "active" || args.status === "trialing";

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const updates: Record<string, unknown> = {
      updatedAt: now,
    };

    if (isActive) {
      updates.planTier = planTier;
      updates.credits = TIER_LIMITS[planTier].credits;
      updates.renewDate = nextRenewDate();
      if (args.stripeCustomerId) {
        updates.stripeCustomerId = args.stripeCustomerId;
      }
      updates.stripeSubscriptionId = args.stripeSubscriptionId;
      if (args.cancelAtPeriodEnd) {
        updates.tierAvailableUntil = args.currentPeriodEnd;
        updates.scheduledDowngradeTier = "free";
      } else {
        updates.tierAvailableUntil = undefined;
        updates.scheduledDowngradeTier = undefined;
      }
    } else if (
      args.status === "canceled" ||
      args.status === "unpaid" ||
      args.status === "past_due" ||
      args.status === "incomplete_expired"
    ) {
      // Subscription ended or payment failed - revoke access
      updates.planTier = "free";
      updates.credits = TIER_LIMITS.free.credits;
      updates.renewDate = undefined;
      updates.stripeSubscriptionId = undefined;
      updates.tierAvailableUntil = undefined;
      updates.scheduledDowngradeTier = undefined;
    }

    if (Object.keys(updates).length > 1) {
      if (settings) {
        await ctx.db.patch(settings._id, updates);
      } else if (isActive) {
        await ctx.db.insert("userSettings", {
          userId,
          planTier,
          credits: TIER_LIMITS[planTier].credits,
          renewDate: nextRenewDate(),
          stripeCustomerId: args.stripeCustomerId,
          stripeSubscriptionId: args.stripeSubscriptionId,
          updatedAt: now,
        });
      }
    }
  },
});

/**
 * Internal mutation: add credits from one-time payment (payment_intent.succeeded).
 * Idempotent via paymentIntentId.
 */
export const addCreditsFromPaymentIntent = internalMutation({
  args: {
    userId: v.string(),
    credits: v.number(),
    paymentIntentId: v.string(),
    amountCents: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if already processed
    const existing = await ctx.db
      .query("creditPurchases")
      .withIndex("by_payment_id", (q) =>
        q.eq("paymentId", args.paymentIntentId),
      )
      .unique();
    if (existing) return;

    const now = Date.now();

    await ctx.db.insert("creditPurchases", {
      userId: args.userId,
      credits: args.credits,
      planTier: "free", // one-time purchase doesn't change tier
      amountCents: args.amountCents,
      currency: args.currency,
      paymentId: args.paymentIntentId,
      source: "one_time",
      createdAt: now,
    });

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (settings) {
      const current = settings.credits ?? 0;
      await ctx.db.patch(settings._id, {
        credits: current + args.credits,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        credits: args.credits,
        updatedAt: now,
      });
    }
  },
});
