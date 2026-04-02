import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle2, Clock, XCircle, TrendingUp, Heart, Briefcase, MessageSquare } from "lucide-react";
import { formatPrice } from "@/lib/scoring";

export default async function BrandDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = session.user as any;
  if (user.userType !== "brand") redirect("/");

  const [brandProfile, requests] = await Promise.all([
    prisma.brandProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.contactRequest.findMany({
      where: { brandUserId: session.user.id },
      include: {
        influencerProfile: {
          include: { pricing: { take: 1, orderBy: { priceInr: "asc" } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const statusCounts = {
    pending: requests.filter(r => r.status === "pending").length,
    accepted: requests.filter(r => r.status === "accepted").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const statusBadge = (status: string) => {
    if (status === "accepted") return <Badge className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>;
    if (status === "rejected") return <Badge className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {brandProfile?.companyName || user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/brand/favorites"><Heart className="h-4 w-4 mr-2" />Favorites</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/brand/campaigns"><Briefcase className="h-4 w-4 mr-2" />My Campaigns</Link>
          </Button>
          <Button className="bg-purple-700 hover:bg-purple-800" asChild>
            <Link href="/influencers"><Search className="h-4 w-4 mr-2" />Find Influencers</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pending", value: statusCounts.pending, color: "text-yellow-700" },
          { label: "Accepted", value: statusCounts.accepted, color: "text-green-700" },
          { label: "Rejected", value: statusCounts.rejected, color: "text-red-700" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-5 text-center">
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Status */}
      {brandProfile && !brandProfile.isVerified && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">Profile Under Review</p>
            <p className="text-sm text-yellow-700">Our team will verify your brand within 24-48 hours.</p>
          </div>
        </div>
      )}

      {/* Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collaboration Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-10">
              <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Browse influencers and send your first collaboration request</p>
              <Button className="mt-4 bg-purple-700 hover:bg-purple-800" asChild>
                <Link href="/influencers">Browse Influencers</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {requests.map(req => {
                const isClickable = ["accepted", "in_progress", "completed"].includes(req.status);
                const Wrapper = isClickable ? Link : "div";
                const wrapperProps = isClickable ? { href: `/dashboard/messages/${req.id}` } : {};

                return (
                  <Wrapper
                    key={req.id}
                    {...(wrapperProps as any)}
                    className={`block py-4 flex items-center gap-4 ${isClickable ? "cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors" : ""}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                        {req.influencerProfile.displayName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {req.influencerProfile.displayName}
                        </span>
                        {statusBadge(req.status)}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{req.message}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">
                          {req.tierType && <span className="capitalize">{req.tierType} · </span>}
                          {new Date(req.createdAt).toLocaleDateString("en-IN")}
                        </p>
                        {isClickable && (
                          <span className="text-xs text-purple-600 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> Messages
                          </span>
                        )}
                      </div>
                    </div>
                    {req.influencerProfile.pricing[0] && (
                      <span className="text-sm font-medium text-purple-700">
                        {formatPrice(req.influencerProfile.pricing[0].priceInr)}
                      </span>
                    )}
                  </Wrapper>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
