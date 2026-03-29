import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/campaigns/[id]/proposals - Submit a proposal (influencer only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userType = (session.user as any).userType;
  if (userType !== "influencer") {
    return NextResponse.json({ error: "Only influencers can submit proposals" }, { status: 403 });
  }

  try {
    const influencerProfile = await prisma.influencerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!influencerProfile) {
      return NextResponse.json({ error: "Influencer profile not found" }, { status: 404 });
    }

    // Verify campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "active") {
      return NextResponse.json({ error: "Campaign is not accepting proposals" }, { status: 400 });
    }

    // Check if already submitted a proposal
    const existingProposal = await prisma.campaignProposal.findFirst({
      where: {
        campaignId: params.id,
        influencerProfileId: influencerProfile.id,
      },
    });

    if (existingProposal) {
      return NextResponse.json(
        { error: "You have already submitted a proposal for this campaign" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { proposedPrice, message, deliverables } = body;

    // Validation
    if (!proposedPrice || proposedPrice < 1000) {
      return NextResponse.json(
        { error: "Proposed price must be at least ₹1,000" },
        { status: 400 }
      );
    }

    if (proposedPrice > campaign.budget) {
      return NextResponse.json(
        { error: "Proposed price exceeds campaign budget" },
        { status: 400 }
      );
    }

    const proposal = await prisma.campaignProposal.create({
      data: {
        campaignId: params.id,
        influencerProfileId: influencerProfile.id,
        proposedPrice,
        message,
        deliverables,
      },
      include: {
        influencerProfile: {
          select: {
            displayName: true,
            profilePictureUrl: true,
            followerCount: true,
            overallScore: true,
          },
        },
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Error submitting proposal:", error);
    return NextResponse.json({ error: "Failed to submit proposal" }, { status: 500 });
  }
}
