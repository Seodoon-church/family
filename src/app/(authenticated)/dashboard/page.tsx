"use client";

import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/hooks/use-family";
import { useMembers } from "@/hooks/use-members";
import { useStories } from "@/hooks/use-stories";
import { useMedia } from "@/hooks/use-media";
import { useEvents } from "@/hooks/use-events";
import { ChapterHeader } from "@/components/book/chapter-header";
import { OrnamentDivider } from "@/components/book/ornament-divider";
import { BookProgress } from "@/components/book/book-progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Avatar } from "@/components/ui/avatar";
import { getRelativeTime, formatDate } from "@/lib/utils";
import { Feather, ChevronRight, TreePine, CalendarDays } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "고요한 밤,";
  if (hour < 12) return "좋은 아침입니다,";
  if (hour < 18) return "좋은 오후입니다,";
  return "좋은 저녁입니다,";
}

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const familyId = userProfile?.familyId;
  const { family } = useFamily(familyId);
  const { members, loading: membersLoading } = useMembers(familyId);
  const { stories, loading: storiesLoading } = useStories(familyId);
  const { mediaList, loading: mediaLoading } = useMedia(familyId);
  const { events, loading: eventsLoading } = useEvents(familyId);

  const loading = membersLoading || storiesLoading || mediaLoading || eventsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="페이지를 펼치는 중..." />
      </div>
    );
  }

  const today = new Date();
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${days[today.getDay()]}`;
  const familyName = family?.name || "우리 가족";

  // Latest story
  const latestStory = stories.length > 0 ? stories[0] : null;

  // Upcoming event within 7 days
  const upcomingEvent = events
    .filter((event) => {
      if (!event.eventDate?.toDate) return false;
      const eventDate = event.eventDate.toDate();
      const diffMs = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => {
      const dateA = a.eventDate?.toDate?.() || new Date();
      const dateB = b.eventDate?.toDate?.() || new Date();
      return dateA.getTime() - dateB.getTime();
    })[0] || null;

  const getDDay = (eventDate: Date) => {
    const diffMs = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "D-Day";
    return `D-${diffDays}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Chapter Header */}
      <ChapterHeader title="오늘의 한 페이지" />

      {/* Date + Greeting */}
      <div className="text-center -mt-4 mb-8">
        <p className="date-stamp text-sm mb-2">{dateStr}</p>
        <p
          className="text-lg text-foreground/80"
          style={{ fontFamily: "var(--font-story)" }}
        >
          {getGreeting()}{" "}
          <span className="text-primary font-semibold">{familyName}</span>
        </p>
      </div>

      {/* Tree Wizard Shortcut - shown when only self is registered */}
      {members.length <= 1 && (
        <a
          href="/setup"
          className="block rounded-xl border border-border warm-shadow p-5 mb-8 hover:shadow-lg transition-all group relative overflow-hidden bg-card/50"
        >
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-gold rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-gold rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-gold rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-gold rounded-br-xl" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0 group-hover:bg-accent-gold/20 transition-colors">
              <TreePine className="w-6 h-6 text-accent-gold" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">가계도 만들기</p>
              <p className="text-sm text-muted">배우자, 부모, 형제, 자녀를 단계별로 등록하여 가계도를 완성하세요</p>
            </div>
            <ChevronRight className="w-5 h-5 text-warm-subtle group-hover:text-primary transition-colors" />
          </div>
        </a>
      )}

      {/* Latest Story Hero */}
      {latestStory && (
        <div className="bg-card/50 rounded-xl p-6 mb-6">
          <h2
            className="text-xl font-semibold text-foreground mb-3"
            style={{ fontFamily: "var(--font-story)" }}
          >
            {latestStory.title}
          </h2>
          <p
            className="text-foreground/70 leading-relaxed mb-4 line-clamp-4"
            style={{ fontFamily: "var(--font-story)" }}
          >
            {latestStory.excerpt || latestStory.content.substring(0, 200)}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={latestStory.authorName} size="sm" />
            <span className="text-sm text-foreground font-medium">{latestStory.authorName}</span>
            <span className="date-stamp text-xs">
              {latestStory.createdAt?.toDate && getRelativeTime(latestStory.createdAt.toDate())}
            </span>
          </div>
          <a
            href={`/stories/${latestStory.id}`}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
            style={{ fontFamily: "var(--font-story)" }}
          >
            계속 읽기...
          </a>
        </div>
      )}

      {/* Ornament Divider */}
      <OrnamentDivider className="my-8" />

      {/* Book Progress */}
      <BookProgress
        stories={stories.length}
        media={mediaList.length}
        members={members.length}
        events={events.length}
      />

      {/* Upcoming Event */}
      {upcomingEvent && upcomingEvent.eventDate?.toDate && (
        <div className="mt-8 bg-accent-gold/5 border border-accent-gold/20 rounded-xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-accent-gold" />
            <span className="text-xs text-accent-gold font-semibold tracking-wide">
              {getDDay(upcomingEvent.eventDate.toDate())}
            </span>
          </div>
          <p
            className="text-foreground font-medium"
            style={{ fontFamily: "var(--font-story)" }}
          >
            {upcomingEvent.title}
          </p>
          <p className="text-xs text-muted mt-1">
            {formatDate(upcomingEvent.eventDate.toDate())}
          </p>
        </div>
      )}

      {/* Quick Ink Prompt */}
      <div className="mt-10 mb-4">
        <OrnamentDivider symbol="~" className="mb-6" />
        <a
          href="/stories/new"
          className="block text-center py-6 rounded-xl hover:bg-primary-light/30 transition-all duration-300 group"
        >
          <Feather className="w-5 h-5 text-primary/40 mx-auto mb-3 group-hover:text-primary/70 transition-colors" />
          <p
            className="text-foreground/50 group-hover:text-foreground/70 transition-colors italic"
            style={{ fontFamily: "var(--font-story)" }}
          >
            오늘의 이야기를 남겨보세요...
          </p>
        </a>
      </div>
    </div>
  );
}
