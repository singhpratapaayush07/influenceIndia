import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RatingBadge } from "@/components/influencer/RatingBadge";
import { PricingTiers } from "@/components/influencer/PricingTiers";
import { ContactForm } from "@/components/brand/ContactForm";
import { FavoriteButton } from "@/components/influencer/FavoriteButton";
import { auth } from "@/lib/auth";
import { formatFollowers, getScoreLabel } from "@/lib/scoring";
import { CheckCircle2, AtSign, Video, MapPin, Users, TrendingUp, Zap } from "lucide-react";

export default async function InfluencerProfilePage({ params }: { params: { id: string } }) {
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId: params.id },
    include: { pricing: { orderBy: { priceInr: "asc" } }, user: true },
  });

  if (!profile || !profile.isVerified) notFound();

  const session = await auth();
  const viewerType = (session?.user as any)?.userType;
  const niches: string[] = (profile.niches as unknown as string[]) || [];
  const languages: string[] = (profile.languages as unknown as string[]) || [];

  // Check if current user has favorited this influencer
  let isFavorited = false;
  if (session?.user?.id && viewerType === "brand") {
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (brandProfile) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          brandProfileId_influencerProfileId: {
            brandProfileId: brandProfile.id,
            influencerProfileId: profile.id,
          },
        },
      });
      isFavorited = !!favorite;
    }
  }

  const scoreBreakdown = {
    followers: Math.min((profile.followerCount / 1_000_000) * 40, 40),
    engagement: Math.min(profile.engagementRate * 4, 40),
    virality: (profile.viralityScore / 100) * 20,
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white border rounded-2xl p-6 text-center relative">
            <FavoriteButton influencerProfileId={profile.id} initialIsFavorited={isFavorited} />
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={profile.profilePictureUrl || undefined} />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-3xl font-bold">
                {profile.displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
              {profile.displayName}
              {profile.isVerified && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
            </h1>
            {profile.instagramHandle && (
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                <AtSign className="h-3.5 w-3.5 text-pink-500" />
                @{profile.instagramHandle}
              </p>
            )}
            {profile.city && (
              <p className="text-sm text-gray-400 flex items-center justify-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" />{profile.city}
              </p>
            )}
            <div className="mt-3">
              <RatingBadge score={profile.overallScore} size="lg" />
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-sm text-gray-700">Key Metrics</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-1.5"><Users className="h-4 w-4" /> Followers</span>
              <span className="font-semibold">{formatFollowers(profile.followerCount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Engagement</span>
              <span className="font-semibold">{profile.engagementRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-1.5"><Zap className="h-4 w-4" /> Virality</span>
              <span className="font-semibold">{profile.viralityScore.toFixed(0)}/100</span>
            </div>

            <Separator />
            <h3 className="text-xs font-medium text-gray-600 mb-2">Score Breakdown</h3>
            {[
              { label: "Followers", value: scoreBreakdown.followers, max: 40 },
              { label: "Engagement", value: scoreBreakdown.engagement, max: 40 },
              { label: "Virality", value: scoreBreakdown.virality, max: 20 },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{item.label}</span>
                  <span>{item.value.toFixed(1)}/{item.max}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Social Links */}
          {(profile.youtubeHandle || profile.tiktokHandle) && (
            <div className="bg-white border rounded-2xl p-5 space-y-2">
              <h2 className="font-semibold text-sm text-gray-700">Also on</h2>
              {profile.youtubeHandle && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-500" /> {profile.youtubeHandle}
                </p>
              )}
              {profile.tiktokHandle && (
                <p className="text-sm text-gray-600">🎵 @{profile.tiktokHandle}</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          {profile.bio && (
            <div className="bg-white border rounded-2xl p-6">
              <h2 className="font-semibold text-gray-800 mb-2">About</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Niches & Languages */}
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Content Niches</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {niches.map(niche => (
                <Badge key={niche} className="bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100">
                  {niche}
                </Badge>
              ))}
            </div>
            {languages.length > 0 && (
              <>
                <h3 className="font-medium text-sm text-gray-700 mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map(lang => (
                    <Badge key={lang} variant="outline" className="text-gray-600">{lang}</Badge>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Collaboration Pricing</h2>
            <PricingTiers pricing={profile.pricing} />
          </div>

          {/* Contact Form (brands only) */}
          {viewerType === "brand" && (
            <div className="bg-white border rounded-2xl p-6">
              <h2 className="font-semibold text-gray-800 mb-2">Send Collaboration Request</h2>
              <p className="text-sm text-gray-500 mb-4">
                Reach out to {profile.displayName} for a collaboration. They&apos;ll respond to your request within their dashboard.
              </p>
              <ContactForm
                influencerUserId={profile.userId}
                influencerName={profile.displayName}
                pricing={profile.pricing}
              />
            </div>
          )}

          {!session && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center">
              <p className="text-purple-800 font-medium mb-2">Want to collaborate?</p>
              <p className="text-sm text-purple-700 mb-4">Sign up as a brand to send collaboration requests.</p>
              <a href="/signup?type=brand" className="inline-flex items-center justify-center px-5 py-2 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-800">
                Sign up as a Brand
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
