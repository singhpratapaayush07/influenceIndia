import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;

  const isLoggedIn = !!session?.user;
  const userType = (session?.user as any)?.userType;
  const onboardingComplete = (session?.user as any)?.onboardingComplete;

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
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
