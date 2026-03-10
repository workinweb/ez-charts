import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
  getEffectiveTier,
  TIER_LIMITS,
  type PlanTier,
} from "../tiers/tierLimits";

// ─── Queries ────────────────────────────────────────────────────────────────

/** List all slide decks for the authenticated user, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const [all, settings] = await Promise.all([
      ctx.db
        .query("slides")
        .withIndex("by_user_created", (q) => q.eq("userId", userId))
        .order("desc")
        .collect(),
      ctx.db
        .query("userSettings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
    ]);
    const visible = all.filter(
      (s) => s.isVisible !== false && s.blockedByTier !== true,
    );
    const effectiveTier = getEffectiveTier(settings);
    const limit = TIER_LIMITS[effectiveTier].maxSlides;
    if (limit < Infinity && visible.length > limit) {
      return visible.slice(0, limit);
    }
    return visible;
  },
});

/** List all slides for plan selection modal (includes blockedByTier items). */
export const listForPlanSelection = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const all = await ctx.db
      .query("slides")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return all.filter((s) => s.isVisible !== false);
  },
});

/** Get a single slide deck by ID. */
export const get = query({
  args: { id: v.id("slides") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const [slide, settings] = await Promise.all([
      ctx.db.get(args.id),
      ctx.db
        .query("userSettings")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .unique(),
    ]);
    if (!slide || slide.userId !== identity.subject) return null;
    if (slide.isVisible === false || slide.blockedByTier === true) return null;
    const effectiveTier = getEffectiveTier(settings);
    const limit = TIER_LIMITS[effectiveTier].maxSlides;
    if (limit < Infinity) {
      const all = await ctx.db
        .query("slides")
        .withIndex("by_user_created", (q) => q.eq("userId", identity.subject))
        .order("desc")
        .collect();
      const inLimit = all
        .filter((s) => s.isVisible !== false && s.blockedByTier !== true)
        .slice(0, limit);
      if (!inLimit.some((s) => s._id === args.id)) return null;
    }
    return slide;
  },
});

/** Get slide for presentation: owner always sees it; others see it only when shareSetting is "available" and owner has Pro/Max. */
export const getForPublicOrOwner = query({
  args: { id: v.id("slides") },
  handler: async (ctx, args) => {
    const slide = await ctx.db.get(args.id);
    if (!slide || slide.isVisible === false || slide.blockedByTier === true) {
      return null;
    }
    const identity = await ctx.auth.getUserIdentity();
    if (identity && slide.userId === identity.subject) {
      const ownerSettings = await ctx.db
        .query("userSettings")
        .withIndex("by_user", (q) => q.eq("userId", slide.userId))
        .unique();
      const ownerTier = getEffectiveTier(ownerSettings);
      const canChangeShare = ownerTier === "pro" || ownerTier === "max";
      return { slide, isOwner: true, canChangeShare };
    }
    const shareSetting = slide.shareSetting ?? "restricted";
    if (shareSetting !== "available") return null;
    const ownerSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", slide.userId))
      .unique();
    const ownerTier = getEffectiveTier(ownerSettings);
    if (ownerTier === "free") return null;
    return { slide, isOwner: false, canChangeShare: false };
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

/** Create a new slide deck. */
export const create = mutation({
  args: {
    name: v.string(),
    chartIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const effectiveTier = getEffectiveTier(settings);
    const maxSlides = TIER_LIMITS[effectiveTier].maxSlides;
    if (maxSlides < Infinity) {
      const existing = await ctx.db
        .query("slides")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const visible = existing.filter(
        (s) => s.isVisible !== false && s.blockedByTier !== true,
      );
      if (visible.length >= maxSlides) {
        throw new Error(
          `Slide deck limit reached (${maxSlides} for ${effectiveTier} plan). Upgrade to save more.`,
        );
      }
    }

    const now = Date.now();
    return ctx.db.insert("slides", {
      userId,
      name: args.name,
      chartIds: args.chartIds,
      shareSetting: "restricted",
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

const shareSettingValidator = v.union(
  v.literal("restricted"),
  v.literal("available"),
  v.literal("shared"),
);

/** Update a slide deck's name and/or chart order. */
export const update = mutation({
  args: {
    id: v.id("slides"),
    name: v.optional(v.string()),
    chartIds: v.optional(v.array(v.string())),
    shareSetting: v.optional(shareSettingValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const slide = await ctx.db.get(args.id);
    if (!slide || slide.userId !== identity.subject) {
      throw new Error("Slide deck not found");
    }
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.chartIds !== undefined) updates.chartIds = args.chartIds;
    if (args.shareSetting !== undefined) {
      if (args.shareSetting === "available") {
        const settings = await ctx.db
          .query("userSettings")
          .withIndex("by_user", (q) => q.eq("userId", identity.subject))
          .unique();
        const tier = getEffectiveTier(settings);
        if (tier === "free") {
          throw new Error(
            "Shareable links require Pro or Max. Upgrade to share slides.",
          );
        }
      }
      updates.shareSetting = args.shareSetting;
    }
    await ctx.db.patch(args.id, updates);
  },
});

/** Soft-delete a slide deck (sets isVisible: false; data retained, never returned to user). */
export const remove = mutation({
  args: { id: v.id("slides") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const slide = await ctx.db.get(args.id);
    if (!slide || slide.userId !== identity.subject) {
      throw new Error("Slide deck not found");
    }
    await ctx.db.patch(args.id, {
      isVisible: false,
      updatedAt: Date.now(),
    });
  },
});
