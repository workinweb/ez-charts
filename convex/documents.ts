import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { TIER_LIMITS, type PlanTier } from "./tierLimits";

// ─── Queries ────────────────────────────────────────────────────────────────

/** List all documents for the authenticated user, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const all = await ctx.db
      .query("documents")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return all.filter((d) => d.isVisible !== false);
  },
});

/** Get a single document by ID. */
export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) return null;
    if (doc.isVisible === false) return null;
    return doc;
  },
});

/** Get a download URL for a document's stored file. Returns null if no storageId. */
export const getDownloadUrl = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) return null;
    if (doc.isVisible === false) return null;
    if (!doc.storageId) return null;
    return ctx.storage.getUrl(doc.storageId);
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

/** Save a parsed document. */
export const create = mutation({
  args: {
    name: v.string(),
    size: v.number(),
    mimeType: v.string(),
    content: v.string(),
    storageId: v.optional(v.id("_storage")),
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
    const maxDocuments = TIER_LIMITS[tier].maxDocuments;
    if (maxDocuments === 0) {
      throw new Error(
        "Document storage is not available on the Free plan. Upgrade to Pro to save documents.",
      );
    }
    if (maxDocuments < Infinity) {
      const existing = await ctx.db
        .query("documents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const visible = existing.filter((d) => d.isVisible !== false);
      if (visible.length >= maxDocuments) {
        throw new Error(
          `Document limit reached (${maxDocuments} for ${tier} plan). Upgrade to save more.`,
        );
      }
    }

    const now = Date.now();
    return ctx.db.insert("documents", {
      userId,
      name: args.name,
      size: args.size,
      mimeType: args.mimeType,
      content: args.content,
      storageId: args.storageId,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Soft-delete a document (sets isVisible: false; data retained, never returned to user). */
export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) {
      throw new Error("Document not found");
    }
    await ctx.db.patch(args.id, {
      isVisible: false,
      updatedAt: Date.now(),
    });
  },
});

/** Generate an upload URL for file storage. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return ctx.storage.generateUploadUrl();
  },
});
