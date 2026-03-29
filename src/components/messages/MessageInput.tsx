"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSend(content.trim());
      setContent("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
        className="flex-1 min-h-[60px] max-h-[120px]"
        disabled={isSending}
      />
      <Button
        type="submit"
        disabled={!content.trim() || isSending}
        className="bg-purple-600 hover:bg-purple-700"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
