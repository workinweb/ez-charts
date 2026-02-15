import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { TIER_LIMITS, type PlanTier } from "./tierLimits";

// ─── Queries ────────────────────────────────────────────────────────────────

/** List all slide decks for the authenticated user, newest first. */
export const list = query({
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
    const slide = await ctx.db.get(args.id);
    if (!slide || slide.userId !== identity.subject) return null;
    if (slide.isVisible === false) return null;
    return slide;
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
    const tier = (settings?.planTier ?? "free") as PlanTier;
    const maxSlides = TIER_LIMITS[tier].maxSlides;
    if (maxSlides < Infinity) {
      const existing = await ctx.db
        .query("slides")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const visible = existing.filter((s) => s.isVisible !== false);
      if (visible.length >= maxSlides) {
        throw new Error(
          `Slide deck limit reached (${maxSlides} for ${tier} plan). Upgrade to save more.`,
        );
      }
    }

    const now = Date.now();
    return ctx.db.insert("slides", {
      userId,
      name: args.name,
      chartIds: args.chartIds,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update a slide deck's name and/or chart order. */
export const update = mutation({
  args: {
    id: v.id("slides"),
    name: v.optional(v.string()),
    chartIds: v.optional(v.array(v.string())),
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
