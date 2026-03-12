"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type Mode = "login" | "signup";

export default function LoginPage() {
  const { user, userProfile, loading, signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (userProfile?.familyId) {
        router.push("/dashboard");
      } else {
        router.push("/setup");
      }
    }
  }, [loading, user, userProfile, router]);

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent-blue/5">
        <LoadingSpinner size="lg" text="불러오는 중..." />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn(email, password);
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (!displayName.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(email, password, displayName.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("이미 등록된 이메일입니다.");
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError("");
    setEmail("");
    setPassword("");
    setDisplayName("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent-blue/5 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-2xl">家</span>
          </div>
          <h1 className="font-bold text-2xl text-gray-900 mb-1">
            우리家 이야기
          </h1>
          <p className="text-gray-500 text-sm">
            가족의 일상을 기록하고, 역사를 잇다
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "login"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => switchMode("signup")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "signup"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-7">
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                id="email"
                type="email"
                label="이메일"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                id="password"
                type="password"
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {error && (
                <p className="text-sm text-rose-500 text-center">{error}</p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Input
                id="name"
                type="text"
                label="이름"
                placeholder="홍길동"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
              <Input
                id="signup-email"
                type="email"
                label="이메일"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                id="signup-password"
                type="password"
                label="비밀번호"
                placeholder="6자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {error && (
                <p className="text-sm text-rose-500 text-center">{error}</p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "가입 중..." : "회원가입"}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          {mode === "login"
            ? "아직 계정이 없으신가요? 위에서 회원가입을 선택하세요."
            : "가입 후 가족을 만들거나, 초대코드로 기존 가족에 합류하세요."
          }
        </p>
      </div>
    </div>
  );
}
