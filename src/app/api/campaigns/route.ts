import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/campaigns - List campaigns (filtered for influencers)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userType = (session.user as any).userType;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "active";

  try {
    if (userType === "influencer") {
      // Get influencer profile to filter matching campaigns
      const influencerProfile = await prisma.influencerProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!influencerProfile) {
        return NextResponse.json({ error: "Influencer profile not found" }, { status: 404 });
      }

      // Find campaigns that match influencer's profile
      const campaigns = await prisma.campaign.findMany({
        where: {
          status,
          OR: [
            { minFollowers: { lte: influencerProfile.followerCount } },
            { minFollowers: null },
          ],
          AND: [
            {
              OR: [
                { maxFollowers: { gte: influencerProfile.followerCount } },
                { maxFollowers: null },
              ],
            },
          ],
        },
        include: {
          brandProfile: {
            select: {
              companyName: true,
              logoUrl: true,
              isVerified: true,
            },
          },
          proposals: {
            where: { influencerProfileId: influencerProfile.id },
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Filter by niche overlap (if campaign has niche targets)
      const influencerNiches = influencerProfile.niches as string[];
      const filteredCampaigns = campaigns.filter((campaign) => {
        const targetNiches = campaign.targetNiches as string[];
        if (targetNiches.length === 0) return true;
        return targetNiches.some((niche) => influencerNiches.includes(niche));
      });

      return NextResponse.json(filteredCampaigns);
    } else if (userType === "brand") {
      // Brands see their own campaigns
      const brandProfile = await prisma.brandProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!brandProfile) {
        return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
      }

      const campaigns = await prisma.campaign.findMany({
        where: { brandProfileId: brandProfile.id, status },
        include: {
          brandProfile: {
            select: {
              companyName: true,
              logoUrl: true,
              isVerified: true,
            },
          },
          proposals: {
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(campaigns);
    } else {
      return NextResponse.json({ error: "Invalid user type" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

// POST /api/campaigns - Create a new campaign (brands only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userType = (session.user as any).userType;
  if (userType !== "brand") {
    return NextResponse.json({ error: "Only brands can create campaigns" }, { status: 403 });
  }

  try {
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!brandProfile) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      budget,
      targetNiches,
      targetCities,
      minFollowers,
      maxFollowers,
      contentTypes,
      expiresAt,
      status = "draft",
    } = body;

    // Validation
    if (!title?.trim() || !description?.trim() || !budget) {
      return NextResponse.json(
        { error: "Title, description, and budget are required" },
        { status: 400 }
      );
    }

    if (budget < 1000) {
      return NextResponse.json({ error: "Budget must be at least ₹1,000" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        brandProfileId: brandProfile.id,
        title,
        description,
        budget,
        targetNiches: targetNiches || [],
        targetCities: targetCities || [],
        minFollowers,
        maxFollowers,
        contentTypes: contentTypes || [],
        status,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        brandProfile: {
          select: {
            companyName: true,
            logoUrl: true,
            isVerified: true,
          },
        },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
