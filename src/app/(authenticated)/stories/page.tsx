"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStories } from "@/hooks/use-stories";
import { StoryCard } from "@/components/story/story-card";
import { ChapterHeader } from "@/components/book/chapter-header";
import { OrnamentDivider } from "@/components/book/ornament-divider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { STORY_CATEGORIES } from "@/lib/constants";
import { Feather, BookOpen } from "lucide-react";

import type { StoryCategory } from "@/types/story";

export default function StoriesPage() {
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | undefined>();
  const { stories, loading } = useStories(userProfile?.familyId, selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="이야기를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Chapter Header */}
      <ChapterHeader chapterNumber="제1장" title="가족 이야기" />

      {/* Category Filter - Sub-chapter tabs */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-8 px-4">
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
          {stories.map((story, index) => (
            <div key={story.id}>
              <StoryCard story={story} />
              {index < stories.length - 1 && (
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
