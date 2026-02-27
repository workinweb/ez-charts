import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { urls?: string[] };
    const urls = body.urls;
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array required" },
        { status: 400 },
      );
    }
    await del(urls);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Blob delete error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
