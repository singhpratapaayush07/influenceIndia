"use client";

import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigationProgress } from "@/components/layout/NavigationProgress";
import { Menu, X } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { start: startNavProgress } = useNavigationProgress();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user as any;
  const userType = user?.userType;

  const dashboardHref =
    userType === "brand"
      ? "/dashboard/brand"
      : userType === "influencer"
      ? "/dashboard/influencer"
      : "/admin";

  const navLinkClass = `text-sm font-medium transition-colors ${
    isHome ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-purple-700"
  }`;

  const mobileNavLink = "block py-3 px-2 text-base font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors";

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isHome
          ? "bg-transparent border-b border-white/10"
          : "bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 max-w-6xl">

        {/* Logo */}
        <Link
          href={session ? dashboardHref : "/"}
          className={`font-serif italic text-xl sm:text-2xl font-bold tracking-tight transition-colors ${
            isHome ? "text-white" : "text-purple-800"
          }`}
        >
          InfluenceIndia
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {userType !== "influencer" && (
            <Link href="/influencers" className={navLinkClass}>
              Browse Influencers
            </Link>
          )}
          {session && userType === "influencer" && (
            <Link href="/campaigns" className={navLinkClass}>
              Campaigns
            </Link>
          )}
          {session && (userType === "brand" || userType === "influencer") && (
            <Link href="/dashboard/messages" className={navLinkClass}>
              Messages
            </Link>
          )}
          {!session && (
            <>
              <Link href="/signup?type=brand" className={navLinkClass}>
                For Brands
              </Link>
              <Link href="/signup?type=influencer" className={navLinkClass}>
                For Creators
              </Link>
            </>
          )}
        </nav>

        {/* Right side: Auth + Mobile hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger>
              <div
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isHome ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="px-5 pt-5 pb-3 border-b">
                <SheetTitle className="font-serif italic text-xl text-purple-800">
                  InfluenceIndia
                </SheetTitle>
              </SheetHeader>
              <nav className="px-3 py-4 space-y-1">
                {session && (
                  <div className="px-2 pb-3 mb-2 border-b">
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <p className="text-xs font-semibold capitalize text-purple-700">{userType}</p>
                  </div>
                )}

                {session && (
                  <Link href={dashboardHref} className={mobileNavLink} onClick={closeMobile}>
                    Dashboard
                  </Link>
                )}

                {userType !== "influencer" && (
                  <Link href="/influencers" className={mobileNavLink} onClick={closeMobile}>
                    Browse Influencers
                  </Link>
                )}

                {session && userType === "influencer" && (
                  <Link href="/campaigns" className={mobileNavLink} onClick={closeMobile}>
                    Campaigns
                  </Link>
                )}

                {session && (userType === "brand" || userType === "influencer") && (
                  <Link href="/dashboard/messages" className={mobileNavLink} onClick={closeMobile}>
                    Messages
                  </Link>
                )}

                {session && userType === "admin" && (
                  <Link href="/admin" className={mobileNavLink} onClick={closeMobile}>
                    Admin Panel
                  </Link>
                )}

                {!session && (
                  <>
                    <Link href="/login" className={mobileNavLink} onClick={closeMobile}>
                      Login
                    </Link>
                    <Link href="/signup?type=brand" className={mobileNavLink} onClick={closeMobile}>
                      For Brands
                    </Link>
                    <Link href="/signup?type=influencer" className={mobileNavLink} onClick={closeMobile}>
                      For Creators
                    </Link>
                  </>
                )}

                {session && (
                  <button
                    className="block w-full text-left py-3 px-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4 border-t pt-4"
                    onClick={() => { closeMobile(); signOut({ callbackUrl: "/" }); }}
                  >
                    Sign out
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop auth actions */}
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
                <DropdownMenuItem onClick={() => { startNavProgress(); router.push(dashboardHref); }}>
                  Dashboard
                </DropdownMenuItem>
                {userType === "admin" && (
                  <DropdownMenuItem onClick={() => { startNavProgress(); router.push("/admin"); }}>
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
            <div className="hidden md:flex items-center gap-3">
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
