"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getRelativeTime } from "@/lib/utils";
import { STORY_CATEGORIES } from "@/lib/constants";
import type { Story } from "@/types/story";
import { MessageCircle, Pin, Image } from "lucide-react";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const category = STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES];

  return (
    <Link href={`/stories/${story.id}`}>
      <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-3">
          <Avatar name={story.authorName} size="md" />
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{story.authorName}</span>
              <span className="text-xs text-muted">
                {story.createdAt?.toDate && getRelativeTime(story.createdAt.toDate())}
              </span>
              {story.isPinned && <Pin className="w-3 h-3 text-accent-gold" />}
            </div>

            {/* Category Badge */}
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary-light text-primary-dark mb-2">
              {category?.label || story.category}
            </span>

            {/* Title */}
            <h3 className="font-heading font-bold text-foreground mb-1 line-clamp-1">
              {story.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-muted line-clamp-2">
              {story.excerpt || story.content.substring(0, 100)}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted">
              {story.mediaUrls?.length > 0 && (
                <span className="flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  {story.mediaUrls.length}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {story.commentCount}
              </span>
              {story.mentionedMembers?.length > 0 && (
                <span>
                  {story.mentionedMembers.map((m) => m.name).join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          {story.mediaUrls?.[0]?.type?.startsWith("image") && (
            <img
              src={story.mediaUrls[0].url}
              alt=""
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
          )}
        </div>
      </Card>
    </Link>
  );
}
