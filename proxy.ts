import { NextRequest, NextResponse } from "next/server";

// ─── Auth Proxy ─────────────────────────────────────────────────────────────
// Lightweight routing guard that runs on every matched request.
// Checks for the Better Auth session cookie and redirects accordingly:
//   - Unauthenticated users → /sign-in
//   - Authenticated users on /sign-in or /sign-up → /

const PUBLIC_PATHS = new Set(["/sign-in", "/sign-up"]);
const AUTH_COOKIE_NAME = "better-auth.session_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);

  // If user is on a public auth page and already has a session, redirect home
  if (PUBLIC_PATHS.has(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is trying to access protected pages without a session, redirect to sign-in
  if (!PUBLIC_PATHS.has(pathname) && !hasSession) {
    const signInUrl = new URL("/sign-in", request.url);
    // Preserve the intended destination for redirect after login
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except: API routes, static files, images, favicon, _next
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
