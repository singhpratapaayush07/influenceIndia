import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages/[requestId] - Get all messages for a contact request
export async function GET(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = params;

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

    // Get all messages for this request
    const messages = await prisma.message.findMany({
      where: { requestId },
      include: {
        sender: { select: { userType: true } },
        receiver: { select: { userType: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// PATCH /api/messages/[requestId] - Mark messages as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = params;
    const userId = session.user.id;

    // Mark all messages in this request where current user is receiver as read
    await prisma.message.updateMany({
      where: {
        requestId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 });
  }
}
