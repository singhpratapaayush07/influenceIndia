import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingBadge } from "@/components/influencer/RatingBadge";
import { formatFollowers } from "@/lib/scoring";
import { CheckCircle2, Clock, XCircle, Mail, Users, TrendingUp, ShieldCheck, AlertCircle } from "lucide-react";
import { RequestStatusButtons } from "@/components/influencer/RequestStatusButtons";

export default async function InfluencerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = session.user as any;
  if (user.userType !== "influencer") redirect("/");

  const [profile, requests] = await Promise.all([
    prisma.influencerProfile.findUnique({
      where: { userId: session.user.id },
      include: { pricing: { orderBy: { priceInr: "asc" } } },
    }),
    prisma.contactRequest.findMany({
      where: { influencerUserId: session.user.id },
      include: {
        brandProfile: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const niches: string[] = (profile?.niches as unknown as string[]) || [];
  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Influencer Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and collaboration requests</p>
      </div>

      {/* Verification Banner */}
      {profile && !profile.isVerified && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">Profile Under Review</p>
            <p className="text-sm text-yellow-700">Our team will verify your profile within 24-48 hours. You&apos;ll be visible to brands once approved.</p>
          </div>
        </div>
      )}
      {profile?.isVerified && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          <p className="font-medium text-green-800">Profile Verified – You&apos;re live on the marketplace!</p>
          <Button size="sm" variant="outline" className="ml-auto border-green-300 text-green-700" asChild>
            <Link href={`/influencers/${session.user.id}`}>View Public Profile</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-lg">
                    {profile?.displayName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{profile?.displayName || "Set up profile"}</p>
                  {profile?.instagramHandle && (
                    <p className="text-sm text-gray-500">@{profile.instagramHandle}</p>
                  )}
                </div>
              </div>
              {profile && (
                <>
                  <RatingBadge score={profile.overallScore} size="sm" />
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><Users className="h-3.5 w-3.5" />Followers</span>
                      <span className="font-medium">{formatFollowers(profile.followerCount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />Engagement</span>
                      <span className="font-medium">{profile.engagementRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Niches */}
          {niches.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Niches</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {niches.map(n => (
                  <Badge key={n} className="bg-purple-50 text-purple-700 border-purple-100 text-xs">{n}</Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pricing */}
          {profile?.pricing && profile.pricing.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Your Pricing</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {profile.pricing.map(p => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize">{p.tierType}</span>
                    <span className="font-medium text-purple-700">₹{p.priceInr.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Requests */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Collaboration Requests
                {pendingCount > 0 && (
                  <Badge className="bg-purple-700 text-white ml-2">{pendingCount} new</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-10">
                  <Mail className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No requests yet</p>
                  <p className="text-sm text-gray-400 mt-1">Brands will reach out once your profile is verified</p>
                </div>
              ) : (
                <div className="divide-y">
                  {requests.map(req => (
                    <div key={req.id} className="py-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                            {req.brandProfile.companyName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900">{req.brandProfile.companyName}</span>
                            {req.brandProfile.industry && (
                              <Badge variant="outline" className="text-xs">{req.brandProfile.industry}</Badge>
                            )}
                            {req.status === "pending" && (
                              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                            )}
                            {req.status === "accepted" && (
                              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>
                            )}
                            {req.status === "rejected" && (
                              <Badge className="bg-red-50 text-red-700 border-red-200 text-xs"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
                            )}
                          </div>
                          {req.tierType && <p className="text-xs text-purple-700 mt-0.5 capitalize">Requesting: {req.tierType}</p>}
                          <p className="text-sm text-gray-600 mt-1">{req.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString("en-IN")}</p>
                          {req.status === "pending" && (
                            <RequestStatusButtons requestId={req.id} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
