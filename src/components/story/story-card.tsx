"use client";

import { STORY_CATEGORIES } from "@/lib/constants";
import { getRelativeTime } from "@/lib/utils";
import type { Story } from "@/types/story";
import { Pin } from "lucide-react";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const category = STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES];

  // storyDate 우선 표시, 없으면 createdAt
  const displayDate = (story.storyDate?.toDate ? story.storyDate.toDate() : null)
    || (story.createdAt?.toDate ? story.createdAt.toDate() : null);
  const month = displayDate ? `${displayDate.getMonth() + 1}월` : "";
  const day = displayDate ? `${displayDate.getDate()}` : "";
  const year = displayDate ? `${displayDate.getFullYear()}` : "";

  return (
    <a href={`/stories/${story.id}`} className="block">
      <article className="flex items-start gap-4 py-4 px-3 journal-border hover:bg-primary-light/20 transition-all duration-200 cursor-pointer group rounded-lg">
        {/* Left: Date margin */}
        <div className="shrink-0 w-12 text-center pt-0.5">
          <p className="text-[10px] text-foreground/40 leading-tight">{year}</p>
          <p className="date-stamp text-[11px] leading-tight">{month}</p>
          <p className="text-lg font-semibold text-foreground/60 leading-tight">{day}</p>
        </div>

        {/* Right: Content area */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1"
              style={{ fontFamily: "var(--font-story)" }}
            >
              {story.title}
            </h3>
            {story.isPinned && <Pin className="w-3 h-3 text-accent-gold shrink-0" />}
          </div>

          {/* Excerpt */}
          <p
            className="text-sm text-foreground/70 line-clamp-2 leading-relaxed mb-2"
            style={{ fontFamily: "var(--font-story)" }}
          >
            {story.excerpt || story.content.substring(0, 100)}
          </p>

          {/* Bottom: Author + Category */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{story.authorName}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-light text-primary border border-primary/10 font-medium">
              {category?.label || story.category}
            </span>
            {displayDate && (
              <span className="text-xs text-muted ml-auto">
                {year !== `${new Date().getFullYear()}`
                  ? `${year}.${displayDate.getMonth() + 1}.${displayDate.getDate()}`
                  : getRelativeTime(displayDate)}
              </span>
            )}
          </div>
        </div>
      </article>
    </a>
  );
}
