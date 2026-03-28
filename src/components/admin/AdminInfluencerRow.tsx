"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatFollowers } from "@/lib/scoring";
import { CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdminInfluencerRowProps {
  influencer: {
    id: string;
    userId: string;
    displayName: string;
    instagramHandle: string | null;
    followerCount: number;
    engagementRate: number;
    viralityScore: number;
    city: string | null;
    niches: string[];
    pricing: { tierType: string; priceInr: number }[];
    user: { email: string };
  };
}

export function AdminInfluencerRow({ influencer }: AdminInfluencerRowProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<"approve" | "reject" | "update" | null>(null);
  const [followers, setFollowers] = useState(influencer.followerCount.toString());
  const [engagement, setEngagement] = useState(influencer.engagementRate.toString());
  const [virality, setVirality] = useState(influencer.viralityScore.toString());

  const niches: string[] = influencer.niches || [];

  async function handleApprove() {
    setLoading("approve");
    const res = await fetch("/api/admin/influencers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: influencer.userId,
        action: "verify",
        followerCount: parseInt(followers),
        engagementRate: parseFloat(engagement),
        viralityScore: parseFloat(virality),
      }),
    });
    if (!res.ok) { toast.error("Failed"); }
    else { toast.success(`${influencer.displayName} verified!`); router.refresh(); }
    setLoading(null);
  }

  async function handleReject() {
    setLoading("reject");
    const res = await fetch("/api/admin/influencers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: influencer.userId, action: "reject" }),
    });
    if (!res.ok) { toast.error("Failed"); }
    else { toast.success("Influencer rejected"); router.refresh(); }
    setLoading(null);
  }

  return (
    <div className="py-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
            {influencer.displayName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{influencer.displayName}</p>
          <p className="text-xs text-gray-500">
            {influencer.instagramHandle ? `@${influencer.instagramHandle}` : influencer.user.email}
            {influencer.city && ` · ${influencer.city}`}
          </p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {niches.slice(0, 3).map(n => (
              <Badge key={n} variant="outline" className="text-xs">{n}</Badge>
            ))}
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium">{formatFollowers(influencer.followerCount)}</p>
          <p className="text-xs text-gray-500">followers</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 ml-14 space-y-4 bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-700">Set Verified Metrics</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Followers</Label>
              <Input type="number" value={followers} onChange={e => setFollowers(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Engagement Rate (%)</Label>
              <Input type="number" step="0.1" value={engagement} onChange={e => setEngagement(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Virality Score (0-100)</Label>
              <Input type="number" min="0" max="100" value={virality} onChange={e => setVirality(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          {influencer.pricing.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Pricing set:</p>
              <div className="flex gap-2 flex-wrap">
                {influencer.pricing.map(p => (
                  <Badge key={p.tierType} variant="outline" className="text-xs capitalize">
                    {p.tierType}: ₹{p.priceInr.toLocaleString("en-IN")}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={!!loading}>
              {loading === "approve" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
              Approve & Verify
            </Button>
            <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={handleReject} disabled={!!loading}>
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
