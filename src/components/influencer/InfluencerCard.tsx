import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RatingBadge } from "./RatingBadge";
import { formatFollowers, formatPrice } from "@/lib/scoring";
import { MapPin, AtSign, Users, CheckCircle2 } from "lucide-react";
import type { InfluencerWithPricing } from "@/types";

interface InfluencerCardProps {
  influencer: InfluencerWithPricing;
}

export function InfluencerCard({ influencer }: InfluencerCardProps) {
  const niches: string[] = (influencer.niches as unknown as string[]) || [];
  const minPrice = influencer.pricing.length > 0
    ? Math.min(...influencer.pricing.map(p => p.priceInr))
    : null;

  return (
    <Link href={`/influencers/${influencer.userId}`}>
      <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-14 w-14 flex-shrink-0">
              <AvatarImage src={influencer.profilePictureUrl || undefined} />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-lg font-bold">
                {influencer.displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-gray-900 truncate">{influencer.displayName}</h3>
                {influencer.isVerified && (
                  <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              {influencer.instagramHandle && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <AtSign className="h-3 w-3" />
                  @{influencer.instagramHandle}
                </p>
              )}
              {influencer.city && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {influencer.city}
                </p>
              )}
            </div>
            <RatingBadge score={influencer.overallScore} showLabel={false} size="sm" />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <strong>{formatFollowers(influencer.followerCount)}</strong>
            </span>
            <span>
              <strong>{influencer.engagementRate.toFixed(1)}%</strong> engagement
            </span>
          </div>

          {/* Niches */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {niches.slice(0, 3).map(niche => (
              <Badge key={niche} variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-100">
                {niche}
              </Badge>
            ))}
            {niches.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-500">
                +{niches.length - 3}
              </Badge>
            )}
          </div>

          {/* Pricing */}
          {minPrice !== null && (
            <div className="text-sm font-medium text-gray-700 border-t pt-2.5 mt-2.5">
              Starting from <span className="text-purple-700 font-bold">{formatPrice(minPrice)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
