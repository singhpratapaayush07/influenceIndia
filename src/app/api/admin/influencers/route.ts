import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/scoring";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId, action, followerCount, engagementRate, viralityScore } = body;

  if (action === "verify") {
    const score = calculateScore(
      followerCount || 0,
      engagementRate || 0,
      viralityScore || 0
    );
    await prisma.influencerProfile.update({
      where: { userId },
      data: {
        isVerified: true,
        followerCount: followerCount || 0,
        engagementRate: engagementRate || 0,
        viralityScore: viralityScore || 0,
        overallScore: score,
      },
    });
  } else if (action === "reject") {
    await prisma.influencerProfile.update({
      where: { userId },
      data: { isVerified: false },
    });
  }

  return NextResponse.json({ success: true });
}
