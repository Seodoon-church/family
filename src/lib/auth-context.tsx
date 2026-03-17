"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirebaseAuth, getFirebaseDb, getFirebaseApp } from "./firebase";
import type { UserProfile } from "@/types/family";

// 카카오 SDK 타입
declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        login: (options: { success: (response: { access_token: string }) => void; fail: (error: unknown) => void }) => void;
      };
    };
  }
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
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
    // 이메일 인증 발송
    await sendEmailVerification(credential.user);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(getFirebaseAuth(), provider);
    // 신규 사용자면 users 컬렉션에 프로필 생성
    const userDoc = await getDoc(doc(getFirebaseDb(), "users", result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(getFirebaseDb(), "users", result.user.uid), {
        email: result.user.email,
        displayName: result.user.displayName,
        role: "MEMBER",
        createdAt: serverTimestamp(),
      });
    }
  };

  const signInWithKakao = async () => {
    // 1. 카카오 SDK 로드 확인
    if (!window.Kakao) {
      throw new Error("카카오 SDK가 로드되지 않았습니다.");
    }
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY!);
    }

    // 2. 카카오 로그인 → access_token 획득
    const accessToken = await new Promise<string>((resolve, reject) => {
      window.Kakao!.Auth.login({
        success: (res) => resolve(res.access_token),
        fail: (err) => reject(err),
      });
    });

    // 3. Cloud Function 호출 → Firebase 커스텀 토큰
    const functions = getFunctions(getFirebaseApp(), "us-central1");
    const kakaoLoginFn = httpsCallable<{ accessToken: string }, { customToken: string }>(functions, "kakaoLogin");
    const result = await kakaoLoginFn({ accessToken });

    // 4. Firebase 로그인
    await signInWithCustomToken(getFirebaseAuth(), result.data.customToken);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  };

  const resendVerification = async () => {
    const currentUser = getFirebaseAuth().currentUser;
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
    }
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
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signInWithGoogle, signInWithKakao, resetPassword, resendVerification, signOut, refreshProfile }}>
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
