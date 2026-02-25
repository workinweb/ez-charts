import { NextResponse } from "next/server";

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

/**
 * Proxy for Convex set-password endpoint.
 * Allows OAuth-only users (e.g. Google) to add a password to their account.
 */
export async function POST(req: Request) {
  if (!CONVEX_SITE_URL) {
    return NextResponse.json(
      { error: { message: "Server misconfiguration." } },
      { status: 500 },
    );
  }

  const url = `${CONVEX_SITE_URL}/api/set-password`;
  const body = await req.text();
  const headers = new Headers(req.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Host", new URL(CONVEX_SITE_URL).host);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: body || undefined,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
