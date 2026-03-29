import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();
  if (!["accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const request = await prisma.contactRequest.findUnique({ where: { id: params.id } });
  if (!request || request.influencerUserId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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
