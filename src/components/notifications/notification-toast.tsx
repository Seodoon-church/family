"use client";

import { useFCM } from "@/hooks/use-fcm";
import { Bell, X } from "lucide-react";

interface NotificationToastProps {
  userId: string;
  familyId: string;
}

export function NotificationToast({ userId, familyId }: NotificationToastProps) {
  const { notification, dismissNotification } = useFCM(userId, familyId);

  if (!notification) return null;

  const handleClick = () => {
    dismissNotification();
    // 채팅 알림이면 채팅으로, 이야기 알림이면 이야기로
    const type = notification.data?.type;
    if (type === "CHAT") {
      window.location.href = "/chat/";
    } else if (type === "STORY" && notification.data?.storyId) {
      window.location.href = `/stories/${notification.data.storyId}/`;
    }
  };

  return (
    <div
      className="fixed top-4 right-4 z-[70] max-w-sm animate-slide-in cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
        <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {notification.title && (
            <p className="text-sm font-semibold text-foreground truncate">
              {notification.title}
            </p>
          )}
          {notification.body && (
            <p className="text-xs text-muted mt-0.5 line-clamp-2">
              {notification.body}
            </p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); dismissNotification(); }}
          className="text-muted hover:text-foreground shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
