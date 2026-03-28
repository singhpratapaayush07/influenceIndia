import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TIERS = ["story", "post", "reel", "video"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const userId = session.user.id;

  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  await prisma.influencerPricing.deleteMany({ where: { influencerId: profile.id } });

  for (const tier of TIERS) {
    const price = parseInt(fd.get(`price_${tier}`) as string);
    if (price && price > 0) {
      await prisma.influencerPricing.create({
        data: {
          influencerId: profile.id,
          tierType: tier,
          priceInr: price,
          description: (fd.get(`desc_${tier}`) as string) || null,
          turnaroundDays: parseInt(fd.get(`days_${tier}`) as string) || 7,
        },
      });
    }
  }
  return NextResponse.json({ success: true });
}
