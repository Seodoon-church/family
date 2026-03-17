"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/hooks/use-family";
import { BookSpine } from "@/components/book/book-spine";
import { BookmarkNav } from "@/components/book/bookmark-nav";
import { MobileBookNav } from "@/components/book/mobile-book-nav";
import { PageFooter } from "@/components/book/page-footer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NotificationPrompt } from "@/components/notifications/notification-prompt";
import { NotificationToast } from "@/components/notifications/notification-toast";
import { LogOut, MailCheck, X } from "lucide-react";

export function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading, signOut, resendVerification } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isSetupPage = pathname === "/setup" || pathname === "/setup/";

  const familyId = userProfile?.familyId;
  const { family } = useFamily(familyId);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    // If user is logged in but has no familyId, redirect to setup
    // (except if already on the setup page)
    if (!loading && user && userProfile && !userProfile.familyId && !isSetupPage) {
      router.push("/setup");
    }
  }, [loading, user, userProfile, router, isSetupPage]);

  const handleLogout = async () => {
    await signOut();
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen linen-texture">
        <LoadingSpinner size="lg" text="불러오는 중..." />
      </div>
    );
  }

  // Setup page: show without book chrome (clean layout)
  if (isSetupPage) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-6">
          {children}
        </div>
      </div>
    );
  }

  // If no familyId yet, show loading (will redirect to setup)
  if (!userProfile?.familyId) {
    return (
      <div className="flex items-center justify-center min-h-screen linen-texture">
        <LoadingSpinner size="lg" text="불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Book Spine - desktop only */}
      <BookSpine familyName={family?.name || ""} />

      {/* Main book page area */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 md:mr-12">
        {/* User badge - top right, small */}
        <div className="flex justify-end items-center gap-2 px-4 pt-3 pb-1">
          <span className="text-xs text-muted">{userProfile?.displayName}</span>
          <button
            onClick={handleLogout}
            className="text-muted hover:text-foreground p-1 transition-colors"
            aria-label="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* 이메일 미인증 안내 배너 */}
        {user && !user.emailVerified && user.providerData?.[0]?.providerId === "password" && (
          <EmailVerificationBanner onResend={resendVerification} />
        )}

        {/* 알림 허용 프롬프트 */}
        <NotificationPrompt userId={userProfile.id} familyId={userProfile.familyId} />

        {/* 인앱 알림 토스트 */}
        <NotificationToast userId={userProfile.id} familyId={userProfile.familyId} />

        {/* Book page content */}
        <div className="book-page paper-texture page-curl max-w-4xl mx-auto rounded-xl px-6 py-2 mb-8 md:px-10">
          {children}
        </div>

        <PageFooter />
      </main>

      {/* Bookmark Nav - desktop only */}
      <BookmarkNav />

      {/* Mobile Book Nav - mobile only */}
      <MobileBookNav />
    </div>
  );
}

function EmailVerificationBanner({ onResend }: { onResend: () => Promise<void> }) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await onResend();
      setSent(true);
    } catch {
      // 에러 무시 (이미 발송된 경우 등)
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-4 mb-2 px-4 py-3 bg-accent-gold/10 border border-accent-gold/30 rounded-lg flex items-center gap-3">
      <MailCheck className="w-5 h-5 text-accent-gold flex-shrink-0" />
      <div className="flex-1 text-sm">
        <span className="text-foreground">이메일 인증이 완료되지 않았습니다.</span>
        {sent ? (
          <span className="text-accent-green ml-2">인증 메일을 다시 보냈습니다!</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={sending}
            className="ml-2 text-primary hover:text-primary-dark underline font-medium"
          >
            {sending ? "보내는 중..." : "인증 메일 재발송"}
          </button>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted hover:text-foreground p-1"
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
