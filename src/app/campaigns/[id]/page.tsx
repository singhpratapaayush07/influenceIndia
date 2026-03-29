import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, CheckCircle2, MapPin, Target, TrendingUp, Users } from "lucide-react";
import { formatPrice } from "@/lib/scoring";
import { ProposalForm } from "@/components/campaign/ProposalForm";

export default async function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = session.user as any;
  if (user.userType !== "influencer") redirect("/");

  const influencerProfile = await prisma.influencerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!influencerProfile) redirect("/onboarding");

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      brandProfile: {
        select: {
          companyName: true,
          logoUrl: true,
          isVerified: true,
          description: true,
        },
      },
      proposals: {
        where: { influencerProfileId: influencerProfile.id },
        include: {
          influencerProfile: {
            select: {
              displayName: true,
              profilePictureUrl: true,
              followerCount: true,
              overallScore: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) notFound();

  const hasProposal = campaign.proposals.length > 0;
  const proposal = hasProposal ? campaign.proposals[0] : null;

  const contentTypes = campaign.contentTypes as string[];
  const targetNiches = campaign.targetNiches as string[];
  const targetCities = campaign.targetCities as string[] | null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/campaigns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold text-xl">
              {campaign.brandProfile.companyName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
              {campaign.brandProfile.isVerified && (
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <p className="text-gray-600">{campaign.brandProfile.companyName}</p>
            {campaign.brandProfile.description && (
              <p className="text-sm text-gray-500 mt-1">{campaign.brandProfile.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-700">{formatPrice(campaign.budget)}</div>
            <div className="text-sm text-gray-500">Max Budget</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Content Types Required</h3>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.length > 0 ? (
                    contentTypes.map((type) => (
                      <Badge key={type} variant="outline" className="capitalize">
                        {type}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Not specified</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {hasProposal && proposal ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Proposal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  {proposal.status === "pending" && (
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>
                  )}
                  {proposal.status === "accepted" && (
                    <Badge className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>
                  )}
                  {proposal.status === "rejected" && (
                    <Badge className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Your Price:</span>
                  <span className="text-lg font-bold text-purple-700">{formatPrice(proposal.proposedPrice)}</span>
                </div>
                {proposal.deliverables && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Deliverables:</span>
                    <p className="text-sm text-gray-600 mt-1">{proposal.deliverables}</p>
                  </div>
                )}
                {proposal.message && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Your Message:</span>
                    <p className="text-sm text-gray-600 mt-1">{proposal.message}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Submitted on {new Date(proposal.createdAt).toLocaleDateString("en-IN")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <ProposalForm campaignId={campaign.id} maxBudget={campaign.budget} />
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {targetNiches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Target className="h-4 w-4" />
                    Target Niches
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {targetNiches.map((niche) => (
                      <Badge key={niche} variant="outline" className="text-xs">
                        {niche}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(campaign.minFollowers || campaign.maxFollowers) && (
                <div>
                  <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                    <Users className="h-4 w-4" />
                    Follower Range
                  </div>
                  <p className="text-gray-600">
                    {campaign.minFollowers ? `${campaign.minFollowers.toLocaleString()}+` : "Any"}
                    {campaign.maxFollowers ? ` - ${campaign.maxFollowers.toLocaleString()}` : ""}
                  </p>
                </div>
              )}

              {targetCities && targetCities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                    <MapPin className="h-4 w-4" />
                    Target Cities
                  </div>
                  <p className="text-gray-600">{targetCities.join(", ")}</p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                  <Calendar className="h-4 w-4" />
                  Posted
                </div>
                <p className="text-gray-600">{new Date(campaign.createdAt).toLocaleDateString("en-IN")}</p>
              </div>

              {campaign.expiresAt && (
                <div>
                  <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                    <Calendar className="h-4 w-4" />
                    Expires
                  </div>
                  <p className="text-gray-600">{new Date(campaign.expiresAt).toLocaleDateString("en-IN")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
