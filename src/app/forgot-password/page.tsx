"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Loader2, Mail, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { OtpInput } from "@/components/auth/otp-input";

type ResetStep = "email" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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
        body: JSON.stringify({ email: emailValue, purpose: "reset-password" }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send verification code");
        setLoading(false);
        return false;
      }

      if (data.skipOtp) {
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
      if (otpVerified) {
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
        body: JSON.stringify({ email, otp, purpose: "reset-password" }),
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

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword,
          otpVerified: otpVerified,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        toast.error(result.error || "Password reset failed");
        setLoading(false);
        return;
      }

      toast.success("Password reset successfully!");
      setStep("success");
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
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
            {step === "success" ? "Password Reset Complete" : "Reset your password"}
          </CardTitle>
          <CardDescription>
            {step === "success"
              ? "You can now sign in with your new password"
              : "We'll send you a verification code to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Enter Email */}
          {step === "email" && (
            <>
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
                  Send Verification Code
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/login" className="text-sm text-purple-700 hover:underline inline-flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to login
                </Link>
              </div>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {step === "otp" && (
            <>
              <button
                onClick={() => setStep("email")}
                className="flex items-center text-sm text-gray-600 mb-4 hover:text-gray-900"
              >
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

          {/* Step 3: Create New Password */}
          {step === "password" && (
            <>
              <button
                onClick={() => setStep(otpVerified && resendTimer === 0 ? "email" : "otp")}
                className="flex items-center text-sm text-gray-600 mb-4 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Use a strong password with at least 6 characters</p>
                </div>
                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Reset Password
                </Button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <p className="text-gray-600">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Button onClick={() => router.push("/login")} className="w-full bg-purple-700 hover:bg-purple-800">
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
