"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendContactRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const userType = (session.user as any).userType;
  if (userType !== "brand") return { error: "Only brands can send requests" };

  const influencerUserId = formData.get("influencerUserId") as string;
  const tierType = formData.get("tierType") as string;
  const message = formData.get("message") as string;

  if (!message?.trim()) return { error: "Message is required" };

  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId: session.user.id },
  });
  const influencerProfile = await prisma.influencerProfile.findUnique({
    where: { userId: influencerUserId },
  });

  if (!brandProfile || !influencerProfile) return { error: "Profile not found" };

  // Check duplicate
  const existing = await prisma.contactRequest.findFirst({
    where: {
      brandUserId: session.user.id,
      influencerUserId,
      status: "pending",
    },
  });
  if (existing) return { error: "You already have a pending request to this influencer" };

  await prisma.contactRequest.create({
    data: {
      brandUserId: session.user.id,
      influencerUserId,
      brandProfileId: brandProfile.id,
      influencerProfileId: influencerProfile.id,
      tierType,
      message,
    },
  });

  revalidatePath(`/influencers/${influencerUserId}`);
  return { success: true };
}

export async function updateRequestStatus(requestId: string, status: "accepted" | "rejected") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const request = await prisma.contactRequest.findUnique({ where: { id: requestId } });
  if (!request || request.influencerUserId !== session.user.id) {
    return { error: "Not authorized" };
  }

  await prisma.contactRequest.update({ where: { id: requestId }, data: { status } });
  revalidatePath("/dashboard/influencer");
  return { success: true };
}
