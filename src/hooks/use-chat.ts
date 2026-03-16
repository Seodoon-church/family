"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { ChatMessage } from "@/types/chat";

const PAGE_SIZE = 50;

export function useChat(familyId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const oldestDocRef = useRef<QueryDocumentSnapshot | null>(null);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(getFirebaseDb(), "families", familyId, "messages"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatMessage[];

        // 오래된 순으로 정렬 (화면에 위→아래 = 과거→최신)
        setMessages(data.reverse());
        setHasMore(snapshot.docs.length >= PAGE_SIZE);

        // 가장 오래된 문서 참조 저장 (loadMore용)
        if (snapshot.docs.length > 0) {
          oldestDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        }

        setLoading(false);
      },
      (error) => {
        console.error("Failed to load messages:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [familyId]);

  const sendMessage = useCallback(
    async (
      text: string,
      senderId: string,
      senderName: string,
      senderImage?: string
    ) => {
      if (!familyId || !text.trim()) return;
      await addDoc(
        collection(getFirebaseDb(), "families", familyId, "messages"),
        {
          text: text.trim(),
          senderId,
          senderName,
          senderImage: senderImage || null,
          type: "TEXT",
          createdAt: serverTimestamp(),
        }
      );
    },
    [familyId]
  );

  const loadMore = useCallback(async () => {
    if (!familyId || !oldestDocRef.current || !hasMore) return;

    const q = query(
      collection(getFirebaseDb(), "families", familyId, "messages"),
      orderBy("createdAt", "desc"),
      startAfter(oldestDocRef.current),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);
    const older = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];

    if (snapshot.docs.length > 0) {
      oldestDocRef.current = snapshot.docs[snapshot.docs.length - 1];
    }
    setHasMore(snapshot.docs.length >= PAGE_SIZE);

    // 앞에 추가 (오래된 메시지가 위로)
    setMessages((prev) => [...older.reverse(), ...prev]);
  }, [familyId, hasMore]);

  return { messages, loading, hasMore, sendMessage, loadMore };
}
