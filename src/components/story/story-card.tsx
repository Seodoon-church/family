"use client";


import { Avatar } from "@/components/ui/avatar";
import { getRelativeTime } from "@/lib/utils";
import { STORY_CATEGORIES } from "@/lib/constants";
import type { Story } from "@/types/story";
import { MessageCircle, Pin } from "lucide-react";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const category = STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES];

  return (
    <a href={`/stories/${story.id}`}>
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 cursor-pointer group">
        <div className="flex items-start gap-3">
          <Avatar name={story.authorName} size="md" />
          <div className="flex-1 min-w-0">
            {/* Author Row */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-900">{story.authorName}</span>
              <span className="text-xs text-gray-400">
                {story.createdAt?.toDate && getRelativeTime(story.createdAt.toDate())}
              </span>
              {story.isPinned && <Pin className="w-3 h-3 text-amber-500" />}
            </div>

            {/* Title */}
            <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
              {story.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {story.excerpt || story.content.substring(0, 100)}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {category?.label || story.category}
              </span>
              {story.mediaUrls?.length > 0 && (
                <span className="text-xs text-gray-400">
                  미디어 {story.mediaUrls.length}개
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MessageCircle className="w-3.5 h-3.5" />
                {story.commentCount}
              </span>
              {story.mentionedMembers?.length > 0 && (
                <span className="text-xs text-gray-400">
                  {story.mentionedMembers.map((m) => m.name).join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          {story.mediaUrls?.[0] && (story.mediaUrls[0].type === "PHOTO" || story.mediaUrls[0].type?.startsWith("image")) && (
            <img
              src={story.mediaUrls[0].url}
              alt=""
              className="w-20 h-20 rounded-xl object-cover shrink-0"
            />
          )}
        </div>
      </article>
    </a>
  );
}
