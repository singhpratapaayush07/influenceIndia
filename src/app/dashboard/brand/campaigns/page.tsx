import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Calendar, Plus, Users } from "lucide-react";
import { formatPrice } from "@/lib/scoring";

export default async function BrandCampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = session.user as any;
  if (user.userType !== "brand") redirect("/");

  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!brandProfile) redirect("/onboarding");

  const campaigns = await prisma.campaign.findMany({
    where: { brandProfileId: brandProfile.id },
    include: {
      proposals: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const draftCampaigns = campaigns.filter((c) => c.status === "draft");
  const closedCampaigns = campaigns.filter((c) => c.status === "closed");

  const CampaignCard = ({ campaign }: { campaign: any }) => {
    const proposalCounts = {
      total: campaign.proposals.length,
      pending: campaign.proposals.filter((p: any) => p.status === "pending").length,
      accepted: campaign.proposals.filter((p: any) => p.status === "accepted").length,
    };

    return (
      <Card className="hover:border-purple-200 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{campaign.title}</CardTitle>
              <p className="text-sm text-gray-500 line-clamp-1 mt-1">{campaign.description}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="text-lg font-bold text-purple-700">{formatPrice(campaign.budget)}</div>
              <div className="text-xs text-gray-500">Budget</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {proposalCounts.total} proposals
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(campaign.createdAt).toLocaleDateString("en-IN")}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {proposalCounts.pending > 0 && (
              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {proposalCounts.pending} Pending
              </Badge>
            )}
            {proposalCounts.accepted > 0 && (
              <Badge className="bg-green-50 text-green-700 border-green-200">
                {proposalCounts.accepted} Accepted
              </Badge>
            )}
          </div>

          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href={`/dashboard/brand/campaigns/${campaign.id}`}>View Details & Proposals</Link>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your campaigns and review proposals</p>
        </div>
        <Button className="bg-purple-700 hover:bg-purple-800" asChild>
          <Link href="/dashboard/brand/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeCampaigns.length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({draftCampaigns.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedCampaigns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeCampaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No active campaigns</p>
                <p className="text-sm text-gray-400 mt-1">Create your first campaign to start receiving proposals</p>
                <Button className="mt-4 bg-purple-700 hover:bg-purple-800" asChild>
                  <Link href="/dashboard/brand/campaigns/new">Create Campaign</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          {draftCampaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-gray-500">No draft campaigns</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {draftCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          {closedCampaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-gray-500">No closed campaigns</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {closedCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
