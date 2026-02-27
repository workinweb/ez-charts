import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Deletes chat blobs older than 24 hours. Run via Vercel cron. */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured" },
      { status: 503 },
    );
  }

  try {
    const cutoff = Date.now() - ONE_DAY_MS;
    const toDelete: string[] = [];
    let cursor: string | undefined;

    do {
      const result = await list({
        prefix: "chat/",
        limit: 1000,
        cursor,
      });

      for (const blob of result.blobs) {
        const uploadedAt = blob.uploadedAt instanceof Date
          ? blob.uploadedAt.getTime()
          : new Date(blob.uploadedAt).getTime();
        if (uploadedAt < cutoff) {
          toDelete.push(blob.url);
        }
      }

      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);

    if (toDelete.length > 0) {
      await del(toDelete);
    }

    return NextResponse.json({
      ok: true,
      deleted: toDelete.length,
    });
  } catch (error) {
    console.error("[blob-cleanup] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
