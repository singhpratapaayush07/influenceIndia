"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateScore } from "@/lib/scoring";
import { redirect } from "next/navigation";

// ─── Influencer onboarding ────────────────────────────────────────────────────

export async function saveInfluencerStep2(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const userId = session.user.id;
  const instagramHandle = formData.get("instagramHandle") as string;
  const youtubeHandle = formData.get("youtubeHandle") as string;
  const tiktokHandle = formData.get("tiktokHandle") as string;
  const followerCount = parseInt(formData.get("followerCount") as string) || 0;

  const existing = await prisma.influencerProfile.findUnique({ where: { userId } });

  if (existing) {
    await prisma.influencerProfile.update({
      where: { userId },
      data: { instagramHandle, youtubeHandle, tiktokHandle, followerCount },
    });
  } else {
    await prisma.influencerProfile.create({
      data: {
        userId,
        displayName: "",
        instagramHandle,
        youtubeHandle,
        tiktokHandle,
        followerCount,
      },
    });
  }
  redirect("/onboarding/influencer/3");
}

export async function saveInfluencerStep3(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const userId = session.user.id;
  const displayName = formData.get("displayName") as string;
  const bio = formData.get("bio") as string;
  const city = formData.get("city") as string;
  const niches = formData.getAll("niches") as string[];
  const languages = (formData.get("languages") as string)
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

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
  redirect("/onboarding/influencer/4");
}

export async function saveInfluencerStep4(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const userId = session.user.id;
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) return { error: "Profile not found" };

  // Delete existing pricing and recreate
  await prisma.influencerPricing.deleteMany({ where: { influencerId: profile.id } });

  const tiers = ["story", "post", "reel", "video"];
  for (const tier of tiers) {
    const price = parseInt(formData.get(`price_${tier}`) as string);
    if (price && price > 0) {
      await prisma.influencerPricing.create({
        data: {
          influencerId: profile.id,
          tierType: tier,
          priceInr: price,
          description: formData.get(`desc_${tier}`) as string || null,
          turnaroundDays: parseInt(formData.get(`days_${tier}`) as string) || 7,
        },
      });
    }
  }
  redirect("/onboarding/influencer/5");
}

export async function submitInfluencerOnboarding() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingComplete: true },
  });
  redirect("/dashboard/influencer");
}

// ─── Brand onboarding ─────────────────────────────────────────────────────────

export async function saveBrandStep2(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const userId = session.user.id;
  const companyName = formData.get("companyName") as string;
  const industry = formData.get("industry") as string;
  const website = formData.get("website") as string;
  const description = formData.get("description") as string;
  const gstNumber = formData.get("gstNumber") as string;

  const existing = await prisma.brandProfile.findUnique({ where: { userId } });
  if (existing) {
    await prisma.brandProfile.update({
      where: { userId },
      data: { companyName, industry, website, description, gstNumber },
    });
  } else {
    await prisma.brandProfile.create({
      data: { userId, companyName, industry, website, description, gstNumber },
    });
  }
  redirect("/onboarding/brand/2");
}

export async function saveBrandStep3(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const userId = session.user.id;
  const budgetRange = formData.get("budgetRange") as string;
  const targetNiches = formData.getAll("targetNiches") as string[];

  await prisma.brandProfile.update({
    where: { userId },
    data: { budgetRange, targetNiches },
  });
  redirect("/onboarding/brand/3");
}

export async function submitBrandOnboarding() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingComplete: true },
  });
  redirect("/dashboard/brand");
}
