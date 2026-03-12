"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Story, StoryCategory } from "@/types/story";

export function useStories(familyId: string | undefined, category?: StoryCategory) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const q = category
      ? query(
          collection(getFirebaseDb(), "families", familyId, "stories"),
          where("category", "==", category),
          orderBy("createdAt", "desc"),
          limit(50)
        )
      : query(
          collection(getFirebaseDb(), "families", familyId, "stories"),
          orderBy("createdAt", "desc"),
          limit(50)
        );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Story[];
      setStories(data);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load stories:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [familyId, category]);

  const addStory = async (story: Omit<Story, "id" | "createdAt" | "updatedAt" | "commentCount">) => {
    if (!familyId) return;
    await addDoc(collection(getFirebaseDb(), "families", familyId, "stories"), {
      ...story,
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateStory = async (storyId: string, data: Partial<Story>) => {
    if (!familyId) return;
    await updateDoc(doc(getFirebaseDb(), "families", familyId, "stories", storyId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteStory = async (storyId: string) => {
    if (!familyId) return;
    await deleteDoc(doc(getFirebaseDb(), "families", familyId, "stories", storyId));
  };

  return { stories, loading, addStory, updateStory, deleteStory };
}
