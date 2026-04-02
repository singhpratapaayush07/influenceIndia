import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePlatformFee } from "@/lib/escrow";
import Razorpay from "razorpay";

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// POST /api/escrow — Brand initiates escrow payment for a collaboration
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userType = (session.user as any).userType;
  if (userType !== "brand") {
    return NextResponse.json({ error: "Only brands can create escrow payments" }, { status: 403 });
  }

  const { contactRequestId, amountInr } = await req.json();

  if (!contactRequestId || !amountInr || amountInr < 500) {
    return NextResponse.json({ error: "Valid contactRequestId and amount (min 500 INR) required" }, { status: 400 });
  }

  // Verify the contact request exists, belongs to this brand, and is accepted
  const contactRequest = await prisma.contactRequest.findUnique({
    where: { id: contactRequestId },
  });

  if (!contactRequest) {
    return NextResponse.json({ error: "Contact request not found" }, { status: 404 });
  }

  if (contactRequest.brandUserId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (contactRequest.status !== "accepted") {
    return NextResponse.json(
      { error: "Collaboration must be accepted before creating escrow" },
      { status: 400 }
    );
  }

  // Check no existing active escrow for this request
  const existingEscrow = await prisma.escrowPayment.findFirst({
    where: {
      contactRequestId,
      status: { in: ["pending", "held"] },
    },
  });

  if (existingEscrow) {
    return NextResponse.json({ error: "An active escrow already exists for this collaboration" }, { status: 409 });
  }

  const platformFee = calculatePlatformFee(amountInr);

  // Create Razorpay order
  const order = await getRazorpay().orders.create({
    amount: amountInr * 100, // Razorpay expects paise
    currency: "INR",
    receipt: `escrow_${contactRequestId}`,
    notes: {
      contactRequestId,
      brandUserId: session.user.id,
      influencerUserId: contactRequest.influencerUserId,
    },
  });

  // Create escrow record
  const escrow = await prisma.escrowPayment.create({
    data: {
      contactRequestId,
      brandUserId: session.user.id,
      influencerUserId: contactRequest.influencerUserId,
      amountInr,
      platformFeeInr: platformFee,
      status: "pending",
      razorpayOrderId: order.id,
    },
  });

  return NextResponse.json({
    escrowId: escrow.id,
    razorpayOrderId: order.id,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    amountInr,
    platformFeeInr: platformFee,
    influencerPayout: amountInr - platformFee,
  });
}

// GET /api/escrow?contactRequestId=xxx — Get escrow for a contact request
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contactRequestId = req.nextUrl.searchParams.get("contactRequestId");
  if (!contactRequestId) {
    return NextResponse.json({ error: "contactRequestId required" }, { status: 400 });
  }

  // Verify user is part of this collaboration
  const contactRequest = await prisma.contactRequest.findUnique({
    where: { id: contactRequestId },
  });

  if (!contactRequest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userId = session.user.id;
  if (userId !== contactRequest.brandUserId && userId !== contactRequest.influencerUserId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const escrow = await prisma.escrowPayment.findFirst({
    where: { contactRequestId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ escrow });
}
