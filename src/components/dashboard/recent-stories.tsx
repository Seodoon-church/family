"use client";


import { getRelativeTime } from "@/lib/utils";
import { STORY_CATEGORIES } from "@/lib/constants";
import type { Story } from "@/types/story";
import { BookOpen, ArrowRight } from "lucide-react";

interface RecentStoriesProps {
  stories: Story[];
}

export function RecentStories({ stories }: RecentStoriesProps) {
  return (
    <div className="bg-card rounded-xl border border-border warm-shadow p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-story)" }}>
            최근 이야기
          </h3>
        </div>
        <a
          href="/stories"
          className="text-xs text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          전체 보기 <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* Content */}
      {stories.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <p className="text-sm text-muted mb-1">아직 작성된 이야기가 없습니다.</p>
          <a href="/stories/new" className="text-xs text-primary font-medium">
            첫 번째 가족 이야기를 써보세요 &rarr;
          </a>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {stories.slice(0, 3).map((story) => {
            const cat = STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES];
            return (
              <a
                key={story.id}
                href={`/stories/${story.id}`}
                className="block journal-border pl-3 py-1.5 hover:bg-warm-hover rounded-r-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {cat?.label || story.category}
                  </span>
                  <span className="date-stamp text-[11px]">
                    {story.createdAt?.toDate && getRelativeTime(story.createdAt.toDate())}
                  </span>
                </div>
                <p
                  className="text-sm font-medium text-foreground mt-1 line-clamp-1"
                  style={{ fontFamily: "var(--font-story)" }}
                >
                  {story.title}
                </p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
