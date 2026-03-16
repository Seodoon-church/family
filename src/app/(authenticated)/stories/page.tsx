"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/hooks/use-family";
import { useStories } from "@/hooks/use-stories";
import { StoryCard } from "@/components/story/story-card";
import { BookReader } from "@/components/story/book-reader";
import { ChapterHeader } from "@/components/book/chapter-header";
import { OrnamentDivider } from "@/components/book/ornament-divider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { STORY_CATEGORIES } from "@/lib/constants";
import { Feather, BookOpen, ArrowUpDown } from "lucide-react";

import type { StoryCategory } from "@/types/story";
import type { Story } from "@/types/story";

type SortMode = "newest" | "oldest" | "storyDate";

function sortStories(stories: Story[], mode: SortMode): Story[] {
  return [...stories].sort((a, b) => {
    if (mode === "storyDate") {
      const da = a.storyDate?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
      const db = b.storyDate?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
      return db.getTime() - da.getTime(); // 최신 이야기 순
    }
    const da = a.createdAt?.toDate?.() || new Date(0);
    const db = b.createdAt?.toDate?.() || new Date(0);
    return mode === "oldest" ? da.getTime() - db.getTime() : db.getTime() - da.getTime();
  });
}

export default function StoriesPage() {
  const { userProfile } = useAuth();
  const { family } = useFamily(userProfile?.familyId);
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | undefined>();
  const { stories, loading } = useStories(userProfile?.familyId, selectedCategory);
  const [showBookReader, setShowBookReader] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const sortedStories = sortStories(stories, sortMode);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="이야기를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Book Reader 모달 */}
      {showBookReader && stories.length > 0 && (
        <BookReader
          stories={sortedStories}
          familyName={family?.name}
          onClose={() => setShowBookReader(false)}
        />
      )}

      {/* Chapter Header */}
      <ChapterHeader chapterNumber="제1장" title="가족 이야기" />

      {/* 책으로 읽기 버튼 */}
      {stories.length > 0 && (
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowBookReader(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#C8920A]/30 text-[#A0604B] hover:bg-[#C8920A]/10 hover:border-[#C8920A]/50 transition-all duration-200"
            style={{ fontFamily: "var(--font-story)" }}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">책으로 읽기</span>
          </button>
        </div>
      )}

      {/* Category Filter + Sort */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-4 px-4">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`text-sm py-1.5 border-b-2 transition-all duration-200 ${
            !selectedCategory
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          전체
        </button>
        {Object.entries(STORY_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key as StoryCategory)}
            className={`text-sm py-1.5 border-b-2 transition-all duration-200 ${
              selectedCategory === key
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 정렬 */}
      {stories.length > 1 && (
        <div className="flex items-center justify-end gap-1 mb-6 px-4">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
          {(["newest", "oldest", "storyDate"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                sortMode === mode
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {mode === "newest" ? "최신순" : mode === "oldest" ? "오래된순" : "이야기날짜순"}
            </button>
          ))}
        </div>
      )}

      {/* Stories Feed */}
      {stories.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-10 h-10 text-primary/20 mx-auto mb-5" />
          <p
            className="text-lg text-foreground/70 mb-2"
            style={{ fontFamily: "var(--font-story)" }}
          >
            아직 펼쳐지지 않은 이야기
          </p>
          <a
            href="/stories/new"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
            style={{ fontFamily: "var(--font-story)" }}
          >
            첫 이야기를 써보세요
          </a>
        </div>
      ) : (
        <div className="space-y-0">
          {sortedStories.map((story, index) => (
            <div key={story.id}>
              <StoryCard story={story} />
              {index < sortedStories.length - 1 && (
                <OrnamentDivider symbol="·" className="my-2" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Button - Fixed bottom right on mobile, inline on desktop */}
      {stories.length > 0 && (
        <a
          href="/stories/new"
          className="fixed bottom-6 right-6 md:static md:mt-10 md:mb-4 md:flex md:justify-center z-40"
        >
          <div className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all md:shadow-md">
            <Feather className="w-4 h-4" />
            <span className="text-sm font-medium">이야기 쓰기</span>
          </div>
        </a>
      )}
    </div>
  );
}
