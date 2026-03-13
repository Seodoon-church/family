"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { GoldCorners } from "@/components/book/gold-corners";
import { OrnamentDivider } from "@/components/book/ornament-divider";

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

  // Redirect authenticated users (must be in useEffect, not during render)
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
      <div className="flex items-center justify-center min-h-screen linen-texture">
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
    <div className="min-h-screen linen-texture flex flex-col items-center justify-center px-4 py-10">
      {/* Book Cover container */}
      <div className="relative bg-card rounded-2xl warm-shadow-lg w-full max-w-lg p-10 md:p-14">
        <GoldCorners size={32} className="absolute inset-0 pointer-events-none" />

        {/* Content centered */}
        <div className="flex flex-col items-center text-center">
          {/* Stamp seal logo */}
          <div className="stamp-seal w-16 h-16 bg-primary/5 flex items-center justify-center mb-6">
            <span
              className="text-primary font-bold text-2xl"
              style={{ fontFamily: "var(--font-story)" }}
            >
              家
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-3xl md:text-4xl text-foreground font-semibold leading-snug mb-3"
            style={{ fontFamily: "var(--font-story)" }}
          >
            우리家 이야기
          </h1>

          <div className="warm-divider w-24 mb-5" />

          {/* Quote */}
          <p
            className="text-muted italic text-sm leading-relaxed mb-2 max-w-xs"
            style={{ fontFamily: "var(--font-story)" }}
          >
            할머니의 레시피, 아버지의 젊은 시절, 아이의 첫 걸음마...
          </p>
          <p
            className="text-sm text-muted mb-6 max-w-xs"
            style={{ fontFamily: "var(--font-story)" }}
          >
            흩어지기 전에, 한 권의 가족 이야기로 엮어보세요.
          </p>

          <OrnamentDivider className="w-full mb-6" />

          {/* Tab switcher */}
          <div className="flex w-full border-b border-border mb-6">
            <button
              onClick={() => switchMode("login")}
              className={`relative flex-1 pb-3 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "text-primary tab-notebook-active"
                  : "text-muted hover:text-foreground"
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`relative flex-1 pb-3 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "text-primary tab-notebook-active"
                  : "text-muted hover:text-foreground"
              }`}
            >
              회원가입
            </button>
          </div>

          {/* Forms */}
          <div className="w-full text-left">
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
                  <p className="text-sm text-accent-red text-center">{error}</p>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
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
                  <p className="text-sm text-accent-red text-center">{error}</p>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "가입 중..." : "회원가입"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p
        className="text-muted text-xs mt-8"
        style={{ fontFamily: "var(--font-story)" }}
      >
        가족의 이야기는 영원합니다
      </p>
    </div>
  );
}
