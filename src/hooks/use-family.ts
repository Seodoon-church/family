"use client";

import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Family } from "@/types/family";

export function useFamily(familyId: string | undefined) {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const fetchFamily = async () => {
      const db = getFirebaseDb();
      const famDoc = await getDoc(doc(db, "families", familyId));
      if (famDoc.exists()) {
        setFamily({ id: famDoc.id, ...famDoc.data() } as Family);
      }
      setLoading(false);
    };

    fetchFamily();
  }, [familyId]);

  const createFamily = async (name: string, userId: string): Promise<string> => {
    const db = getFirebaseDb();
    const familyRef = doc(db, "families", userId);
    await setDoc(familyRef, {
      name,
      createdBy: userId,
      createdAt: serverTimestamp(),
    });
    return userId;
  };

  return { family, loading, createFamily };
}
