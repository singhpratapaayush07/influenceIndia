"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { NICHES, CITIES, TIER_TYPES } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [followers, setFollowers] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [languages, setLanguages] = useState("");
  const [pricing, setPricing] = useState<Record<string, { price: string; desc: string; days: string }>>({
    story: { price: "", desc: "", days: "1" },
    post: { price: "", desc: "", days: "3" },
    reel: { price: "", desc: "", days: "3" },
    video: { price: "", desc: "", days: "7" },
  });

  useEffect(() => {
    fetch("/api/dashboard/influencer/profile")
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          const p = data.profile;
          setDisplayName(p.displayName || "");
          setBio(p.bio || "");
          setCity(p.city || "");
          setInstagram(p.instagramHandle || "");
          setYoutube(p.youtubeHandle || "");
          setTiktok(p.tiktokHandle || "");
          setFollowers(p.followerCount?.toString() || "");
          setLanguages(Array.isArray(p.languages) ? p.languages.join(", ") : p.languages || "");
          setSelectedNiches(Array.isArray(p.niches) ? p.niches : []);
          if (p.pricing?.length) {
            const pm: any = { ...pricing };
            p.pricing.forEach((pr: any) => {
              pm[pr.tierType] = { price: pr.priceInr?.toString() || "", desc: pr.description || "", days: pr.turnaroundDays?.toString() || "7" };
            });
            setPricing(pm);
          }
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleNiche(niche: string) {
    setSelectedNiches(prev =>
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    );
  }

  async function handleSave() {
    if (!displayName.trim()) { toast.error("Display name is required"); return; }
    if (selectedNiches.length === 0) { toast.error("Select at least one niche"); return; }
    setSaving(true);
    const res = await fetch("/api/dashboard/influencer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName, bio, city, instagramHandle: instagram, youtubeHandle: youtube,
        tiktokHandle: tiktok, followerCount: parseInt(followers) || 0,
        languages: languages.split(",").map(l => l.trim()).filter(Boolean),
        niches: selectedNiches, pricing,
      }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to save"); setSaving(false); return; }
    toast.success("Profile updated!");
    setSaving(false);
    router.push("/dashboard/influencer");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/influencer"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-500">Update your public influencer profile</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Display Name *</Label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your creator name" />
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell brands who you are..." rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={city} onChange={e => setCity(e.target.value)}>
                  <option value="">Select your city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Languages (comma-separated)</Label>
                <Input value={languages} onChange={e => setLanguages(e.target.value)} placeholder="Hindi, English" />
              </div>
            </CardContent>
          </Card>

          {/* Social */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Social Handles</CardTitle>
              <CardDescription>Note: follower count changes require admin re-verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Instagram Handle</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm">@</span>
                  <Input className="rounded-l-none" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="yourhandle" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>YouTube Channel (optional)</Label>
                <Input value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="Channel name or URL" />
              </div>
              <div className="space-y-1.5">
                <Label>TikTok Handle (optional)</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm">@</span>
                  <Input className="rounded-l-none" value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="yourhandle" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Niches */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Content Niches *</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          type="number" min="0"
                          value={pricing[value]?.price || ""}
                          onChange={e => setPricing(p => ({ ...p, [value]: { ...p[value], price: e.target.value } }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Turnaround (days)</Label>
                      <Input
                        type="number" min="1"
                        value={pricing[value]?.days || ""}
                        onChange={e => setPricing(p => ({ ...p, [value]: { ...p[value], days: e.target.value } }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">What&apos;s included (optional)</Label>
                    <Input
                      value={pricing[value]?.desc || ""}
                      onChange={e => setPricing(p => ({ ...p, [value]: { ...p[value], desc: e.target.value } }))}
                      placeholder="e.g. 1 reel, 2 revisions"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button className="w-full bg-purple-700 hover:bg-purple-800 gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
