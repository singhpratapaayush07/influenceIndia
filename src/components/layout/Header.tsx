"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const user = session?.user as any;
  const userType = user?.userType;

  const dashboardHref =
    userType === "brand"
      ? "/dashboard/brand"
      : userType === "influencer"
      ? "/dashboard/influencer"
      : "/admin";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isHome
          ? "bg-transparent border-b border-white/10"
          : "bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6 max-w-6xl">

        {/* Logo */}
        <Link
          href="/"
          className={`font-serif italic text-2xl font-bold tracking-tight transition-colors ${
            isHome ? "text-white" : "text-purple-800"
          }`}
        >
          InfluenceIndia
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/influencers"
            className={`text-sm font-medium transition-colors ${
              isHome ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-purple-700"
            }`}
          >
            Browse Influencers
          </Link>
          {!session && (
            <>
              <Link
                href="/signup?type=brand"
                className={`text-sm font-medium transition-colors ${
                  isHome ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-purple-700"
                }`}
              >
                For Brands
              </Link>
              <Link
                href="/signup?type=influencer"
                className={`text-sm font-medium transition-colors ${
                  isHome ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-purple-700"
                }`}
              >
                For Creators
              </Link>
            </>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold text-sm">
                    {user?.email?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <p className="text-xs font-semibold capitalize text-purple-700">{userType}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(dashboardHref)}>
                  Dashboard
                </DropdownMenuItem>
                {userType === "admin" && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-medium transition-colors px-1 ${
                  isHome ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Login
              </Link>
              <Button
                size="sm"
                className="rounded-full px-5 bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-none"
                asChild
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
