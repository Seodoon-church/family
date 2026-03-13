"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BookOpen, Users, Camera, Heart } from "lucide-react";

type Mode = "login" | "signup";

const features = [
  {
    icon: BookOpen,
    title: "이야기 기록",
    desc: "소중한 가족의 이야기를 글과 사진으로 남기세요",
  },
  {
    icon: Users,
    title: "디지털 족보",
    desc: "한눈에 보는 가계도로 뿌리를 이어가세요",
  },
  {
    icon: Camera,
    title: "추억 갤러리",
    desc: "사진과 영상으로 함께한 순간을 모아보세요",
  },
  {
    icon: Heart,
    title: "가족 타임라인",
    desc: "생일, 기념일, 소중한 날들을 기억하세요",
  },
];

/* Gold corner decoration component */
function GoldCorners({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      {/* Top-left */}
      <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-accent-gold/30 rounded-tl-sm" />
      {/* Top-right */}
      <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-accent-gold/30 rounded-tr-sm" />
      {/* Bottom-left */}
      <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-accent-gold/30 rounded-bl-sm" />
      {/* Bottom-right */}
      <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-accent-gold/30 rounded-br-sm" />
    </div>
  );
}

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
    <div className="min-h-screen linen-texture flex flex-col lg:flex-row">
      {/* ========== LEFT: Emotional visual area ========== */}
      <div className="relative lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 lg:py-0 lg:px-16 overflow-hidden">
        {/* Gold corner decorations (desktop only) */}
        <GoldCorners className="hidden lg:block absolute inset-6 pointer-events-none" />

        {/* Stamp-seal logo */}
        <div className="stamp-seal w-16 h-16 bg-primary/5 flex items-center justify-center mb-8">
          <span
            className="text-primary font-bold text-3xl"
            style={{ fontFamily: "var(--font-story)" }}
          >
            家
          </span>
        </div>

        {/* Main heading */}
        <h1
          className="text-3xl lg:text-5xl text-foreground text-center font-semibold leading-snug mb-5"
          style={{ fontFamily: "var(--font-story)" }}
        >
          가족의 이야기를<br />기록하세요
        </h1>

        {/* Warm description */}
        <p className="text-muted text-center text-base lg:text-lg leading-relaxed max-w-md mb-10">
          할머니의 레시피, 아버지의 젊은 시절, 아이의 첫 걸음마...
          <br className="hidden lg:block" />
          흩어지기 전에, 한 권의 가족 이야기로 엮어보세요.
        </p>

        {/* Warm divider */}
        <div className="warm-divider w-32 mb-10" />

        {/* 4 Feature highlights */}
        <div className="grid grid-cols-2 gap-5 max-w-sm w-full mb-12">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-card/60 border border-border/50 transition-colors hover:bg-card"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2.5">
                <feat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground mb-1">
                {feat.title}
              </span>
              <span className="text-xs text-muted leading-snug">
                {feat.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <p
          className="text-muted/70 text-sm lg:text-base italic text-center"
          style={{ fontFamily: "var(--font-story)" }}
        >
          &ldquo;가족은 영원한 이야기입니다&rdquo;
        </p>
      </div>

      {/* ========== RIGHT: Login / Signup form ========== */}
      <div className="lg:w-1/2 flex items-center justify-center px-6 py-10 lg:py-0 lg:px-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only app title */}
          <div className="lg:hidden text-center mb-6">
            <h2
              className="text-xl font-semibold text-foreground"
              style={{ fontFamily: "var(--font-story)" }}
            >
              우리家 이야기
            </h2>
            <p className="text-sm text-muted mt-1">
              가족의 일상을 기록하고, 역사를 잇다
            </p>
          </div>

          {/* Tab switcher (border-b style) */}
          <div className="flex border-b border-border mb-6">
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

          {/* Form card */}
          <div className="relative bg-card rounded-2xl warm-shadow border border-border p-7">
            {/* Gold corners on card */}
            <GoldCorners className="absolute inset-0 pointer-events-none" />

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

          {/* Footer help text */}
          <p className="text-center text-xs text-muted mt-6 leading-relaxed">
            {mode === "login"
              ? "아직 계정이 없으신가요? 위에서 회원가입을 선택하세요."
              : "가입 후 가족을 만들거나, 초대코드로 기존 가족에 합류하세요."}
          </p>
        </div>
      </div>
    </div>
  );
}
