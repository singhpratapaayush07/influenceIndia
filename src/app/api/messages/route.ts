import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskContactInfo } from "@/lib/content-filter";

// POST /api/messages - Send a new message
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, content } = await req.json();

    if (!requestId || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the contact request exists and user is part of it
    const request = await prisma.contactRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ error: "Contact request not found" }, { status: 404 });
    }

    const userId = session.user.id;
    if (userId !== request.brandUserId && userId !== request.influencerUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Determine receiver
    const receiverId = userId === request.brandUserId ? request.influencerUserId : request.brandUserId;

    // Create message
    const message = await prisma.message.create({
      data: {
        requestId,
        senderId: userId,
        receiverId,
        content: maskContactInfo(content.trim()),
      },
      include: {
        sender: { select: { userType: true } },
        receiver: { select: { userType: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
