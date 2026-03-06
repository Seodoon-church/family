"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";

export interface FamilyEvent {
  id: string;
  title: string;
  description?: string;
  eventDate: Timestamp;
  eventDateLunar?: string;
  category: string;
  isRecurring: boolean;
  participants: { id: string; name: string; role?: string }[];
  location?: string;
  createdAt: Timestamp;
}

export function useEvents(familyId: string | undefined) {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "families", familyId, "events"),
      orderBy("eventDate", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FamilyEvent[];
      setEvents(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [familyId]);

  const addEvent = async (event: Omit<FamilyEvent, "id" | "createdAt">) => {
    if (!familyId) return;
    await addDoc(collection(db, "families", familyId, "events"), {
      ...event,
      createdAt: serverTimestamp(),
    });
  };

  return { events, loading, addEvent };
}
