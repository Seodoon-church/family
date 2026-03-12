"use client";


import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getRelativeTime } from "@/lib/utils";
import { STORY_CATEGORIES } from "@/lib/constants";
import type { Story } from "@/types/story";
import { BookOpen } from "lucide-react";

interface RecentStoriesProps {
  stories: Story[];
}

export function RecentStories({ stories }: RecentStoriesProps) {
  return (
    <a href="/stories">
      <Card className="cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-sky-600" />
            </div>
            최근 이야기
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stories.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">아직 작성된 이야기가 없습니다.</p>
              <p className="text-xs text-primary font-medium">첫 번째 가족 이야기를 써보세요 &rarr;</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stories.slice(0, 3).map((story) => {
                const cat = STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES];
                return (
                  <div key={story.id} className="border-b border-gray-50 last:border-0 pb-2.5 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {cat?.label || story.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {story.createdAt?.toDate && getRelativeTime(story.createdAt.toDate())}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">{story.title}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
