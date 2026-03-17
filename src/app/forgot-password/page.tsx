"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoldCorners } from "@/components/book/gold-corners";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      setError("이메일 발송에 실패했습니다. 올바른 이메일인지 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen linen-texture flex flex-col items-center justify-center px-4 py-10">
      <div className="relative bg-card rounded-2xl warm-shadow-lg w-full max-w-md p-10 md:p-12">
        <GoldCorners size={28} className="absolute inset-0 pointer-events-none" />

        <div className="flex flex-col items-center text-center">
          {sent ? (
            <>
              <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-accent-green" />
              </div>
              <h1
                className="text-2xl text-foreground font-semibold mb-3"
                style={{ fontFamily: "var(--font-story)" }}
              >
                이메일을 확인해주세요
              </h1>
              <p className="text-sm text-muted mb-2">
                <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-sm text-muted mb-8">
                비밀번호 재설정 링크를 보내드렸습니다.<br />
                이메일에서 링크를 클릭하여 새 비밀번호를 설정하세요.
              </p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                로그인으로 돌아가기
              </a>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1
                className="text-2xl text-foreground font-semibold mb-3"
                style={{ fontFamily: "var(--font-story)" }}
              >
                비밀번호 찾기
              </h1>
              <p className="text-sm text-muted mb-8">
                가입 시 사용한 이메일을 입력하시면<br />
                비밀번호 재설정 링크를 보내드립니다.
              </p>

              <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
                <Input
                  id="email"
                  type="email"
                  label="이메일"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  error={error || undefined}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "보내는 중..." : "재설정 이메일 보내기"}
                </Button>
              </form>

              <a
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mt-6"
              >
                <ArrowLeft className="w-4 h-4" />
                로그인으로 돌아가기
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
