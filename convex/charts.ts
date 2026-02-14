import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// ─── Queries ────────────────────────────────────────────────────────────────

/** List all charts for the authenticated user, ordered by creation date (newest first). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    return ctx.db
      .query("charts")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/** Paginated list of charts for the authenticated user. */
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    const userId = identity.subject;
    return ctx.db
      .query("charts")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/** Get a single chart by ID (must belong to the authenticated user). */
export const get = query({
  args: { id: v.id("charts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const chart = await ctx.db.get(args.id);
    if (!chart || chart.userId !== identity.subject) return null;
    return chart;
  },
});

/** List only favorited charts for the authenticated user. */
export const listFavorites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const all = await ctx.db
      .query("charts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return all.filter((c) => c.favorited);
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

/** Create a new chart. */
export const create = mutation({
  args: {
    title: v.string(),
    chartType: v.string(),
    data: v.any(),
    source: v.string(),
    favorited: v.optional(v.boolean()),
    withTooltip: v.optional(v.boolean()),
    withAnimation: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const now = Date.now();
    return ctx.db.insert("charts", {
      userId: identity.subject,
      title: args.title,
      chartType: args.chartType,
      data: args.data,
      source: args.source,
      favorited: args.favorited ?? false,
      withTooltip: args.withTooltip ?? true,
      withAnimation: args.withAnimation ?? true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update an existing chart. */
export const update = mutation({
  args: {
    id: v.id("charts"),
    title: v.optional(v.string()),
    chartType: v.optional(v.string()),
    data: v.optional(v.any()),
    source: v.optional(v.string()),
    favorited: v.optional(v.boolean()),
    withTooltip: v.optional(v.boolean()),
    withAnimation: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const chart = await ctx.db.get(args.id);
    if (!chart || chart.userId !== identity.subject) {
      throw new Error("Chart not found");
    }
    const { id, ...patch } = args;
    // Remove undefined values
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

/** Toggle the favorited state of a chart. */
export const toggleFavorite = mutation({
  args: { id: v.id("charts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const chart = await ctx.db.get(args.id);
    if (!chart || chart.userId !== identity.subject) {
      throw new Error("Chart not found");
    }
    await ctx.db.patch(args.id, {
      favorited: !chart.favorited,
      updatedAt: Date.now(),
    });
  },
});

/** Duplicate a chart (creates a copy). */
export const duplicate = mutation({
  args: { id: v.id("charts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const chart = await ctx.db.get(args.id);
    if (!chart || chart.userId !== identity.subject) {
      throw new Error("Chart not found");
    }
    const now = Date.now();
    return ctx.db.insert("charts", {
      userId: identity.subject,
      title: `${chart.title} (copy)`,
      chartType: chart.chartType,
      data: chart.data,
      source: chart.source,
      favorited: false,
      withTooltip: chart.withTooltip,
      withAnimation: chart.withAnimation,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Delete a chart permanently. */
export const remove = mutation({
  args: { id: v.id("charts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const chart = await ctx.db.get(args.id);
    if (!chart || chart.userId !== identity.subject) {
      throw new Error("Chart not found");
    }
    await ctx.db.delete(args.id);
  },
});
