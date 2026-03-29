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
import { Loader2, AtSign, Video } from "lucide-react";
import { NICHES, CITIES, TIER_TYPES } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = ["Account", "Social", "Profile", "Pricing", "Review"];

export default function InfluencerOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const { update } = useSession();
  const currentStep = parseInt(params.step as string) || 1;
  const [loading, setLoading] = useState(false);

  // Step 2 state
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [followers, setFollowers] = useState("");

  // Step 3 state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [languages, setLanguages] = useState("Hindi, English");

  // Step 4 state
  const [pricing, setPricing] = useState<Record<string, { price: string; desc: string; days: string }>>({
    story: { price: "", desc: "", days: "1" },
    post: { price: "", desc: "", days: "3" },
    reel: { price: "", desc: "", days: "3" },
    video: { price: "", desc: "", days: "7" },
  });

  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!instagram && !youtube && !tiktok) {
      toast.error("Please add at least one social handle");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("instagramHandle", instagram);
    fd.append("youtubeHandle", youtube);
    fd.append("tiktokHandle", tiktok);
    fd.append("followerCount", followers);
    const res = await fetch("/api/onboarding/influencer/step2", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); setLoading(false); return; }
    router.push("/onboarding/influencer/3");
  }

  async function handleStep3Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) { toast.error("Display name is required"); return; }
    if (selectedNiches.length === 0) { toast.error("Select at least one niche"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("displayName", displayName);
    fd.append("bio", bio);
    fd.append("city", city);
    selectedNiches.forEach(n => fd.append("niches", n));
    fd.append("languages", languages);
    const res = await fetch("/api/onboarding/influencer/step3", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); setLoading(false); return; }
    router.push("/onboarding/influencer/4");
  }

  async function handleStep4Submit(e: React.FormEvent) {
    e.preventDefault();
    const hasPricing = Object.values(pricing).some(p => p.price && parseInt(p.price) > 0);
    if (!hasPricing) { toast.error("Add pricing for at least one content type"); return; }
    setLoading(true);
    const fd = new FormData();
    TIER_TYPES.forEach(({ value }) => {
      fd.append(`price_${value}`, pricing[value]?.price || "");
      fd.append(`desc_${value}`, pricing[value]?.desc || "");
      fd.append(`days_${value}`, pricing[value]?.days || "7");
    });
    const res = await fetch("/api/onboarding/influencer/step4", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); setLoading(false); return; }
    router.push("/onboarding/influencer/5");
  }

  async function handleFinalSubmit() {
    setLoading(true);
    const res = await fetch("/api/onboarding/influencer/submit", { method: "POST" });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); setLoading(false); return; }
    await update({ onboardingComplete: true });
    toast.success("Profile submitted for verification!");
    window.location.href = "/dashboard/influencer";
  }

  function toggleNiche(niche: string) {
    setSelectedNiches(prev =>
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 to-pink-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Set up your influencer profile</h1>
          <p className="text-gray-500 text-sm mt-1">Complete all steps to get listed on InfluenceIndia</p>
        </div>
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Step 1 – Account (already done via signup) */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Account Created ✓</CardTitle>
              <CardDescription>Your account is ready. Now let&apos;s set up your social presence.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-700 hover:bg-purple-800" onClick={() => router.push("/onboarding/influencer/2")}>
                Continue to Social Handles
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 – Social Presence */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Social Presence</CardTitle>
              <CardDescription>Connect your social media accounts so brands can find you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><AtSign className="h-4 w-4 text-pink-500" /> Instagram Handle</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm">@</span>
                    <Input className="rounded-l-none" placeholder="yourhandle" value={instagram} onChange={e => setInstagram(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Video className="h-4 w-4 text-red-500" /> YouTube Channel (optional)</Label>
                  <Input placeholder="Channel name or URL" value={youtube} onChange={e => setYoutube(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>TikTok Handle (optional)</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm">@</span>
                    <Input className="rounded-l-none" placeholder="yourhandle" value={tiktok} onChange={e => setTiktok(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total Followers (across all platforms)</Label>
                  <Input type="number" placeholder="e.g. 50000" value={followers} onChange={e => setFollowers(e.target.value)} min="0" />
                  <p className="text-xs text-gray-400">Admin will verify this during review.</p>
                </div>
                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3 – Profile */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Tell brands about yourself and your content.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep3Submit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name *</Label>
                  <Input placeholder="Your name or creator name" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea placeholder="Tell brands who you are, your audience, and what you create..." rows={3} value={bio} onChange={e => setBio(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={city} onChange={e => setCity(e.target.value)}>
                    <option value="">Select your city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Content Niches * (select all that apply)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {NICHES.map(niche => (
                      <button
                        type="button"
                        key={niche}
                        onClick={() => toggleNiche(niche)}
                        className={cn(
                          "text-sm px-3 py-2 rounded-lg border transition-all",
                          selectedNiches.includes(niche)
                            ? "border-purple-600 bg-purple-50 text-purple-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        )}
                      >
                        {niche}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Languages (comma-separated)</Label>
                  <Input placeholder="Hindi, English, Tamil" value={languages} onChange={e => setLanguages(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4 – Pricing */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Set Your Pricing</CardTitle>
              <CardDescription>Define what you charge for each content type. Brands will see this.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep4Submit} className="space-y-6">
                {TIER_TYPES.map(({ value, label, icon }) => (
                  <div key={value} className="p-4 border rounded-xl space-y-3">
                    <h3 className="font-medium text-sm">{icon} {label}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Price (₹)</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-2 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm">₹</span>
                          <Input
                            className="rounded-l-none"
                            type="number"
                            placeholder="0"
                            min="0"
                            value={pricing[value]?.price || ""}
                            onChange={e => setPricing(p => ({ ...p, [value]: { ...p[value], price: e.target.value } }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Turnaround (days)</Label>
                        <Input
                          type="number"
                          placeholder="7"
                          min="1"
                          value={pricing[value]?.days || ""}
                          onChange={e => setPricing(p => ({ ...p, [value]: { ...p[value], days: e.target.value } }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">What&apos;s included (optional)</Label>
                      <Input
                        placeholder="e.g. 1 story, 24h live, mention in bio"
                        value={pricing[value]?.desc || ""}
                        onChange={e => setPricing(p => ({ ...p, [value]: { ...p[value], desc: e.target.value } }))}
                      />
                    </div>
                  </div>
                ))}
                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 5 – Review */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Almost There! 🎉</CardTitle>
              <CardDescription>Your profile will be reviewed by our team before going live.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-purple-800">What happens next?</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>✅ Our team reviews your profile within 24-48 hours</li>
                  <li>✅ Once verified, your profile goes live for brands to see</li>
                  <li>✅ Brands will reach out to you with collaboration requests</li>
                  <li>✅ You can update your pricing anytime from your dashboard</li>
                </ul>
              </div>
              <Button className="w-full bg-purple-700 hover:bg-purple-800" onClick={handleFinalSubmit} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Submit Profile for Review
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
