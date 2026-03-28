"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateScore } from "@/lib/scoring";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).userType !== "admin") {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function verifyInfluencer(userId: string) {
  await requireAdmin();
  await prisma.influencerProfile.update({
    where: { userId },
    data: { isVerified: true },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function rejectInfluencer(userId: string) {
  await requireAdmin();
  await prisma.influencerProfile.update({
    where: { userId },
    data: { isVerified: false },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function verifyBrand(userId: string) {
  await requireAdmin();
  await prisma.brandProfile.update({
    where: { userId },
    data: { isVerified: true },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function updateInfluencerMetrics(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const followerCount = parseInt(formData.get("followerCount") as string) || 0;
  const engagementRate = parseFloat(formData.get("engagementRate") as string) || 0;
  const viralityScore = parseFloat(formData.get("viralityScore") as string) || 0;
  const overallScore = calculateScore(followerCount, engagementRate, viralityScore);

  await prisma.influencerProfile.update({
    where: { userId },
    data: { followerCount, engagementRate, viralityScore, overallScore },
  });

  revalidatePath("/admin");
  revalidatePath("/influencers");
  return { success: true };
}
