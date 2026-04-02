import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MessageThread } from "@/components/messages/MessageThread";
import { EscrowPanel } from "@/components/escrow/EscrowPanel";
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
          influencerProfile: {
            include: { pricing: { take: 1, orderBy: { priceInr: "asc" } } },
          },
        },
      },
      messages: {
        include: {
          sender: { select: { userType: true } },
          receiver: { select: { userType: true } },
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

  // Get suggested amount from influencer pricing
  const influencerProfile = (conversation.influencerUser as any).influencerProfile;
  const suggestedAmount = influencerProfile?.pricing?.[0]?.priceInr;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Thread — main column */}
        <div className="lg:col-span-2">
          <MessageThread
            requestId={params.requestId}
            initialMessages={conversation.messages}
            currentUserId={session.user.id}
            otherUserName={displayName || "Unknown"}
            otherUserAvatar={avatarUrl || undefined}
          />
        </div>

        {/* Escrow Panel — sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <EscrowPanel
              contactRequestId={params.requestId}
              contactRequestStatus={conversation.status}
              isBrand={isUserBrand}
              suggestedAmount={suggestedAmount}
            />

            {/* Collaboration status */}
            <div className="bg-white border rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Collaboration Status</p>
              <p className="text-sm font-semibold capitalize text-gray-800">
                {conversation.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
