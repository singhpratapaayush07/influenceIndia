import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskContactInfo } from "@/lib/content-filter";

// POST /api/escrow/[id]/deliver — Influencer submits proof of delivery
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deliverableProof } = await req.json();

  if (!deliverableProof?.trim()) {
    return NextResponse.json({ error: "Proof of delivery is required" }, { status: 400 });
  }

  const escrow = await prisma.escrowPayment.findUnique({
    where: { id: params.id },
  });

  if (!escrow) {
    return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
  }

  if (escrow.influencerUserId !== session.user.id) {
    return NextResponse.json({ error: "Only the influencer can submit delivery proof" }, { status: 403 });
  }

  if (escrow.status !== "held" && escrow.status !== "disputed") {
    return NextResponse.json({ error: "Escrow must be in 'held' or 'disputed' status to submit delivery" }, { status: 400 });
  }

  const isResubmission = escrow.status === "disputed";

  // Filter contact info from proof text (but allow URLs since they might be content links)
  const filteredProof = maskContactInfo(deliverableProof.trim());

  await prisma.escrowPayment.update({
    where: { id: params.id },
    data: {
      deliverableProof: filteredProof,
      // Move back to held so brand can review again
      ...(isResubmission ? { status: "held", disputeReason: null } : {}),
    },
  });

  // Notify brand via system message
  const message = isResubmission
    ? `Updated deliverable proof resubmitted after dispute. Please review the new work and release payment or raise another dispute.`
    : `Deliverable proof submitted. The brand has 7 days to review and release payment, or raise a dispute. After 7 days, funds are auto-released.`;

  await prisma.message.create({
    data: {
      requestId: escrow.contactRequestId,
      senderId: escrow.influencerUserId,
      receiverId: escrow.brandUserId,
      content: message,
    },
  });

  return NextResponse.json({ success: true });
}
