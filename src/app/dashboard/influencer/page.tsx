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
import {
  CheckCircle2, Clock, XCircle, Mail, Users, TrendingUp,
  ShieldCheck, Pencil, ExternalLink, Star, IndianRupee,
} from "lucide-react";
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
      include: { brandProfile: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const niches: string[] = (profile?.niches as unknown as string[]) || [];
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const acceptedCount = requests.filter(r => r.status === "accepted").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-6">

          {/* LEFT SIDEBAR */}
          <div className="w-72 flex-shrink-0 space-y-4">

            {/* Profile Card */}
            <Card className="overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-purple-600 to-pink-500" />
              <CardContent className="pt-0 pb-5 px-5">
                <div className="-mt-8 mb-4">
                  <Avatar className="h-16 w-16 border-4 border-white shadow">
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-2xl">
                      {profile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <p className="font-bold text-gray-900 text-lg leading-tight">
                  {profile?.displayName || "Your Name"}
                </p>
                {profile?.instagramHandle && (
                  <p className="text-sm text-gray-500 mt-0.5">@{profile.instagramHandle}</p>
                )}
                {profile?.city && (
                  <p className="text-xs text-gray-400 mt-0.5">{profile.city}</p>
                )}

                {/* Verification status */}
                <div className="mt-3">
                  {!profile ? (
                    <Badge className="bg-gray-100 text-gray-600 text-xs">No profile yet</Badge>
                  ) : profile.isVerified ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs gap-1">
                      <Clock className="h-3 w-3" /> Under Review
                    </Badge>
                  )}
                </div>

                {/* Score */}
                {profile && (
                  <div className="mt-4">
                    <RatingBadge score={profile.overallScore} size="sm" />
                  </div>
                )}

                {/* Stats */}
                {profile && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> Followers
                      </span>
                      <span className="font-semibold text-gray-800">{formatFollowers(profile.followerCount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" /> Engagement
                      </span>
                      <span className="font-semibold text-gray-800">{profile.engagementRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5" /> Requests
                      </span>
                      <span className="font-semibold text-gray-800">{requests.length}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 space-y-2">
                  <Button className="w-full bg-purple-700 hover:bg-purple-800 gap-2" asChild>
                    <Link href="/dashboard/influencer/edit-profile">
                      <Pencil className="h-4 w-4" /> Edit Profile
                    </Link>
                  </Button>
                  {profile?.isVerified && (
                    <Button variant="outline" className="w-full gap-2 text-sm" asChild>
                      <Link href={`/influencers/${session.user.id}`}>
                        <ExternalLink className="h-3.5 w-3.5" /> View Public Profile
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Niches */}
            {niches.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-sm text-gray-700">Niches</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4 flex flex-wrap gap-1.5">
                  {niches.map(n => (
                    <Badge key={n} className="bg-purple-50 text-purple-700 border-purple-100 text-xs">{n}</Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            {profile?.pricing && profile.pricing.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-sm text-gray-700">Your Pricing</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4 space-y-2">
                  {profile.pricing.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 capitalize">{p.tierType}</span>
                      <span className="font-semibold text-purple-700 flex items-center gap-0.5">
                        <IndianRupee className="h-3.5 w-3.5" />{p.priceInr.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-w-0">

            {/* Verification Banner */}
            {profile && !profile.isVerified && (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">Profile Under Review</p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Our team will verify your profile within 24–48 hours. You&apos;ll be visible to brands once approved.
                  </p>
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <Card>
                <CardContent className="pt-4 pb-4 px-5">
                  <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Requests</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 px-5">
                  <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 px-5">
                  <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Accepted</p>
                </CardContent>
              </Card>
            </div>

            {/* Requests */}
            <Card>
              <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-5 w-5 text-purple-600" />
                  Collaboration Requests
                  {pendingCount > 0 && (
                    <Badge className="bg-purple-700 text-white text-xs">{pendingCount} new</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {requests.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="h-14 w-14 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-7 w-7 text-purple-300" />
                    </div>
                    <p className="font-medium text-gray-700">No requests yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {profile?.isVerified
                        ? "Brands will start reaching out once they discover your profile"
                        : "Requests will appear here once your profile is verified"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {requests.map(req => (
                      <div key={req.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                              {req.brandProfile.companyName[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{req.brandProfile.companyName}</span>
                              {req.brandProfile.industry && (
                                <Badge variant="outline" className="text-xs">{req.brandProfile.industry}</Badge>
                              )}
                              {req.status === "pending" && (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs gap-1 ml-auto">
                                  <Clock className="h-3 w-3" /> Pending
                                </Badge>
                              )}
                              {req.status === "accepted" && (
                                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs gap-1 ml-auto">
                                  <CheckCircle2 className="h-3 w-3" /> Accepted
                                </Badge>
                              )}
                              {req.status === "rejected" && (
                                <Badge className="bg-red-50 text-red-700 border-red-200 text-xs gap-1 ml-auto">
                                  <XCircle className="h-3 w-3" /> Rejected
                                </Badge>
                              )}
                            </div>
                            {req.tierType && (
                              <p className="text-xs text-purple-600 mt-1 capitalize font-medium">
                                Requesting: {req.tierType}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{req.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            {req.status === "pending" && (
                              <div className="mt-3">
                                <RequestStatusButtons requestId={req.id} />
                              </div>
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
    </div>
  );
}
