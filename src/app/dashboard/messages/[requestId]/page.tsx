import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MessageThread } from "@/components/messages/MessageThread";
import { notFound } from "next/navigation";

async function getConversation(requestId: string, userId: string) {
  const request = await prisma.contactRequest.findUnique({
    where: { id: requestId },
    include: {
      brandUser: {
        include: {
          brandProfile: { select: { companyName: true, logoUrl: true } },
        },
      },
      influencerUser: {
        include: {
          influencerProfile: { select: { displayName: true, profilePictureUrl: true } },
        },
      },
      messages: {
        include: {
          sender: { select: { email: true, userType: true } },
          receiver: { select: { email: true, userType: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!request) return null;

  // Verify user is part of this conversation
  if (userId !== request.brandUserId && userId !== request.influencerUserId) {
    return null;
  }

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      requestId,
      receiverId: userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return request;
}

export default async function MessageThreadPage({
  params,
}: {
  params: { requestId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const conversation = await getConversation(params.requestId, session.user.id);
  if (!conversation) {
    notFound();
  }

  const isUserBrand = session.user.id === conversation.brandUserId;
  const otherUser = isUserBrand ? conversation.influencerUser : conversation.brandUser;
  const otherProfile = isUserBrand
    ? (otherUser as any).influencerProfile
    : (otherUser as any).brandProfile;
  const displayName = isUserBrand
    ? otherProfile?.displayName
    : otherProfile?.companyName;
  const avatarUrl = isUserBrand
    ? otherProfile?.profilePictureUrl
    : otherProfile?.logoUrl;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MessageThread
        requestId={params.requestId}
        initialMessages={conversation.messages}
        currentUserId={session.user.id}
        otherUserName={displayName || "Unknown"}
        otherUserAvatar={avatarUrl || undefined}
      />
    </div>
  );
}
