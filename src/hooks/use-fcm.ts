"use client";

import { useEffect, useRef, useState } from "react";
import {
  isFCMSupported,
  requestAndSaveToken,
  setupForegroundHandler,
} from "@/lib/messaging";

interface FCMNotification {
  id: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
  timestamp: number;
}

export function useFCM(userId: string | undefined, familyId: string | undefined) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);
  const [notification, setNotification] = useState<FCMNotification | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // 지원 여부 + 현재 권한 상태 확인
  useEffect(() => {
    isFCMSupported().then(setSupported);
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // 권한이 이미 granted이고 userId가 있으면 자동으로 토큰 등록
  useEffect(() => {
    if (!userId || !familyId || permission !== "granted" || !supported) return;
    requestAndSaveToken(userId, familyId);
  }, [userId, familyId, permission, supported]);

  // 포그라운드 메시지 리스너
  useEffect(() => {
    if (!supported || permission !== "granted") return;

    setupForegroundHandler((payload) => {
      setNotification({
        id: Date.now().toString(),
        title: payload.title,
        body: payload.body,
        data: payload.data,
        timestamp: Date.now(),
      });

      // 5초 후 자동 dismiss
      setTimeout(() => setNotification(null), 5000);
    }).then((unsub) => {
      cleanupRef.current = unsub;
    });

    return () => {
      cleanupRef.current?.();
    };
  }, [supported, permission]);

  const requestPermission = async () => {
    if (!userId || !familyId) return;
    const token = await requestAndSaveToken(userId, familyId);
    if (token) {
      setPermission("granted");
    } else {
      setPermission(Notification.permission);
    }
  };

  const dismissNotification = () => setNotification(null);

  return {
    supported,
    permission,
    notification,
    requestPermission,
    dismissNotification,
  };
}
