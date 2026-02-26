import { v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import {
  getEffectiveTier,
  TIER_LIMITS,
  type PlanTier,
} from "../tiers/tierLimits";

const planTierValidator = v.union(
  v.literal("free"),
  v.literal("pro"),
  v.literal("max"),
);

/** Usage counts + limits for the authenticated user. For dashboard Tier Limits card. */
export const tierUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return {
        planTier: "free" as PlanTier,
        chartsUsed: 0,
        chartsLimit: TIER_LIMITS.free.maxCharts,
        slidesUsed: 0,
        slidesLimit: TIER_LIMITS.free.maxSlides,
        documentsUsed: 0,
        documentsLimit: TIER_LIMITS.free.maxDocuments,
        creditsUsed: 100,
        creditsLimit: TIER_LIMITS.free.credits,
      };
    const userId = identity.subject;

    const [charts, slides, documents, settings] = await Promise.all([
      ctx.db
        .query("charts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("slides")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("documents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("userSettings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
    ]);

    const effectiveTier = getEffectiveTier(settings);
    const limits = TIER_LIMITS[effectiveTier];
    const creditsLimit = TIER_LIMITS[effectiveTier].credits;

    const visibleCharts = charts.filter(
      (c) => c.isVisible !== false && c.blockedByTier !== true,
    );
    const visibleSlides = slides.filter(
      (s) => s.isVisible !== false && s.blockedByTier !== true,
    );
    const visibleDocs = documents.filter(
      (d) => d.isVisible !== false && d.blockedByTier !== true,
    );

    const chartsUsed = visibleCharts.length;
    const slidesUsed = visibleSlides.length;
    const documentsUsed = visibleDocs.length;
    const creditsUsed = settings?.credits ?? creditsLimit;

    return {
      planTier: effectiveTier,
      tierAvailableUntil: settings?.tierAvailableUntil ?? undefined,
      scheduledDowngradeTier: settings?.scheduledDowngradeTier ?? undefined,
      chartsUsed,
      chartsLimit: limits.maxCharts,
      slidesUsed,
      slidesLimit: limits.maxSlides,
      documentsUsed,
      documentsLimit: limits.maxDocuments,
      creditsUsed,
      creditsLimit,
    };
  },
});

/** Check if user has any items blocked by tier (for upgrade flow). */
export const hasBlockedItems = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const userId = identity.subject;
    const [charts, slides, documents] = await Promise.all([
      ctx.db
        .query("charts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("slides")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("documents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);
    return (
      charts.some((c) => c.isVisible !== false && c.blockedByTier === true) ||
      slides.some((s) => s.isVisible !== false && s.blockedByTier === true) ||
      documents.some((d) => d.isVisible !== false && d.blockedByTier === true)
    );
  },
});

/**
 * One-off migration: copy legacy hiddenByPlanLimit to blockedByTier. Run once if you had existing data.
 */
export const migrateHiddenToBlocked = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    const charts = await ctx.db
      .query("charts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const slides = await ctx.db
      .query("slides")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    let migrated = 0;
    for (const c of charts) {
      const row = c as { blockedByTier?: boolean; hiddenByPlanLimit?: boolean };
      if (row.hiddenByPlanLimit === true && row.blockedByTier !== true) {
        await ctx.db.patch(c._id, {
          blockedByTier: true,
          updatedAt: Date.now(),
        });
        migrated++;
      }
    }
    for (const s of slides) {
      const row = s as { blockedByTier?: boolean; hiddenByPlanLimit?: boolean };
      if (row.hiddenByPlanLimit === true && row.blockedByTier !== true) {
        await ctx.db.patch(s._id, {
          blockedByTier: true,
          updatedAt: Date.now(),
        });
        migrated++;
      }
    }
    for (const d of documents) {
      const row = d as { blockedByTier?: boolean; hiddenByPlanLimit?: boolean };
      if (row.hiddenByPlanLimit === true && row.blockedByTier !== true) {
        await ctx.db.patch(d._id, {
          blockedByTier: true,
          updatedAt: Date.now(),
        });
        migrated++;
      }
    }
    return { migrated };
  },
});

/**
 * Apply plan change selection: set blockedByTier on items, update plan tier.
 * Call this when user confirms their selection in the downgrade modal.
 */
