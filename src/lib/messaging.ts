"use client";

import {
  doc,
  setDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

// VAPID 키 (Firebase Console > 프로젝트 설정 > 클라우드 메시징 > 웹 푸시 인증서)
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/** FCM 지원 여부 확인 */
export async function isFCMSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!("Notification" in window)) return false;
  try {
    const { isSupported } = await import("firebase/messaging");
    return await isSupported();
  } catch {
    return false;
  }
}

/** FCM 토큰 요청 + Firestore에 저장 */
export async function requestAndSaveToken(
  userId: string,
  familyId: string
): Promise<string | null> {
  try {
    const supported = await isFCMSupported();
    if (!supported) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    if (!VAPID_KEY) {
      console.warn("VAPID key not configured. Push notifications disabled.");
      return null;
    }

    // Service Worker 등록
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    // Firebase Messaging 초기화 + 토큰 발급
    const { getApps } = await import("firebase/app");
    const { getMessaging, getToken } = await import("firebase/messaging");
    const app = getApps()[0];
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) return null;

    // Firestore에 토큰 저장 (userId + familyId로 조회 가능하도록)
    const tokenDocId = `${userId}_${btoa(token).slice(0, 20)}`;
    await setDoc(doc(getFirebaseDb(), "fcmTokens", tokenDocId), {
      userId,
      familyId,
      token,
      device: navigator.userAgent.slice(0, 100),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return token;
  } catch (error) {
    console.error("FCM token registration failed:", error);
    return null;
  }
}

/** 기존 토큰 삭제 (로그아웃 시) */
export async function removeTokens(userId: string): Promise<void> {
  try {
    const q = query(
      collection(getFirebaseDb(), "fcmTokens"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    const batch: Promise<void>[] = [];
    snap.docs.forEach((d) => batch.push(deleteDoc(d.ref)));
    await Promise.all(batch);
  } catch (error) {
    console.error("Failed to remove FCM tokens:", error);
  }
}

/** 포그라운드 메시지 리스너 설정 */
export async function setupForegroundHandler(
  onMessage: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void
): Promise<(() => void) | null> {
  try {
    const supported = await isFCMSupported();
    if (!supported) return null;

    const { getApps } = await import("firebase/app");
    const { getMessaging, onMessage: fbOnMessage } = await import("firebase/messaging");
    const app = getApps()[0];
    const messaging = getMessaging(app);

    const unsubscribe = fbOnMessage(messaging, (payload) => {
      onMessage({
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data,
      });
    });

    return unsubscribe;
  } catch {
    return null;
  }
}
