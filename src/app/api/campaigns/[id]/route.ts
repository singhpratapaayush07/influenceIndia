import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/campaigns/[id] - Get campaign details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        brandProfile: {
          select: {
            companyName: true,
            logoUrl: true,
            isVerified: true,
            description: true,
          },
        },
        proposals: {
          include: {
            influencerProfile: {
              select: {
                displayName: true,
                profilePictureUrl: true,
                followerCount: true,
                overallScore: true,
                userId: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Brands can see all proposals, influencers only see their own
    const userType = (session.user as any).userType;
    if (userType === "influencer") {
      const influencerProfile = await prisma.influencerProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (influencerProfile) {
        campaign.proposals = campaign.proposals.filter(
          (p) => p.influencerProfileId === influencerProfile.id
        );
      }
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

// PATCH /api/campaigns/[id] - Update campaign (brand only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userType = (session.user as any).userType;
  if (userType !== "brand") {
    return NextResponse.json({ error: "Only brands can update campaigns" }, { status: 403 });
  }

  try {
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!brandProfile) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
    }

    // Verify campaign ownership
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (existingCampaign.brandProfileId !== brandProfile.id) {
      return NextResponse.json({ error: "Unauthorized to update this campaign" }, { status: 403 });
    }

    const body = await req.json();
    const updateData: any = {};

    // Only allow updating certain fields
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.targetNiches !== undefined) updateData.targetNiches = body.targetNiches;
    if (body.targetCities !== undefined) updateData.targetCities = body.targetCities;
    if (body.minFollowers !== undefined) updateData.minFollowers = body.minFollowers;
    if (body.maxFollowers !== undefined) updateData.maxFollowers = body.maxFollowers;
    if (body.contentTypes !== undefined) updateData.contentTypes = body.contentTypes;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id] - Delete campaign (brand only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userType = (session.user as any).userType;
  if (userType !== "brand") {
    return NextResponse.json({ error: "Only brands can delete campaigns" }, { status: 403 });
  }

  try {
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!brandProfile) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
    }

    // Verify campaign ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.brandProfileId !== brandProfile.id) {
      return NextResponse.json({ error: "Unauthorized to delete this campaign" }, { status: 403 });
    }

    await prisma.campaign.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
