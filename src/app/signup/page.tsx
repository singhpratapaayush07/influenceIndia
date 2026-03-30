"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Building2, Star, Loader2, CheckCircle2, Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OtpInput } from "@/components/auth/otp-input";
import { signIn } from "next-auth/react";

type UserType = "brand" | "influencer";
type SignupStep = "type" | "email" | "otp" | "password" | "oauth-type";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<SignupStep>("type");
  const [userType, setUserType] = useState<UserType>("brand");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [skipOtp, setSkipOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Check for OAuth redirect
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const providerParam = searchParams.get("provider");

    if (emailParam && providerParam === "google") {
      setEmail(emailParam);
      setStep("oauth-type");
    } else {
      const type = searchParams.get("type");
      if (type === "influencer") setUserType("influencer");
      else setUserType("brand");
    }
  }, [searchParams]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOtp = async (emailValue: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, purpose: "signup" }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send OTP");
        setLoading(false);
        return false;
      }

      if (data.skipOtp) {
        setSkipOtp(true);
        setOtpVerified(true);
        toast.success("QA email detected - verification bypassed");
        return true;
      }

      toast.success("Verification code sent to your email");
      setResendTimer(60);
      return true;
    } catch (error) {
      toast.error("Failed to send verification code");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    setEmail(emailValue);

    const success = await handleSendOtp(emailValue);
    if (success) {
      if (skipOtp) {
        setStep("password");
      } else {
        setStep("otp");
      }
    }
  };

  const handleOtpVerify = async (otp: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose: "signup" }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid verification code");
        setLoading(false);
        return;
      }

      setOtpVerified(true);
      toast.success("Email verified successfully!");
      setStep("password");
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const passwordValue = formData.get("password") as string;
    setPassword(passwordValue);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: passwordValue,
          userType,
          otpVerified: otpVerified || skipOtp,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        toast.error(result.error || "Sign up failed");
        setLoading(false);
        return;
      }

      // Auto sign in
      const signInResult = await signIn("credentials", {
        email,
        password: passwordValue,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created but sign-in failed. Please log in.");
        router.push("/login");
        return;
      }

      toast.success("Account created! Let's set up your profile.");
      router.push(userType === "brand" ? "/onboarding/brand/1" : "/onboarding/influencer/1");
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthTypeSelect = async (selectedType: UserType) => {
    setUserType(selectedType);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup-oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          userType: selectedType,
          provider: "google",
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        toast.error(result.error || "Sign up failed");
        setLoading(false);
        return;
      }

      // Sign in with Google
      await signIn("google", { callbackUrl: selectedType === "brand" ? "/onboarding/brand/1" : "/onboarding/influencer/1" });
    } catch (error) {
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/signup" });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-700" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {step === "oauth-type" ? "Complete Your Profile" : "Create your account"}
          </CardTitle>
          <CardDescription>
            {step === "oauth-type"
              ? "Choose your account type to continue"
              : "Join India's top influencer marketplace"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Select User Type */}
          {step === "type" && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setUserType("brand")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    userType === "brand" ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-gray-300"
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
                    userType === "influencer" ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Star className={cn("h-6 w-6", userType === "influencer" ? "text-purple-700" : "text-gray-400")} />
                  <span
                    className={cn("text-sm font-medium", userType === "influencer" ? "text-purple-700" : "text-gray-600")}
                  >
                    Influencer
                  </span>
                  {userType === "influencer" && <CheckCircle2 className="h-4 w-4 text-purple-600" />}
                </button>
              </div>

              <Button onClick={() => setStep("email")} className="w-full bg-purple-700 hover:bg-purple-800 mb-3">
                Continue as {userType === "brand" ? "Brand" : "Influencer"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignup}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="mt-4 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-700 font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </>
          )}

          {/* Step 2: Enter Email */}
          {step === "email" && (
            <>
              <button onClick={() => setStep("type")} className="flex items-center text-sm text-gray-600 mb-4 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Continue
                </Button>
              </form>
            </>
          )}

          {/* Step 3: Verify OTP */}
          {step === "otp" && (
            <>
              <button onClick={() => setStep("email")} className="flex items-center text-sm text-gray-600 mb-4 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    We sent a verification code to
                    <br />
                    <strong className="text-gray-900">{email}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Enter Verification Code</Label>
                  <OtpInput onComplete={handleOtpVerify} disabled={loading} />
                </div>

                <div className="text-center text-sm text-gray-500">
                  {resendTimer > 0 ? (
                    <span>Resend code in {resendTimer}s</span>
                  ) : (
                    <button
                      onClick={() => handleSendOtp(email)}
                      className="text-purple-700 font-medium hover:underline"
                      disabled={loading}
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 4: Create Password */}
          {step === "password" && (
            <>
              <button onClick={() => setStep(skipOtp ? "email" : "otp")} className="flex items-center text-sm text-gray-600 mb-4 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="At least 6 characters"
                      className="pl-10"
                      required
                      minLength={6}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500">Use a strong password with at least 6 characters</p>
                </div>
                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>
            </>
          )}

          {/* OAuth Step: Select Type */}
          {step === "oauth-type" && (
            <>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Signing in with:</strong> {email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleOAuthTypeSelect("brand")}
                  disabled={loading}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all"
                >
                  <Building2 className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Brand / Agency</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthTypeSelect("influencer")}
                  disabled={loading}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all"
                >
                  <Star className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Influencer</span>
                </button>
              </div>

              {loading && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-700" />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
