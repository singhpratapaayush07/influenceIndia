import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, MapPin, Target, TrendingUp, Users } from "lucide-react";
import { formatPrice } from "@/lib/scoring";
import { ProposalActions } from "@/components/campaign/ProposalActions";

export default async function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = session.user as any;
  if (user.userType !== "brand") redirect("/");

  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!brandProfile) redirect("/onboarding");

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      proposals: {
        include: {
          influencerProfile: {
            select: {
              displayName: true,
              profilePictureUrl: true,
              followerCount: true,
              overallScore: true,
              userId: true,
              engagementRate: true,
              niches: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!campaign) notFound();

  // Verify ownership
  if (campaign.brandProfileId !== brandProfile.id) {
    redirect("/dashboard/brand/campaigns");
  }

  const contentTypes = campaign.contentTypes as string[];
  const targetNiches = campaign.targetNiches as string[];
  const targetCities = campaign.targetCities as string[] | null;

  const proposalCounts = {
    total: campaign.proposals.length,
    pending: campaign.proposals.filter((p) => p.status === "pending").length,
    accepted: campaign.proposals.filter((p) => p.status === "accepted").length,
    rejected: campaign.proposals.filter((p) => p.status === "rejected").length,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard/brand/campaigns">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Link>
      </Button>

      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {proposalCounts.total} proposals received
            </p>
          </div>
          <Badge
            className={
              campaign.status === "active"
                ? "bg-green-50 text-green-700 border-green-200"
                : campaign.status === "draft"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }
          >
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 text-center">
              <div className="text-2xl font-bold text-purple-700">{proposalCounts.total}</div>
              <div className="text-sm text-gray-500 mt-1">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <div className="text-2xl font-bold text-yellow-700">{proposalCounts.pending}</div>
              <div className="text-sm text-gray-500 mt-1">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <div className="text-2xl font-bold text-green-700">{proposalCounts.accepted}</div>
              <div className="text-sm text-gray-500 mt-1">Accepted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <div className="text-2xl font-bold text-red-700">{proposalCounts.rejected}</div>
              <div className="text-sm text-gray-500 mt-1">Rejected</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.proposals.length === 0 ? (
                <div className="text-center py-10">
                  <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No proposals yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Influencers will submit proposals as they discover your campaign
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {campaign.proposals.map((proposal) => (
                    <div key={proposal.id} className="py-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                            {proposal.influencerProfile.displayName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <Link
                              href={`/influencers/${proposal.influencerProfile.userId}`}
                              className="font-medium text-gray-900 hover:text-purple-700"
                            >
                              {proposal.influencerProfile.displayName}
                            </Link>
                            <div className="text-lg font-bold text-purple-700">
                              {formatPrice(proposal.proposedPrice)}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <span>
                              {proposal.influencerProfile.followerCount.toLocaleString()} followers
                            </span>
                            <span>
                              {(proposal.influencerProfile.engagementRate * 100).toFixed(1)}% engagement
                            </span>
                            <span>Score: {proposal.influencerProfile.overallScore.toFixed(0)}/100</span>
                          </div>

                          {proposal.deliverables && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-700">Deliverables: </span>
                              <span className="text-xs text-gray-600">{proposal.deliverables}</span>
                            </div>
                          )}

                          {proposal.message && (
                            <p className="text-sm text-gray-700 mb-2">{proposal.message}</p>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400">
                              Submitted {new Date(proposal.createdAt).toLocaleDateString("en-IN")}
                            </p>
                            <div className="flex items-center gap-2">
                              {proposal.status === "pending" && (
                                <ProposalActions
                                  proposalId={proposal.id}
                                  currentStatus={proposal.status}
                                />
                              )}
                              {proposal.status === "accepted" && (
                                <Badge className="bg-green-50 text-green-700 border-green-200">
                                  Accepted
                                </Badge>
                              )}
                              {proposal.status === "rejected" && (
                                <Badge className="bg-red-50 text-red-700 border-red-200">
                                  Rejected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-gray-700 font-medium mb-1">Budget</div>
                <div className="text-lg font-bold text-purple-700">{formatPrice(campaign.budget)}</div>
              </div>

              <div className="border-t pt-3">
                <div className="text-gray-700 font-medium mb-2">Description</div>
                <p className="text-gray-600 whitespace-pre-wrap">{campaign.description}</p>
              </div>

              {contentTypes.length > 0 && (
                <div className="border-t pt-3">
                  <div className="text-gray-700 font-medium mb-2">Content Types</div>
                  <div className="flex flex-wrap gap-1">
                    {contentTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs capitalize">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {targetNiches.length > 0 && (
                <div className="border-t pt-3">
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
                <div className="border-t pt-3">
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
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                    <MapPin className="h-4 w-4" />
                    Target Cities
                  </div>
                  <p className="text-gray-600">{targetCities.join(", ")}</p>
                </div>
              )}

              <div className="border-t pt-3">
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
                  <p className="text-gray-600">
                    {new Date(campaign.expiresAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
