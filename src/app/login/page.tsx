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
  const { user, userProfile, loading, signIn, signUp, signInWithGoogle, signInWithKakao } = useAuth();
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

  // 카카오 SDK 로드
  useEffect(() => {
    if (document.getElementById("kakao-sdk")) return;
    const script = document.createElement("script");
    script.id = "kakao-sdk";
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    script.integrity = "sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4kyMhk/Tv3jkQlpJ";
    script.crossOrigin = "anonymous";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch {
      setError("Google 로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleKakaoLogin = async () => {
    setError("");
    try {
      await signInWithKakao();
    } catch {
      setError("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
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
                <div>
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
                  <div className="text-right mt-1">
                    <a
                      href="/forgot-password"
                      className="text-xs text-muted hover:text-primary transition-colors"
                    >
                      비밀번호를 잊으셨나요?
                    </a>
                  </div>
                </div>
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

            {/* 구분선 */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted">또는</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Google 로그인 */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="social-login-btn w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-lg bg-white hover:bg-warm-hover transition-colors mb-2.5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium text-foreground">
                Google로 계속하기
              </span>
            </button>

            {/* 카카오 로그인 */}
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="social-login-btn w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg transition-colors"
              style={{ backgroundColor: "#FEE500" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3C6.48 3 2 6.44 2 10.64c0 2.72 1.82 5.1 4.55 6.44-.2.72-.72 2.62-.83 3.03-.12.5.19.5.39.36.16-.1 2.53-1.72 3.56-2.42.75.11 1.53.17 2.33.17 5.52 0 10-3.44 10-7.58S17.52 3 12 3z" fill="#3C1E1E"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: "#3C1E1E" }}>
                카카오로 계속하기
              </span>
            </button>
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
