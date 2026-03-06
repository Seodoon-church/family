"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Relationship } from "@/types/family";

export function useRelationships(familyId: string | undefined) {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();
    const q = query(collection(db, "families", familyId, "relationships"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Relationship[];
      setRelationships(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [familyId]);

  const addRelationship = async (
    fromId: string,
    toId: string,
    type: "PARENT_CHILD" | "SPOUSE",
    marriageDate?: Date
  ) => {
    if (!familyId) return;
    const db = getFirebaseDb();
    await addDoc(collection(db, "families", familyId, "relationships"), {
      fromId,
      toId,
      type,
      marriageDate: marriageDate || null,
      createdAt: serverTimestamp(),
    });
  };

  const deleteRelationship = async (relId: string) => {
    if (!familyId) return;
    const db = getFirebaseDb();
    await deleteDoc(doc(db, "families", familyId, "relationships", relId));
  };

  return { relationships, loading, addRelationship, deleteRelationship };
}
