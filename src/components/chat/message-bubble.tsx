"use client";

import { Avatar } from "@/components/ui/avatar";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  showName: boolean;
}

function formatTime(msg: ChatMessage): string {
  const d = msg.createdAt?.toDate ? msg.createdAt.toDate() : null;
  if (!d) return "";
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  const hour12 = h % 12 || 12;
  return `${ampm} ${hour12}:${m}`;
}

export function MessageBubble({ message, isOwn, showAvatar, showName }: MessageBubbleProps) {
  // 시스템 메시지
  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center my-3">
        <span className="text-xs text-muted bg-warm-hover px-3 py-1 rounded-full">
          {message.text}
        </span>
      </div>
    );
  }

  if (isOwn) {
    return (
      <div className="flex justify-end items-end gap-1.5 mb-1">
        <span className="text-[10px] text-muted shrink-0">{formatTime(message)}</span>
        <div className="max-w-[75%] px-3.5 py-2 rounded-2xl rounded-br-sm bg-primary/15 text-foreground">
          {message.type === "IMAGE" && message.imageUrl && (
            <img src={message.imageUrl} alt="" className="rounded-lg mb-1 max-w-full" />
          )}
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 mb-1">
      {/* 아바타 (연속 메시지면 빈 공간) */}
      <div className="w-8 shrink-0">
        {showAvatar && (
          <Avatar name={message.senderName} size="sm" />
        )}
      </div>

      <div className="max-w-[75%]">
        {showName && (
          <p className="text-xs text-muted mb-0.5 ml-1">{message.senderName}</p>
        )}
        <div className="px-3.5 py-2 rounded-2xl rounded-bl-sm bg-card border border-border text-foreground">
          {message.type === "IMAGE" && message.imageUrl && (
            <img src={message.imageUrl} alt="" className="rounded-lg mb-1 max-w-full" />
          )}
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
        </div>
      </div>

      <span className="text-[10px] text-muted shrink-0">{formatTime(message)}</span>
    </div>
  );
}
