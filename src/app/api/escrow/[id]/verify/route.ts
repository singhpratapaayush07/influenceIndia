import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// POST /api/escrow/[id]/verify — Verify Razorpay payment after brand completes checkout
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json();

  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
  }

  const escrow = await prisma.escrowPayment.findUnique({
    where: { id: params.id },
  });

  if (!escrow) {
    return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
  }

  if (escrow.brandUserId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (escrow.status !== "pending") {
    return NextResponse.json({ error: "Escrow is not in pending state" }, { status: 400 });
  }

  // Verify Razorpay signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Update escrow to "held" and transition contact request to "in_progress"
  await prisma.$transaction([
    prisma.escrowPayment.update({
      where: { id: params.id },
      data: {
        status: "held",
        razorpayPaymentId,
        paidAt: new Date(),
      },
    }),
    prisma.contactRequest.update({
      where: { id: escrow.contactRequestId },
      data: { status: "in_progress" },
    }),
  ]);

  // Send system message in the conversation thread
  await prisma.message.create({
    data: {
      requestId: escrow.contactRequestId,
      senderId: escrow.brandUserId,
      receiverId: escrow.influencerUserId,
      content: `Payment of INR ${escrow.amountInr.toLocaleString("en-IN")} has been secured in escrow. The influencer can now begin work. Funds will be released upon delivery confirmation.`,
    },
  });

  return NextResponse.json({ success: true, status: "held" });
}
