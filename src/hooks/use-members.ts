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
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { FamilyMember } from "@/types/family";

export function useMembers(familyId: string | undefined) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();
    const q = query(
      collection(db, "families", familyId, "members"),
      orderBy("generation")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FamilyMember[];
      data.sort((a, b) => a.generation - b.generation || a.birthOrder - b.birthOrder);
      setMembers(data);
      setLoading(false);
    }, (err) => {
      console.error("Members query error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, [familyId]);

  const removeUndefined = (obj: Record<string, unknown>) => {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
  };

  const addMember = async (member: Omit<FamilyMember, "id" | "createdAt" | "updatedAt">): Promise<string | undefined> => {
    if (!familyId) return;
    const docRef = await addDoc(collection(getFirebaseDb(), "families", familyId, "members"), {
      ...removeUndefined(member as Record<string, unknown>),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateMember = async (memberId: string, data: Partial<FamilyMember>) => {
    if (!familyId) return;
    await updateDoc(doc(getFirebaseDb(), "families", familyId, "members", memberId), {
      ...removeUndefined(data as Record<string, unknown>),
      updatedAt: serverTimestamp(),
    });
  };

  const deleteMember = async (memberId: string) => {
    if (!familyId) return;
    await deleteDoc(doc(getFirebaseDb(), "families", familyId, "members", memberId));
  };

  return { members, loading, addMember, updateMember, deleteMember };
}
