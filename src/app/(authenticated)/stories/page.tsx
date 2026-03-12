"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStories } from "@/hooks/use-stories";
import { StoryCard } from "@/components/story/story-card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { STORY_CATEGORIES } from "@/lib/constants";
import { PenSquare, BookOpen } from "lucide-react";

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
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">가족 이야기</h1>
        <a href="/stories/new">
          <Button size="sm">
            <PenSquare className="w-4 h-4 mr-1" />
            글쓰기
          </Button>
        </a>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 ${
            !selectedCategory
              ? "bg-primary text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          전체
        </button>
        {Object.entries(STORY_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key as StoryCategory)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 ${
              selectedCategory === key
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stories List */}
      {stories.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">아직 작성된 이야기가 없습니다</p>
          <p className="text-sm text-gray-500 mb-5">
            가족의 추억, 전통, 레시피 등을 기록해보세요.
          </p>
          <a href="/stories/new">
            <Button>
              <PenSquare className="w-4 h-4 mr-1" />
              첫 번째 이야기 쓰기
            </Button>
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
