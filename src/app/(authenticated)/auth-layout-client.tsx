"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/hooks/use-family";
import { useMembers } from "@/hooks/use-members";
import { useStories } from "@/hooks/use-stories";
import { useMedia } from "@/hooks/use-media";
import { useEvents } from "@/hooks/use-events";
import { BookSpine } from "@/components/book/book-spine";
import { BookmarkNav } from "@/components/book/bookmark-nav";
import { MobileBookNav } from "@/components/book/mobile-book-nav";
import { PageFooter } from "@/components/book/page-footer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LogOut } from "lucide-react";

export function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isSetupPage = pathname === "/setup" || pathname === "/setup/";

  const familyId = userProfile?.familyId;
  const { family } = useFamily(familyId);
  const { members } = useMembers(familyId);
  const { stories } = useStories(familyId);
  const { mediaList } = useMedia(familyId);
  const { events } = useEvents(familyId);

  // Calculate page count from content
  const pageCount =
    stories.length +
    Math.ceil(mediaList.length / 4) +
    Math.ceil(members.length / 2) +
    Math.ceil(events.length / 3);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
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
      <BookSpine familyName={family?.name || ""} pageCount={pageCount} />

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