export const applyDowngradeSelection = mutation({
  args: {
    targetTier: planTierValidator,
    chartIdsToKeep: v.array(v.id("charts")),
    slideIdsToKeep: v.array(v.id("slides")),
    documentIdsToKeep: v.array(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const limit = TIER_LIMITS[args.targetTier];
    if (args.chartIdsToKeep.length > limit.maxCharts) {
      throw new Error(`Cannot keep more than ${limit.maxCharts} charts`);
    }
    if (args.slideIdsToKeep.length > limit.maxSlides) {
      throw new Error(`Cannot keep more than ${limit.maxSlides} slide decks`);
    }
    if (args.documentIdsToKeep.length > limit.maxDocuments) {
      throw new Error(`Cannot keep more than ${limit.maxDocuments} documents`);
    }

    const keepCharts = new Set(args.chartIdsToKeep);
    const keepSlides = new Set(args.slideIdsToKeep);
    const keepDocs = new Set(args.documentIdsToKeep);

    const charts = await ctx.db
      .query("charts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const c of charts) {
      if (c.isVisible === false) continue;
      await ctx.db.patch(c._id, {
        blockedByTier: !keepCharts.has(c._id),
        updatedAt: Date.now(),
      });
    }

    const slides = await ctx.db
      .query("slides")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const s of slides) {
      if (s.isVisible === false) continue;
      await ctx.db.patch(s._id, {
        blockedByTier: !keepSlides.has(s._id),
        updatedAt: Date.now(),
      });
    }

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const d of documents) {
      if (d.isVisible === false) continue;
      await ctx.db.patch(d._id, {
        blockedByTier: !keepDocs.has(d._id),
        updatedAt: Date.now(),
      });
    }

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const renewDate = (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.getTime();
    })();
    if (settings) {
      await ctx.db.patch(settings._id, {
        planTier: args.targetTier,
        credits: TIER_LIMITS[args.targetTier].credits,
        renewDate,
        tierAvailableUntil: undefined,
        scheduledDowngradeTier: undefined,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        planTier: args.targetTier,
        credits: TIER_LIMITS[args.targetTier].credits,
        renewDate,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Cron: finalize downgrades when tierAvailableUntil has passed.
 * Sets planTier, clears tierAvailableUntil/scheduledDowngradeTier,
 * and blocks excess items (keeping newest by createdAt).
 */
export const finalizeExpiredDowngrades = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const allSettings = await ctx.db.query("userSettings").collect();
    const expired = allSettings.filter(
      (s) =>
        s.tierAvailableUntil != null &&
        s.tierAvailableUntil < now,
    );
    for (const settings of expired) {
      const targetTier = (settings.scheduledDowngradeTier ?? "free") as PlanTier;
      const limit = TIER_LIMITS[targetTier];

      const [charts, slides, documents] = await Promise.all([
        ctx.db
          .query("charts")
          .withIndex("by_user", (q) => q.eq("userId", settings.userId))
          .collect(),
        ctx.db
          .query("slides")
          .withIndex("by_user", (q) => q.eq("userId", settings.userId))
          .collect(),
        ctx.db
          .query("documents")
          .withIndex("by_user", (q) => q.eq("userId", settings.userId))
          .collect(),
      ]);

      const visibleCharts = charts
        .filter((c) => c.isVisible !== false && c.blockedByTier !== true)
        .sort((a, b) => b.createdAt - a.createdAt);
      const visibleSlides = slides
        .filter((s) => s.isVisible !== false && s.blockedByTier !== true)
        .sort((a, b) => b.createdAt - a.createdAt);
      const visibleDocs = documents
        .filter((d) => d.isVisible !== false && d.blockedByTier !== true)
        .sort((a, b) => b.createdAt - a.createdAt);

      const keepCharts = new Set(
        visibleCharts.slice(0, limit.maxCharts).map((c) => c._id),
      );
      const keepSlides = new Set(
        visibleSlides.slice(0, limit.maxSlides).map((s) => s._id),
      );
      const keepDocs = new Set(
        visibleDocs.slice(0, limit.maxDocuments).map((d) => d._id),
      );

      for (const c of visibleCharts) {
        await ctx.db.patch(c._id, {
          blockedByTier: !keepCharts.has(c._id),
          updatedAt: now,
        });
      }
      for (const s of visibleSlides) {
        await ctx.db.patch(s._id, {
          blockedByTier: !keepSlides.has(s._id),
          updatedAt: now,
        });
      }
      for (const d of visibleDocs) {
        await ctx.db.patch(d._id, {
          blockedByTier: !keepDocs.has(d._id),
          updatedAt: now,
        });
      }

      await ctx.db.patch(settings._id, {
        planTier: targetTier,
        credits: TIER_LIMITS[targetTier].credits,
        renewDate: undefined,
        tierAvailableUntil: undefined,
        scheduledDowngradeTier: undefined,
        stripeSubscriptionId: undefined,
        updatedAt: now,
      });
    }
  },
});
