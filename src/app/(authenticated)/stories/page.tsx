"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStories } from "@/hooks/use-stories";
import { StoryCard } from "@/components/story/story-card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { STORY_CATEGORIES } from "@/lib/constants";
import { PenLine } from "lucide-react";
import Link from "next/link";
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
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">가족 이야기</h1>
        <Link href="/stories/new">
          <Button size="sm">
            <PenLine className="w-4 h-4 mr-1" />
            이야기 쓰기
          </Button>
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !selectedCategory
              ? "bg-primary text-white border-primary"
              : "bg-white text-foreground border-border hover:border-primary/50"
          }`}
        >
          전체
        </button>
        {Object.entries(STORY_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key as StoryCategory)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              selectedCategory === key
                ? "bg-primary text-white border-primary"
                : "bg-white text-foreground border-border hover:border-primary/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stories List */}
      {stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-heading text-lg mb-2">아직 작성된 이야기가 없습니다</p>
          <p className="text-sm text-muted mb-4">
            가족의 추억, 전통, 레시피 등을 기록해보세요.
          </p>
          <Link href="/stories/new">
            <Button>
              <PenLine className="w-4 h-4 mr-1" />
              첫 번째 이야기 쓰기
            </Button>
          </Link>
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
