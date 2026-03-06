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
import { db } from "@/lib/firebase";
import type { FamilyMember } from "@/types/family";

export function useMembers(familyId: string | undefined) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "families", familyId, "members"),
      orderBy("generation"),
      orderBy("birthOrder")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FamilyMember[];
      setMembers(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [familyId]);

  const addMember = async (member: Omit<FamilyMember, "id" | "createdAt" | "updatedAt">) => {
    if (!familyId) return;
    await addDoc(collection(db, "families", familyId, "members"), {
      ...member,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateMember = async (memberId: string, data: Partial<FamilyMember>) => {
    if (!familyId) return;
    await updateDoc(doc(db, "families", familyId, "members", memberId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteMember = async (memberId: string) => {
    if (!familyId) return;
    await deleteDoc(doc(db, "families", familyId, "members", memberId));
  };

  return { members, loading, addMember, updateMember, deleteMember };
}
