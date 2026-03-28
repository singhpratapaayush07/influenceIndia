import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userType = (session.user as any).userType;
  if (userType !== "brand") return NextResponse.json({ error: "Only brands can send requests" }, { status: 403 });

  const fd = await req.formData();
  const influencerUserId = fd.get("influencerUserId") as string;
  const tierType = fd.get("tierType") as string;
  const message = fd.get("message") as string;

  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const brandProfile = await prisma.brandProfile.findUnique({ where: { userId: session.user.id } });
  const influencerProfile = await prisma.influencerProfile.findUnique({ where: { userId: influencerUserId } });

  if (!brandProfile || !influencerProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const existing = await prisma.contactRequest.findFirst({
    where: { brandUserId: session.user.id, influencerUserId, status: "pending" },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have a pending request to this influencer" }, { status: 409 });
  }

  await prisma.contactRequest.create({
    data: {
      brandUserId: session.user.id,
      influencerUserId,
      brandProfileId: brandProfile.id,
      influencerProfileId: influencerProfile.id,
      tierType,
      message,
    },
  });

  return NextResponse.json({ success: true });
}
