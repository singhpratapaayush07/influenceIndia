import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

async function getConversations(userId: string) {
  // Get all accepted contact requests where user is involved
  const requests = await prisma.contactRequest.findMany({
    where: {
      OR: [
        { brandUserId: userId },
        { influencerUserId: userId },
      ],
      status: "accepted",
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
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
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Get unread counts
  const conversationsWithUnread = await Promise.all(
    requests.map(async (request) => {
      const unreadCount = await prisma.message.count({
        where: {
          requestId: request.id,
          receiverId: userId,
          isRead: false,
        },
      });

      return {
        ...request,
        unreadCount,
      };
    })
  );

  return conversationsWithUnread;
}

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const conversations = await getConversations(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">View all your conversations</p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No messages yet</h3>
            <p className="text-gray-400 mt-1">Your conversations will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages[0];
            const isUserBrand = session.user!.id === conversation.brandUserId;
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
              <Link key={conversation.id} href={`/dashboard/messages/${conversation.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {displayName?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {displayName || "Unknown"}
                          </h3>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-purple-600 text-white">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>

                        {lastMessage && (
                          <>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {lastMessage.senderId === session.user!.id && "You: "}
                              {lastMessage.content}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                addSuffix: true,
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
