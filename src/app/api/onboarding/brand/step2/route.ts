import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const userId = session.user.id;

  const existing = await prisma.brandProfile.findUnique({ where: { userId } });
  const data = {
    companyName: fd.get("companyName") as string,
    industry: (fd.get("industry") as string) || null,
    website: (fd.get("website") as string) || null,
    description: (fd.get("description") as string) || null,
    gstNumber: (fd.get("gstNumber") as string) || null,
  };

  if (existing) {
    await prisma.brandProfile.update({ where: { userId }, data });
  } else {
    await prisma.brandProfile.create({ data: { userId, ...data } });
  }
  return NextResponse.json({ success: true });
}
