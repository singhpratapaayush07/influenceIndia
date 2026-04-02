import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

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

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  // --- Rate limiting for public-facing routes ---
  const ip = getClientIp(req);

  if (path.startsWith("/influencers") && !path.startsWith("/influencers/")) {
    // Browse page: 60 req/min
    const { allowed } = rateLimit(`browse:${ip}`, 60, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  if (/^\/influencers\/[^/]+$/.test(path)) {
    // Profile detail: 30 req/min
    const { allowed } = rateLimit(`profile:${ip}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  if (path === "/api/messages" && req.method === "POST") {
    const session = getSessionFromCookie(req);
    const key = session?.sub || ip;
    const { allowed } = rateLimit(`msg:${key}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many messages" }, { status: 429 });
    }
  }

  if (path === "/api/contact" && req.method === "POST") {
    const session = getSessionFromCookie(req);
    const key = session?.sub || ip;
    const { allowed } = rateLimit(`contact:${key}`, 5, 3_600_000); // 5 per hour
    if (!allowed) {
      return NextResponse.json({ error: "Too many contact requests" }, { status: 429 });
    }
  }

  // --- Auth-based route protection ---
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
    "/influencers/:path*",
    "/influencers",
    "/api/messages",
    "/api/contact",
  ],
};
