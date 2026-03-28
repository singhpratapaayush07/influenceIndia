"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const user = session?.user as any;
  const userType = user?.userType;

  const dashboardHref =
    userType === "brand"
      ? "/dashboard/brand"
      : userType === "influencer"
      ? "/dashboard/influencer"
      : "/admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-purple-700">
          <TrendingUp className="h-6 w-6" />
          <span>InfluenceIndia</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/influencers" className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors">
            Browse Influencers
          </Link>
          {!session && (
            <>
              <Link href="/signup?type=brand" className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors">
                For Brands
              </Link>
              <Link href="/signup?type=influencer" className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors">
                For Influencers
              </Link>
            </>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                      {user?.email?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs font-medium capitalize text-purple-700">{userType}</p>
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
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" className="bg-purple-700 hover:bg-purple-800" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
