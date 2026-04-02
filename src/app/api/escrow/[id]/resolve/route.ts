import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/escrow/[id]/resolve — Admin resolves a disputed escrow
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userType = (session.user as any).userType;
  if (userType !== "admin") {
    return NextResponse.json({ error: "Only admins can resolve disputes" }, { status: 403 });
  }

  const { resolution } = await req.json();

  if (!resolution || !["release", "refund"].includes(resolution)) {
    return NextResponse.json(
      { error: "resolution must be 'release' (pay influencer) or 'refund' (refund brand)" },
      { status: 400 }
    );
  }

  const escrow = await prisma.escrowPayment.findUnique({
    where: { id: params.id },
  });

  if (!escrow) {
    return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
  }

  if (escrow.status !== "disputed") {
    return NextResponse.json({ error: "Can only resolve disputed escrows" }, { status: 400 });
  }

  const newStatus = resolution === "release" ? "released" : "refunded";

  await prisma.$transaction([
    prisma.escrowPayment.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        ...(resolution === "release" ? { releasedAt: new Date() } : {}),
      },
    }),
    // Update contact request status
    prisma.contactRequest.update({
      where: { id: escrow.contactRequestId },
      data: {
        status: resolution === "release" ? "completed" : "accepted",
      },
    }),
    // System message in the thread
    prisma.message.create({
      data: {
        requestId: escrow.contactRequestId,
        senderId: session.user.id,
        receiverId: escrow.brandUserId,
        content:
          resolution === "release"
            ? `Dispute resolved: Funds of INR ${escrow.amountInr - escrow.platformFeeInr} have been released to the influencer. The collaboration is now marked as completed.`
            : `Dispute resolved: Funds of INR ${escrow.amountInr} will be refunded to the brand. The collaboration has been reset.`,
      },
    }),
  ]);

  return NextResponse.json({ success: true, status: newStatus, resolution });
}
