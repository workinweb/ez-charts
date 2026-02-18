import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_DASHBOARD_CARD_ORDER = [
  "tier-limits",
  "charts-overview",
  "chat-stats",
  "favorites-stats",
  "slides-overview",
  "chart-types-distribution",
  "data-sources-breakdown",
  "recent-charts",
  "recent-slide-decks",
];

const CREDITS_BY_PLAN = { free: 100, pro: 250, max: 600 } as const;

/** Full date 1 month from now — next renewal date. Set on creation or tier change. */
function nextRenewDate(): number {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

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

const planTierValidator = v.union(
  v.literal("free"),
  v.literal("pro"),
  v.literal("max"),
);

const chartDataEditorModeValidator = v.union(
  v.literal("table"),
  v.literal("items"),
);

/** Upsert user settings. Creates the row if it doesn't exist. */
export const upsert = mutation({
  args: {
    dashboardCardOrder: v.optional(v.array(v.string())),
    saveDocumentsOnDb: v.optional(v.boolean()),
    planTier: v.optional(planTierValidator),
    chartDataEditorMode: v.optional(chartDataEditorModeValidator),
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
      const tier = (args.planTier ?? existing?.planTier ?? "free") as keyof typeof CREDITS_BY_PLAN;
      if (tier === "free") {
        updates.saveDocumentsOnDb = false;
      } else {
        updates.saveDocumentsOnDb = args.saveDocumentsOnDb;
      }
    }
    if (args.planTier !== undefined) {
      updates.planTier = args.planTier;
      updates.credits = CREDITS_BY_PLAN[args.planTier];
      updates.renewDate = nextRenewDate();
    }
    if (args.chartDataEditorMode !== undefined) {
      updates.chartDataEditorMode = args.chartDataEditorMode;
    }

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }
    const planTier = args.planTier ?? "free";
    return ctx.db.insert("userSettings", {
      userId,
      dashboardCardOrder: args.dashboardCardOrder,
      saveDocumentsOnDb: args.saveDocumentsOnDb,
      planTier,
      chartDataEditorMode: args.chartDataEditorMode,
      credits: CREDITS_BY_PLAN[planTier],
      renewDate: nextRenewDate(),
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
        credits: existing.credits ?? 100,
        planTier: existing.planTier ?? "free",
        renewDate: existing.renewDate ?? nextRenewDate(),
      };
    }

    await ctx.db.insert("userSettings", {
      userId,
      dashboardCardOrder: DEFAULT_DASHBOARD_CARD_ORDER,
      saveDocumentsOnDb: false,
      credits: 100,
      planTier: "free",
      renewDate: nextRenewDate(),
      updatedAt: Date.now(),
    });
    return {
      dashboardCardOrder: DEFAULT_DASHBOARD_CARD_ORDER,
      saveDocumentsOnDb: false,
      credits: 100,
      planTier: "free" as const,
      renewDate: nextRenewDate(),
    };
  },
});
