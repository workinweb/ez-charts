import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_DASHBOARD_CARD_ORDER = [
  "charts-overview",
  "favorites-stats",
  "slides-overview",
  "chart-types-distribution",
  "data-sources-breakdown",
  "recent-charts",
  "recent-slide-decks",
];

/** Get the authenticated user's settings (or null if not set). */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    return ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

/** Upsert user settings. Creates the row if it doesn't exist. */
export const upsert = mutation({
  args: {
    dashboardCardOrder: v.optional(v.array(v.string())),
    saveDocumentsOnDb: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.dashboardCardOrder !== undefined) {
      updates.dashboardCardOrder = args.dashboardCardOrder;
    }
    if (args.saveDocumentsOnDb !== undefined) {
      updates.saveDocumentsOnDb = args.saveDocumentsOnDb;
    }

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }
    return ctx.db.insert("userSettings", {
      userId,
      dashboardCardOrder: args.dashboardCardOrder,
      saveDocumentsOnDb: args.saveDocumentsOnDb,
      updatedAt: Date.now(),
    });
  },
});

/** Ensure user has a settings row. Creates with defaults if not exists. Idempotent. */
export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      return {
        dashboardCardOrder: existing.dashboardCardOrder ?? DEFAULT_DASHBOARD_CARD_ORDER,
        saveDocumentsOnDb: existing.saveDocumentsOnDb ?? false,
      };
    }

    await ctx.db.insert("userSettings", {
      userId,
      dashboardCardOrder: DEFAULT_DASHBOARD_CARD_ORDER,
      saveDocumentsOnDb: false,
      updatedAt: Date.now(),
    });
    return {
      dashboardCardOrder: DEFAULT_DASHBOARD_CARD_ORDER,
      saveDocumentsOnDb: false,
    };
  },
});
