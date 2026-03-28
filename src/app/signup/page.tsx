"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Building2, Star, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type UserType = "brand" | "influencer";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<UserType>("brand");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "influencer") setUserType("influencer");
    else setUserType("brand");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: data.get("email"),
        password: data.get("password"),
        userType,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();

    if (!res.ok || result.error) {
      toast.error(result.error || "Sign up failed");
      setLoading(false);
      return;
    }

    const { signIn } = await import("next-auth/react");
    const signInResult = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    });

    if (signInResult?.error) {
      toast.error("Account created but sign-in failed. Please log in.");
      router.push("/login");
      return;
    }

    toast.success("Account created! Let's set up your profile.");
    router.push(userType === "brand" ? "/onboarding/brand/1" : "/onboarding/influencer/1");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-700" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join India&apos;s top influencer marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setUserType("brand")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                userType === "brand"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Building2 className={cn("h-6 w-6", userType === "brand" ? "text-purple-700" : "text-gray-400")} />
              <span className={cn("text-sm font-medium", userType === "brand" ? "text-purple-700" : "text-gray-600")}>
                Brand / Agency
              </span>
              {userType === "brand" && <CheckCircle2 className="h-4 w-4 text-purple-600" />}
            </button>
            <button
              type="button"
              onClick={() => setUserType("influencer")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                userType === "influencer"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Star className={cn("h-6 w-6", userType === "influencer" ? "text-purple-700" : "text-gray-400")} />
              <span className={cn("text-sm font-medium", userType === "influencer" ? "text-purple-700" : "text-gray-600")}>
                Influencer
              </span>
              {userType === "influencer" && <CheckCircle2 className="h-4 w-4 text-purple-600" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Min 6 characters" required minLength={6} />
            </div>
            <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Account as {userType === "brand" ? "Brand" : "Influencer"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-700 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
