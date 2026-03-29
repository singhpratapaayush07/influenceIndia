import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/proposals/[id] - Update proposal status (brand only)
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
    return NextResponse.json({ error: "Only brands can update proposal status" }, { status: 403 });
  }

  try {
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!brandProfile) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
    }

    const proposal = await prisma.campaignProposal.findUnique({
      where: { id: params.id },
      include: {
        campaign: true,
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Verify campaign ownership
    if (proposal.campaign.brandProfileId !== brandProfile.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this proposal" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedProposal = await prisma.campaignProposal.update({
      where: { id: params.id },
      data: { status },
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

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 });
  }
}
