import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();
  const validStatuses = ["accepted", "rejected", "in_progress", "completed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const request = await prisma.contactRequest.findUnique({ where: { id: params.id } });
  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Influencer can accept/reject pending requests
  // Both parties can transition accepted -> in_progress -> completed
  const userId = session.user.id;
  const isParticipant = userId === request.influencerUserId || userId === request.brandUserId;

  if (!isParticipant) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Only influencer can accept/reject
  if (["accepted", "rejected"].includes(status) && userId !== request.influencerUserId) {
    return NextResponse.json({ error: "Only influencer can accept or reject" }, { status: 403 });
  }

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    pending: ["accepted", "rejected"],
    accepted: ["in_progress"],
    in_progress: ["completed"],
  };

  if (!validTransitions[request.status]?.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from '${request.status}' to '${status}'` },
      { status: 400 }
    );
  }

  await prisma.contactRequest.update({ where: { id: params.id }, data: { status } });

  // Create initial message when request is accepted
  if (status === "accepted" && request.message) {
    await prisma.message.create({
      data: {
        requestId: params.id,
        senderId: request.brandUserId,
        receiverId: request.influencerUserId,
        content: request.message,
      },
    });
  }

  return NextResponse.json({ success: true });
}
