import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.influencerProfile.findUnique({
    where: { userId: session.user.id },
    include: { pricing: { orderBy: { priceInr: "asc" } } },
  });

  if (!profile) return NextResponse.json({ profile: null });

  return NextResponse.json({
    profile: {
      ...profile,
      niches: JSON.parse(profile.niches as unknown as string || "[]"),
      languages: JSON.parse(profile.languages as unknown as string || "[]"),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    displayName, bio, city, instagramHandle, youtubeHandle, tiktokHandle,
    followerCount, languages, niches, pricing,
  } = body;

  if (!displayName?.trim()) return NextResponse.json({ error: "Display name required" }, { status: 400 });
  if (!niches?.length) return NextResponse.json({ error: "Select at least one niche" }, { status: 400 });

  await prisma.influencerProfile.update({
    where: { userId: session.user.id },
    data: {
      displayName: displayName.trim(),
      bio: bio?.trim() || null,
      city: city || null,
      instagramHandle: instagramHandle?.trim() || null,
      youtubeHandle: youtubeHandle?.trim() || null,
      tiktokHandle: tiktokHandle?.trim() || null,
      followerCount: followerCount || 0,
      niches: JSON.stringify(niches),
      languages: JSON.stringify(languages),
    },
  });

  // Update pricing — delete existing and recreate
  if (pricing) {
    await prisma.influencerPricing.deleteMany({ where: { influencerId: session.user.id } });
    const tierTypes = ["story", "post", "reel", "video"];
    const pricingRows = tierTypes
      .filter(t => parseInt(pricing[t]?.price) > 0)
      .map(tierType => ({
        influencerId: session.user.id,
        tierType,
        priceInr: parseInt(pricing[tierType].price),
        description: pricing[tierType].desc || null,
        turnaroundDays: parseInt(pricing[tierType].days) || 7,
      }));
    if (pricingRows.length > 0) {
      await prisma.influencerPricing.createMany({ data: pricingRows });
    }
  }

  return NextResponse.json({ success: true });
}
