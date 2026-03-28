import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getSessionFromCookie(req: NextRequest) {
  // NextAuth v5 uses these cookie names
  const token =
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("authjs.session-token")?.value;

  if (!token) return null;

  try {
    // Decode JWT payload (base64) — no crypto needed for routing decisions
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
    );
    return payload;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  const session = getSessionFromCookie(req);
  const isLoggedIn = !!session;
  const userType = session?.userType;
  const onboardingComplete = session?.onboardingComplete;

  // Protect dashboard routes
  if (path.startsWith("/dashboard/brand")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userType !== "brand") return NextResponse.redirect(new URL("/", nextUrl));
    if (!onboardingComplete) return NextResponse.redirect(new URL("/onboarding/brand/1", nextUrl));
  }

  if (path.startsWith("/dashboard/influencer")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userType !== "influencer") return NextResponse.redirect(new URL("/", nextUrl));
    if (!onboardingComplete) return NextResponse.redirect(new URL("/onboarding/influencer/1", nextUrl));
  }

  if (path.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userType !== "admin") return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (path.startsWith("/onboarding")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (path === "/login" || path === "/signup")) {
    if (userType === "brand") return NextResponse.redirect(new URL("/dashboard/brand", nextUrl));
    if (userType === "influencer") return NextResponse.redirect(new URL("/dashboard/influencer", nextUrl));
    if (userType === "admin") return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
