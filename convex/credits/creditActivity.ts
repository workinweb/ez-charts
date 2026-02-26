/**
 * Unified credit activity — merges credits spent (AI chat) and credits added (purchases)
 * into a single chronological feed with a type field.
 */
import { paginationOptsValidator } from "convex/server";
import type { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";

export type CreditActivityType = "spent" | "purchase";

export type CreditActivityItem =
  | {
      type: "spent";
      _id: `usage-${string}`;
      createdAt: number;
      creditsCharged: number;
      content?: string;
      messageId: Id<"chatMessages">;
    }
  | {
      type: "purchase";
      _id: `purchase-${string}`;
      createdAt: number;
      credits: number;
      source?: string;
      purchaseId: Id<"creditPurchases">;
    };

/**
 * Paginated unified activity feed: credits spent + purchases, sorted by createdAt desc.
 */
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args): Promise<{
    page: CreditActivityItem[];
    isDone: boolean;
    continueCursor: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    const userId = identity.subject;
    const numItems = args.paginationOpts.numItems;
    const cursor = args.paginationOpts.cursor;

    // Fetch extra from each source to merge and sort (we need enough for a full page)
    const fetchLimit = Math.max(numItems * 3, 60);
    let beforeCreatedAt: number | undefined;
    if (cursor) {
      try {
        const parsed = JSON.parse(
          decodeURIComponent(cursor),
        ) as { createdAt: number };
        beforeCreatedAt = parsed.createdAt;
      } catch {
        beforeCreatedAt = undefined;
      }
    }

    const usageQuery = ctx.db
      .query("chatMessages")
      .withIndex("by_user_created", (q) =>
        beforeCreatedAt != null
          ? q.eq("userId", userId).lt("createdAt", beforeCreatedAt)
          : q.eq("userId", userId),
      )
      .order("desc")
      .take(fetchLimit);

    const purchasesQuery = ctx.db
      .query("creditPurchases")
      .withIndex("by_user_created", (q) =>
        beforeCreatedAt != null
          ? q.eq("userId", userId).lt("createdAt", beforeCreatedAt)
          : q.eq("userId", userId),
      )
      .order("desc")
      .take(fetchLimit);

    const [usageRaw, purchasesRaw] = await Promise.all([
      usageQuery,
      purchasesQuery,
    ]);

    const usage = usageRaw.filter(
      (m) =>
        m.role === "assistant" &&
        typeof m.creditsCharged === "number" &&
        m.creditsCharged > 0,
    );

    const usageItems: CreditActivityItem[] = usage.map((m) => ({
      type: "spent" as const,
      _id: `usage-${m._id}` as const,
      createdAt: m.createdAt,
      creditsCharged: m.creditsCharged ?? 0,
      content: m.content?.trim() || undefined,
      messageId: m._id,
    }));

    const purchaseItems: CreditActivityItem[] = purchasesRaw.map((p) => ({
      type: "purchase" as const,
      _id: `purchase-${p._id}` as const,
      createdAt: p.createdAt,
      credits: p.credits,
      source: p.source,
      purchaseId: p._id,
    }));

    const merged = [...usageItems, ...purchaseItems].sort(
      (a, b) => b.createdAt - a.createdAt,
    );

    const page = merged.slice(0, numItems);
    const hasMore = merged.length > numItems;
    const lastItem = page[page.length - 1];

    const continueCursor = hasMore && lastItem
      ? encodeURIComponent(JSON.stringify({ createdAt: lastItem.createdAt }))
      : "";

    return {
      page,
      isDone: !hasMore,
      continueCursor,
    };
  },
});
