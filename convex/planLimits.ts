import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { TIER_LIMITS, type PlanTier } from "./tierLimits";

const planTierValidator = v.union(
  v.literal("free"),
  v.literal("pro"),
  v.literal("max"),
);

/** Check if user has any items blocked by tier (for upgrade flow). */
export const hasBlockedItems = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const userId = identity.subject;
    const [charts, slides, documents] = await Promise.all([
      ctx.db.query("charts").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("slides").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("documents").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
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
    const charts = await ctx.db.query("charts").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    const slides = await ctx.db.query("slides").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    const documents = await ctx.db.query("documents").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    let migrated = 0;
    for (const c of charts) {
      const row = c as { blockedByTier?: boolean; hiddenByPlanLimit?: boolean };
      if (row.hiddenByPlanLimit === true && row.blockedByTier !== true) {
        await ctx.db.patch(c._id, { blockedByTier: true, updatedAt: Date.now() });
        migrated++;
      }
    }
    for (const s of slides) {
      const row = s as { blockedByTier?: boolean; hiddenByPlanLimit?: boolean };
      if (row.hiddenByPlanLimit === true && row.blockedByTier !== true) {
        await ctx.db.patch(s._id, { blockedByTier: true, updatedAt: Date.now() });
        migrated++;
      }
    }
    for (const d of documents) {
      const row = d as { blockedByTier?: boolean; hiddenByPlanLimit?: boolean };
      if (row.hiddenByPlanLimit === true && row.blockedByTier !== true) {
        await ctx.db.patch(d._id, { blockedByTier: true, updatedAt: Date.now() });
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
    const CREDITS = { free: 100, pro: 250, max: 600 } as const;

    if (settings) {
      await ctx.db.patch(settings._id, {
        planTier: args.targetTier,
        credits: CREDITS[args.targetTier],
        renewDate,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        planTier: args.targetTier,
        credits: CREDITS[args.targetTier],
        renewDate,
        updatedAt: Date.now(),
      });
    }
  },
});
