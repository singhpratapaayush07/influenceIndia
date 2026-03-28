import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const userId = session.user.id;
  const instagramHandle = fd.get("instagramHandle") as string;
  const youtubeHandle = fd.get("youtubeHandle") as string;
  const tiktokHandle = fd.get("tiktokHandle") as string;
  const followerCount = parseInt(fd.get("followerCount") as string) || 0;

  const existing = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (existing) {
    await prisma.influencerProfile.update({
      where: { userId },
      data: { instagramHandle, youtubeHandle, tiktokHandle, followerCount },
    });
  } else {
    await prisma.influencerProfile.create({
      data: { userId, displayName: "", instagramHandle, youtubeHandle, tiktokHandle, followerCount },
    });
  }
  return NextResponse.json({ success: true });
}
