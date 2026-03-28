import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminInfluencerRow } from "@/components/admin/AdminInfluencerRow";
import { AdminBrandRow } from "@/components/admin/AdminBrandRow";
import { formatFollowers } from "@/lib/scoring";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).userType !== "admin") redirect("/");

  const [pendingInfluencers, verifiedInfluencers, pendingBrands, allStats] = await Promise.all([
    prisma.influencerProfile.findMany({
      where: { isVerified: false, user: { onboardingComplete: true } },
      include: { user: true, pricing: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.influencerProfile.findMany({
      where: { isVerified: true },
      include: { pricing: true },
      orderBy: { overallScore: "desc" },
      take: 20,
    }),
    prisma.brandProfile.findMany({
      where: { isVerified: false, user: { onboardingComplete: true } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.$transaction([
      prisma.user.count(),
      prisma.influencerProfile.count({ where: { isVerified: true } }),
      prisma.brandProfile.count({ where: { isVerified: true } }),
      prisma.contactRequest.count(),
    ]),
  ]);

  const [totalUsers, verifiedInfluencerCount, verifiedBrandCount, totalRequests] = allStats;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 text-sm">Manage influencer and brand verifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: totalUsers, color: "text-blue-700" },
          { label: "Verified Influencers", value: verifiedInfluencerCount, color: "text-green-700" },
          { label: "Verified Brands", value: verifiedBrandCount, color: "text-purple-700" },
          { label: "Total Requests", value: totalRequests, color: "text-orange-700" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-5 text-center">
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending-influencers">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending-influencers">
            Pending Influencers
            {pendingInfluencers.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">{pendingInfluencers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending-brands">
            Pending Brands
            {pendingBrands.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">{pendingBrands.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="verified-influencers">Verified Influencers</TabsTrigger>
        </TabsList>

        <TabsContent value="pending-influencers">
          <Card>
            <CardHeader><CardTitle className="text-base">Pending Review ({pendingInfluencers.length})</CardTitle></CardHeader>
            <CardContent>
              {pendingInfluencers.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No pending influencers 🎉</p>
              ) : (
                <div className="divide-y">
                  {pendingInfluencers.map(inf => (
                    <AdminInfluencerRow key={inf.id} influencer={inf} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-brands">
          <Card>
            <CardHeader><CardTitle className="text-base">Pending Brands ({pendingBrands.length})</CardTitle></CardHeader>
            <CardContent>
              {pendingBrands.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No pending brands 🎉</p>
              ) : (
                <div className="divide-y">
                  {pendingBrands.map(brand => (
                    <AdminBrandRow key={brand.id} brand={brand} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified-influencers">
          <Card>
            <CardHeader><CardTitle className="text-base">Live Influencers (Top {verifiedInfluencers.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y">
                {verifiedInfluencers.map((inf, i) => {
                  const niches: string[] = (inf.niches as unknown as string[]) || [];
                  return (
                    <div key={inf.id} className="py-4 flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                          {inf.displayName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{inf.displayName}</p>
                        <p className="text-xs text-gray-500">{inf.instagramHandle ? `@${inf.instagramHandle}` : ""} · {formatFollowers(inf.followerCount)} followers</p>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {niches.slice(0, 2).map(n => <Badge key={n} variant="outline" className="text-xs">{n}</Badge>)}
                      </div>
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200">{inf.overallScore.toFixed(0)}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
