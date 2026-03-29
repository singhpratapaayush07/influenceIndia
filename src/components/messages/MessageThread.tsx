"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageInput } from "./MessageInput";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { MessageWithUsers } from "@/types";

interface MessageThreadProps {
  requestId: string;
  initialMessages: MessageWithUsers[];
  currentUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

export function MessageThread({
  requestId,
  initialMessages,
  currentUserId,
  otherUserName,
  otherUserAvatar,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<MessageWithUsers[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages/${requestId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to refresh messages:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [requestId]);

  const handleSendMessage = async (content: string) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, content }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await res.json();
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/messages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {otherUserName[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">{otherUserName}</h2>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isSentByMe = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isSentByMe
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isSentByMe ? "text-purple-200" : "text-gray-400"
                        }`}
                      >
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
