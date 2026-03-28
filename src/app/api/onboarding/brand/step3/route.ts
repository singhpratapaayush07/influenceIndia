import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const userId = session.user.id;
  const budgetRange = fd.get("budgetRange") as string;
  const targetNiches = fd.getAll("targetNiches") as string[];

  await prisma.brandProfile.update({
    where: { userId },
    data: { budgetRange, targetNiches },
  });
  return NextResponse.json({ success: true });
}
