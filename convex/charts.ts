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
    const all = await ctx.db
      .query("charts")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return all.filter((c) => c.isVisible !== false);
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
    const result = await ctx.db
      .query("charts")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(args.paginationOpts);
    return {
      ...result,
      page: result.page.filter((c) => c.isVisible !== false),
    };
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
    if (chart.isVisible === false) return null;
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
    return all.filter((c) => c.favorited && c.isVisible !== false);
  },
});

/** Dashboard stats: aggregated chart data for the authenticated user. */
export const dashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return {
        totalCharts: 0,
        chartsThisMonth: 0,
        chartsThisWeek: 0,
        favoritesCount: 0,
        monthlyData: [] as { month: string; charts: number }[],
        chartTypes: [] as { name: string; value: number }[],
        dataSources: [] as { name: string; count: number }[],
      };
    const userId = identity.subject;
    const all = await ctx.db
      .query("charts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const charts = all.filter((c) => c.isVisible !== false);

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthStart = startOfMonth.getTime();

    const totalCharts = charts.length;
    const chartsThisMonth = charts.filter((c) => c.createdAt >= monthStart).length;
    const chartsThisWeek = charts.filter((c) => c.createdAt >= oneWeekAgo).length;
    const favoritesCount = charts.filter((c) => c.favorited).length;

    // Last 5 months for bar chart (current + 4 previous)
    const monthlyData: { month: string; charts: number }[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const count = charts.filter((c) => c.createdAt >= start && c.createdAt <= end).length;
      monthlyData.push({ month: monthNames[d.getMonth()], charts: count });
    }

    // Chart types distribution: library + type (e.g. "Shadcn · Bar", "Rosencharts · Bar")
    const typeCounts: Record<string, number> = {};
    for (const c of charts) {
      const lib = c.chartLibrary ?? (c.chartType?.startsWith("shadcn:") ? "shadcn" : "rosencharts");
      const type = c.chartType?.startsWith("shadcn:") ? c.chartType.slice(7) : c.chartType;
      const display = lib === "shadcn"
        ? `Shadcn · ${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ")}`
        : `Rosencharts · ${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ") || "Bar"}`;
      typeCounts[display] = (typeCounts[display] ?? 0) + 1;
    }
    const chartTypes = Object.entries(typeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    const totalForPct = chartTypes.reduce((s, t) => s + t.value, 0);
    const chartTypesWithPct = totalForPct > 0
      ? chartTypes.map((t) => ({ name: t.name, value: Math.round((t.value / totalForPct) * 100) }))
      : chartTypes.map((t) => ({ name: t.name, value: 0 }));

    // Data sources
    const sourceMap: Record<string, string> = {
      "From chat": "From prompt",
      "Manual": "Manual",
    };
    const sourceCounts: Record<string, number> = {};
    for (const c of charts) {
      const key = sourceMap[c.source] ?? c.source ?? "Other";
      sourceCounts[key] = (sourceCounts[key] ?? 0) + 1;
    }
    const dataSources = Object.entries(sourceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalCharts,
      chartsThisMonth,
      chartsThisWeek,
      favoritesCount,
      monthlyData,
      chartTypes: chartTypesWithPct,
      dataSources,
    };
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

const chartLibraryValidator = v.union(v.literal("shadcn"), v.literal("rosencharts"));

/** Create a new chart. */
export const create = mutation({
  args: {
    title: v.string(),
    chartLibrary: chartLibraryValidator,
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
      chartLibrary: args.chartLibrary,
      chartType: args.chartType,
      data: args.data,
      source: args.source,
      favorited: args.favorited ?? false,
      withTooltip: args.withTooltip ?? true,
      withAnimation: args.withAnimation ?? true,
      isVisible: true,
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
    chartLibrary: v.optional(chartLibraryValidator),
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
    const library = chart.chartLibrary ?? (chart.chartType?.startsWith("shadcn:") ? "shadcn" : "rosencharts");
    const type = chart.chartType?.startsWith("shadcn:") ? chart.chartType.slice(7) : chart.chartType;
    return ctx.db.insert("charts", {
      userId: identity.subject,
      title: `${chart.title} (copy)`,
      chartLibrary: library,
      chartType: type,
      data: chart.data,
      source: chart.source,
      favorited: false,
      withTooltip: chart.withTooltip,
      withAnimation: chart.withAnimation,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Soft-delete a chart (sets isVisible: false; data retained, never returned to user). */
export const remove = mutation({
  args: { id: v.id("charts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const chart = await ctx.db.get(args.id);
    if (!chart || chart.userId !== identity.subject) {
      throw new Error("Chart not found");
    }
    await ctx.db.patch(args.id, { isVisible: false, updatedAt: Date.now() });
  },
});
