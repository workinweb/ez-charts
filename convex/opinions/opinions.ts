import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../betterAuth/auth";
import type { Id } from "../_generated/dataModel";

export const OPINION_CATEGORIES = [
  "idea",
  "problem",
  "design",
  "feedback",
  "other",
] as const;

export type OpinionCategory = (typeof OPINION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<OpinionCategory, string> = {
  idea: "New idea or suggestion",
  problem: "Something isn't working",
  design: "Looks and layout",
  feedback: "General feedback",
  other: "Other",
};

/** Get current user's ID (for rate limiting). Returns null if not authenticated. */
export const getCurrentUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject ?? null;
  },
});

/** Public: list opinions with optional category filter and sort. No auth required. */
export const list = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    /** "newest" = chronological (newest first), "top" = most upvotes first */
    orderBy: v.optional(v.union(v.literal("newest"), v.literal("top"))),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 100, 200);
    const sortByUpvotes = args.orderBy !== "newest";
    let items;
    if (
      args.category &&
      OPINION_CATEGORIES.includes(args.category as OpinionCategory)
    ) {
      items = sortByUpvotes
        ? await ctx.db
            .query("opinions")
            .withIndex("by_category_upvoteCount", (q) =>
              q.eq("category", args.category!),
            )
            .order("desc")
            .take(limit * 2)
        : await ctx.db
            .query("opinions")
            .withIndex("by_category_created", (q) =>
              q.eq("category", args.category!),
            )
            .order("desc")
            .take(limit * 2);
    } else {
      items = sortByUpvotes
        ? await ctx.db
            .query("opinions")
            .withIndex("by_upvoteCount", (q) => q)
            .order("desc")
            .take(limit * 2)
        : await ctx.db
            .query("opinions")
            .withIndex("by_created", (q) => q)
            .order("desc")
            .take(limit * 2);
    }
    return items.filter((o) => o.resolved !== true).slice(0, limit);
  },
});

/** Get IDs of opinions the current user has upvoted. Auth optional. */
export const listMyUpvotes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const upvotes = await ctx.db
      .query("opinionUpvotes")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    return upvotes.map((u) => u.opinionId);
  },
});

/** Create opinion. Requires auth. */
export const create = mutation({
  args: {
    content: v.string(),
    category: v.string(),
    categoryCustom: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Sign in to submit feedback.");
    }
    const user = await authComponent.getAuthUser(ctx);
    const content = args.content.trim();
    if (!content || content.length > 2000) {
      throw new Error("Feedback must be 1–2000 characters.");
    }
    if (!OPINION_CATEGORIES.includes(args.category as OpinionCategory)) {
      throw new Error("Invalid category.");
    }
    const categoryCustom =
      args.category === "other" && args.categoryCustom?.trim()
        ? args.categoryCustom.trim().slice(0, 60)
        : undefined;
    const now = Date.now();
    return await ctx.db.insert("opinions", {
      userId: identity.subject,
      userName: user?.name ?? user?.email ?? "Anonymous",
      userImage: user?.image ?? undefined,
      content,
      category: args.category,
      categoryCustom,
      upvoteCount: 0,
      resolved: false,
      createdAt: now,
    });
  },
});

/** Toggle upvote. Requires auth. Adds upvote if absent, removes if present. */
export const toggleUpvote = mutation({
  args: {
    opinionId: v.id("opinions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Sign in to upvote.");
    }
    const userId = identity.subject;
    const existing = await ctx.db
      .query("opinionUpvotes")
      .withIndex("by_opinion_user", (q) =>
        q.eq("opinionId", args.opinionId).eq("userId", userId),
      )
      .unique();
    const opinion = await ctx.db.get(args.opinionId);
    if (!opinion) {
      throw new Error("Opinion not found.");
    }
    const now = Date.now();
    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.opinionId, {
        upvoteCount: Math.max(0, opinion.upvoteCount - 1),
      });
      return { upvoted: false };
    }
    await ctx.db.insert("opinionUpvotes", {
      opinionId: args.opinionId,
      userId,
      createdAt: now,
    });
    await ctx.db.patch(args.opinionId, {
      upvoteCount: opinion.upvoteCount + 1,
    });
    return { upvoted: true };
  },
});

/** Mark opinion as resolved. Only the author can mark their own. */
export const markResolved = mutation({
  args: {
    opinionId: v.id("opinions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Sign in to mark feedback as resolved.");
    }
    const opinion = await ctx.db.get(args.opinionId);
    if (!opinion) {
      throw new Error("Opinion not found.");
    }
    if (opinion.userId !== identity.subject) {
      throw new Error("Only the author can mark this as resolved.");
    }
    await ctx.db.patch(args.opinionId, { resolved: true });
    return { resolved: true };
  },
});
