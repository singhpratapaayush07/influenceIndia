"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { NICHES, INDUSTRIES, BUDGET_RANGES } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = ["Account", "Company", "Preferences", "Review"];

export default function BrandOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const { update } = useSession();
  const currentStep = parseInt(params.step as string) || 1;
  const [loading, setLoading] = useState(false);

  // Step 2 state
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  // Step 3 state
  const [budgetRange, setBudgetRange] = useState("");
  const [targetNiches, setTargetNiches] = useState<string[]>([]);

  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) { toast.error("Company name is required"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("companyName", companyName);
    fd.append("industry", industry);
    fd.append("website", website);
    fd.append("description", description);
    fd.append("gstNumber", gstNumber);
    const res = await fetch("/api/onboarding/brand/step2", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); setLoading(false); return; }
    router.push("/onboarding/brand/2");
  }

  async function handleStep3Submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("budgetRange", budgetRange);
    targetNiches.forEach(n => fd.append("targetNiches", n));
    const res = await fetch("/api/onboarding/brand/step3", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); setLoading(false); return; }
    router.push("/onboarding/brand/3");
  }

  async function handleFinalSubmit() {
    setLoading(true);
    const res = await fetch("/api/onboarding/brand/submit", { method: "POST" });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); setLoading(false); return; }
    await update({ onboardingComplete: true });
    toast.success("Profile submitted! You can now browse influencers.");
    window.location.href = "/dashboard/brand";
  }

  function toggleNiche(niche: string) {
    setTargetNiches(prev =>
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-purple-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Set up your brand profile</h1>
          <p className="text-gray-500 text-sm mt-1">Start finding perfect influencers for your campaigns</p>
        </div>
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Account Created ✓</CardTitle>
              <CardDescription>Let&apos;s set up your brand profile now.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-700 hover:bg-purple-800" onClick={() => router.push("/onboarding/brand/1")}>
                Set Up Company Info
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1 maps to route /1 but we show company form here */}
        {currentStep === 1 && null}

        {/* Route /1 shows company form (step index 1 = "Company" step) */}
        {currentStep === 1 && (
          <Card className="mt-0">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Tell influencers about your brand.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input placeholder="Your Brand Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={industry} onChange={e => setIndustry(e.target.value)}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input placeholder="https://yourbrand.com" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>About your brand</Label>
                  <Textarea placeholder="Describe your brand, products, and target audience..." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>GST Number (optional)</Label>
                  <Input placeholder="22AAAAA0000A1Z5" value={gstNumber} onChange={e => setGstNumber(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Preferences</CardTitle>
              <CardDescription>Help us match you with the right influencers.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep3Submit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Monthly Campaign Budget</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {BUDGET_RANGES.map(({ value, label }) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setBudgetRange(value)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm transition-all",
                          budgetRange === value
                            ? "border-purple-600 bg-purple-50 text-purple-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Target Niches (select all relevant)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {NICHES.map(niche => (
                      <button
                        type="button"
                        key={niche}
                        onClick={() => toggleNiche(niche)}
                        className={cn(
                          "text-sm px-3 py-2 rounded-lg border transition-all",
                          targetNiches.includes(niche)
                            ? "border-purple-600 bg-purple-50 text-purple-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        )}
                      >
                        {niche}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>You&apos;re all set! 🚀</CardTitle>
              <CardDescription>Your brand profile is ready. Start browsing verified influencers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-blue-800">What you can do next:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Browse hundreds of verified Indian influencers</li>
                  <li>✅ Filter by niche, city, followers, and price</li>
                  <li>✅ Send collaboration requests directly</li>
                  <li>✅ Track all your outreach from your dashboard</li>
                </ul>
              </div>
              <Button className="w-full bg-purple-700 hover:bg-purple-800" onClick={handleFinalSubmit} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
