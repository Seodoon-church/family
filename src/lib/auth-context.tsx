"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./firebase";
import type { UserProfile } from "@/types/family";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Timeout fallback: if Firebase doesn't respond in 5 seconds, stop loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    try {
      const firebaseAuth = getFirebaseAuth();
      const firebaseDb = getFirebaseDb();
      unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        clearTimeout(timeout);
        setUser(firebaseUser);

        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(firebaseDb, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              setUserProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
            }
          } catch (err) {
            console.error("Failed to load user profile:", err);
          }
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      });
    } catch (err) {
      console.error("Firebase initialization failed:", err);
      clearTimeout(timeout);
      setLoading(false);
    }

    return () => {
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await setDoc(doc(getFirebaseDb(), "users", credential.user.uid), {
      email,
      displayName,
      role: "MEMBER",
      createdAt: serverTimestamp(),
    });
  };

  const refreshProfile = async () => {
    const currentUser = getFirebaseAuth().currentUser;
    if (currentUser) {
      const userDoc = await getDoc(doc(getFirebaseDb(), "users", currentUser.uid));
      if (userDoc.exists()) {
        setUserProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(getFirebaseAuth());
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
