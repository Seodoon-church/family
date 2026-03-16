"use client";

import { useState, useCallback } from "react";
import {
  collection, query, where, orderBy, getDocs, Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { FamilyMember, Relationship } from "@/types/family";
import type { Story } from "@/types/story";
import type { Media } from "@/types/media";
import type { FamilyEvent } from "@/hooks/use-events";

export interface DiaryData {
  members: FamilyMember[];
  relationships: Relationship[];
  stories: Story[];
  events: FamilyEvent[];
  media: Media[];
  year: number;
}

export function useDiaryData(familyId: string | undefined) {
  const [data, setData] = useState<DiaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadYear = useCallback(async (year: number) => {
    if (!familyId) return;
    setLoading(true);
    setError(null);

    try {
      const db = getFirebaseDb();
      const startOfYear = Timestamp.fromDate(new Date(year, 0, 1));
      const endOfYear = Timestamp.fromDate(new Date(year, 11, 31, 23, 59, 59));
      const famRef = `families/${familyId}`;

      const [membersSnap, relsSnap, storiesSnap, eventsSnap, mediaSnap] =
        await Promise.all([
          getDocs(query(
            collection(db, famRef + "/members"),
            orderBy("generation")
          )),
          getDocs(query(
            collection(db, famRef + "/relationships")
          )),
          getDocs(query(
            collection(db, famRef + "/stories"),
            where("createdAt", ">=", startOfYear),
            where("createdAt", "<=", endOfYear),
            orderBy("createdAt", "desc")
          )),
          getDocs(query(
            collection(db, famRef + "/events"),
            orderBy("eventDate", "desc")
          )),
          getDocs(query(
            collection(db, famRef + "/media"),
            where("createdAt", ">=", startOfYear),
            where("createdAt", "<=", endOfYear),
            orderBy("createdAt", "desc")
          )),
        ]);

      // 이벤트는 반복 이벤트 포함 클라이언트 필터
      const allEvents = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as FamilyEvent[];
      const yearEvents = allEvents.filter(event => {
        if (!event.eventDate?.toDate) return false;
        if (event.isRecurring) return true;
        return event.eventDate.toDate().getFullYear() === year;
      });

      setData({
        members: membersSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as FamilyMember))
          .sort((a, b) => a.generation - b.generation || a.birthOrder - b.birthOrder),
        relationships: relsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Relationship)),
        stories: storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story)),
        events: yearEvents,
        media: mediaSnap.docs.map(d => ({ id: d.id, ...d.data() } as Media)),
        year,
      });
    } catch (err) {
      console.error("Failed to load diary data:", err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  return { data, loading, error, loadYear };
}
