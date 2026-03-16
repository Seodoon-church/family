"use client";

import { useState, useEffect } from "react";
import { useFCM } from "@/hooks/use-fcm";
import { Bell, X } from "lucide-react";

interface NotificationPromptProps {
  userId: string;
  familyId: string;
}

const DISMISS_KEY = "notification_prompt_dismissed";

export function NotificationPrompt({ userId, familyId }: NotificationPromptProps) {
  const { supported, permission, requestPermission } = useFCM(userId, familyId);
  const [dismissed, setDismissed] = useState(true); // 기본 숨김, useEffect에서 판단
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // 이미 권한 부여됨 / 거부됨 / 미지원 → 안 보여줌
    if (!supported || permission !== "default") return;

    // localStorage에서 dismiss 여부 확인
    const prev = localStorage.getItem(DISMISS_KEY);
    if (prev) return;

    setDismissed(false);
  }, [supported, permission]);

  if (dismissed || !supported || permission !== "default") {
    return null;
  }

  const handleAllow = async () => {
    setRequesting(true);
    await requestPermission();
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 mb-4">
      <div className="flex items-center gap-3 bg-accent-gold/10 border border-accent-gold/20 rounded-xl px-4 py-3">
        <Bell className="w-5 h-5 text-accent-gold shrink-0" />
        <p className="flex-1 text-sm text-foreground/80">
          가족 소식을 놓치지 마세요! 새 이야기나 메시지가 오면 알려드립니다.
        </p>
        <button
          onClick={handleAllow}
          disabled={requesting}
          className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {requesting ? "..." : "알림 허용"}
        </button>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-muted hover:text-foreground p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
