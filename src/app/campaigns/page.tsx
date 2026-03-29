import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, Calendar, MapPin, Target, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";

export default async function CampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = session.user as any;
  if (user.userType !== "influencer") redirect("/");

  // Get influencer profile
  const influencerProfile = await prisma.influencerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!influencerProfile) redirect("/onboarding");

  // Fetch active campaigns with proposals from this influencer
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "active",
    },
    include: {
      brandProfile: {
        select: {
          companyName: true,
          isVerified: true,
        },
      },
      proposals: {
        where: {
          influencerProfileId: influencerProfile.id,
        },
        select: {
          id: true,
          status: true,
          proposedPrice: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Available Campaigns</h1>
        <p className="text-gray-500 text-sm mt-1">Browse campaigns that match your profile</p>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No campaigns available</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for new opportunities</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign: any) => {
            const hasProposal = campaign.proposals && campaign.proposals.length > 0;
            const proposalStatus = hasProposal ? campaign.proposals[0].status : null;

            return (
              <Card key={campaign.id} className="hover:border-purple-200 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                          {campaign.brandProfile.companyName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{campaign.title}</CardTitle>
                          {campaign.brandProfile.isVerified && (
                            <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{campaign.brandProfile.companyName}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-purple-700">{formatPrice(campaign.budget)}</div>
                      <div className="text-xs text-gray-500">Max Budget</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">{campaign.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {(campaign.targetNiches as string[]).slice(0, 3).map((niche) => (
                      <Badge key={niche} variant="outline" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        {niche}
                      </Badge>
                    ))}
                    {(campaign.targetNiches as string[]).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(campaign.targetNiches as string[]).length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                    {campaign.minFollowers && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {campaign.minFollowers.toLocaleString()}+ followers
                      </div>
                    )}
                    {campaign.targetCities && (campaign.targetCities as string[]).length > 0 && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {(campaign.targetCities as string[])[0]}
                        {(campaign.targetCities as string[]).length > 1 && ` +${(campaign.targetCities as string[]).length - 1}`}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Posted {new Date(campaign.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasProposal ? (
                      <>
                        {proposalStatus === "pending" && (
                          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Proposal Pending
                          </Badge>
                        )}
                        {proposalStatus === "accepted" && (
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            Proposal Accepted
                          </Badge>
                        )}
                        {proposalStatus === "rejected" && (
                          <Badge className="bg-red-50 text-red-700 border-red-200">
                            Proposal Rejected
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/campaigns/${campaign.id}`}>View Details</Link>
                        </Button>
                      </>
                    ) : (
                      <Button className="bg-purple-700 hover:bg-purple-800" size="sm" asChild>
                        <Link href={`/campaigns/${campaign.id}`}>
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Submit Proposal
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
