import { NextRequest, NextResponse } from "next/server";

// ─── Auth Guard ────────────────────────────────────────────────────────────
// Runs on every matched request. Redirects:
//   - Unauthenticated on protected routes → /sign-in
//   - Authenticated on /sign-in or /sign-up → /ezcharts (app home)
//
// Public: /, /sign-in, /sign-up, /forgot-password, /reset-password, /present/*

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/sign-in" || pathname === "/sign-up") return true;
  if (pathname === "/forgot-password" || pathname === "/reset-password") return true;
  if (pathname === "/contact") return true;
  if (pathname === "/privacy" || pathname === "/terms") return true;
  if (pathname === "/examples") return true;
  if (pathname.startsWith("/present/")) return true;
  return false;
}

const AUTH_COOKIE_NAME = "better-auth.session_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);

  // Authenticated user on landing or sign-in/sign-up → redirect to app
  if (
    hasSession &&
    (pathname === "/" || pathname === "/sign-in" || pathname === "/sign-up")
  ) {
    return NextResponse.redirect(new URL("/ezcharts", request.url));
  }

  // Unauthenticated on protected route → sign-in with redirect param
  if (!isPublicPath(pathname) && !hasSession) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
