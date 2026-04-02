import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/escrow/[id]/dispute — Either party raises a dispute
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reason } = await req.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Dispute reason is required" }, { status: 400 });
  }

  const escrow = await prisma.escrowPayment.findUnique({
    where: { id: params.id },
  });

  if (!escrow) {
    return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
  }

  const userId = session.user.id;
  if (userId !== escrow.brandUserId && userId !== escrow.influencerUserId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (escrow.status !== "held") {
    return NextResponse.json({ error: "Can only dispute when funds are held" }, { status: 400 });
  }

  await prisma.escrowPayment.update({
    where: { id: params.id },
    data: {
      status: "disputed",
      disputeReason: reason.trim(),
    },
  });

  // Notify in conversation
  const isBrand = userId === escrow.brandUserId;
  await prisma.message.create({
    data: {
      requestId: escrow.contactRequestId,
      senderId: userId,
      receiverId: isBrand ? escrow.influencerUserId : escrow.brandUserId,
      content: `A dispute has been raised. Reason: "${reason.trim()}". The InfluenceIndia team will review and resolve this within 48 hours. Funds remain held until resolution.`,
    },
  });

  return NextResponse.json({ success: true, status: "disputed" });
}
