import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateInfluencerPayout, PLATFORM_FEE_PERCENT } from "@/lib/escrow";

// POST /api/escrow/[id]/release — Brand approves delivery and releases funds
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const escrow = await prisma.escrowPayment.findUnique({
    where: { id: params.id },
  });

  if (!escrow) {
    return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
  }

  // Only brand or admin can release
  const userType = (session.user as any).userType;
  if (escrow.brandUserId !== session.user.id && userType !== "admin") {
    return NextResponse.json({ error: "Not authorized to release funds" }, { status: 403 });
  }

  if (escrow.status !== "held") {
    return NextResponse.json({ error: "Escrow must be in 'held' status to release" }, { status: 400 });
  }

  const influencerPayout = calculateInfluencerPayout(escrow.amountInr);

  // Update escrow and contact request status
  await prisma.$transaction([
    prisma.escrowPayment.update({
      where: { id: params.id },
      data: {
        status: "released",
        releasedAt: new Date(),
      },
    }),
    prisma.contactRequest.update({
      where: { id: escrow.contactRequestId },
      data: { status: "completed" },
    }),
  ]);

  // Notify both parties
  await prisma.message.create({
    data: {
      requestId: escrow.contactRequestId,
      senderId: escrow.brandUserId,
      receiverId: escrow.influencerUserId,
      content: `Payment released! INR ${influencerPayout.toLocaleString("en-IN")} will be transferred to the influencer (${PLATFORM_FEE_PERCENT}% platform fee deducted). Collaboration marked as completed.`,
    },
  });

  return NextResponse.json({
    success: true,
    status: "released",
    influencerPayout,
    platformFee: escrow.platformFeeInr,
  });
}
