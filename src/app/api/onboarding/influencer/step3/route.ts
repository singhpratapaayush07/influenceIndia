import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const userId = session.user.id;
  const displayName = fd.get("displayName") as string;
  const bio = fd.get("bio") as string;
  const city = fd.get("city") as string;
  const niches = fd.getAll("niches") as string[];
  const languages = (fd.get("languages") as string)
    .split(",").map(l => l.trim()).filter(Boolean);

  await prisma.influencerProfile.update({
    where: { userId },
    data: {
      displayName,
      bio,
      city,
      niches,
      languages,
    },
  });
  return NextResponse.json({ success: true });
}
