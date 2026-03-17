"use client";

import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Family } from "@/types/family";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function useFamily(familyId: string | undefined) {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const fetchFamily = async () => {
      try {
        const db = getFirebaseDb();
        const famDoc = await getDoc(doc(db, "families", familyId));
        if (famDoc.exists()) {
          setFamily({ id: famDoc.id, ...famDoc.data() } as Family);
        }
      } catch (error) {
        console.error("Failed to load family:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFamily();
  }, [familyId]);

  const createFamily = async (name: string, userId: string): Promise<string> => {
    const db = getFirebaseDb();
    const familyRef = doc(collection(db, "families"));
    const inviteCode = generateInviteCode();

    await setDoc(familyRef, {
      name,
      inviteCode,
      createdBy: userId,
      createdAt: serverTimestamp(),
    });

    // Update user profile with familyId and OWNER role (creator)
    await updateDoc(doc(db, "users", userId), {
      familyId: familyRef.id,
      role: "OWNER",
    });

    return familyRef.id;
  };

  const joinFamily = async (inviteCode: string, userId: string): Promise<string> => {
    const db = getFirebaseDb();
    const q = query(
      collection(db, "families"),
      where("inviteCode", "==", inviteCode.toUpperCase())
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("유효하지 않은 초대코드입니다.");
    }

    const familyDoc = snapshot.docs[0];
    const foundFamilyId = familyDoc.id;

    // Update user profile with familyId
    await updateDoc(doc(db, "users", userId), {
      familyId: foundFamilyId,
      role: "MEMBER",
    });

    return foundFamilyId;
  };

  const regenerateInviteCode = async (): Promise<string> => {
    if (!familyId) throw new Error("가족 ID가 없습니다.");
    const db = getFirebaseDb();
    const newCode = generateInviteCode();
    await updateDoc(doc(db, "families", familyId), {
      inviteCode: newCode,
    });
    setFamily((prev) => prev ? { ...prev, inviteCode: newCode } : null);
    return newCode;
  };

  const updateFamily = async (data: Partial<Family>): Promise<void> => {
    if (!familyId) throw new Error("가족 ID가 없습니다.");
    const db = getFirebaseDb();
    const { id: _id, ...updateData } = data;
    await updateDoc(doc(db, "families", familyId), updateData);
    setFamily((prev) => prev ? { ...prev, ...updateData } as Family : null);
  };

  return { family, loading, createFamily, joinFamily, regenerateInviteCode, updateFamily };
}
