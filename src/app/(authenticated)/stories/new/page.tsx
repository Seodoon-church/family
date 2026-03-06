"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useStories } from "@/hooks/use-stories";
import { StoryEditor } from "@/components/story/story-editor";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { StoryCategory } from "@/types/story";
import type { Story } from "@/types/story";
import { Timestamp } from "firebase/firestore";

export default function NewStoryPage() {
  const { user, userProfile } = useAuth();
  const { addStory } = useStories(userProfile?.familyId);
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: StoryCategory;
    storyDate?: string;
  }) => {
    if (!user || !userProfile) return;

    await addStory({
      title: data.title,
      content: data.content,
      excerpt: data.content.substring(0, 150),
      authorId: user.uid,
      authorName: userProfile.displayName,
      category: data.category,
      storyDate: data.storyDate ? Timestamp.fromDate(new Date(data.storyDate)) : undefined,
      mentionedMembers: [],
      mediaUrls: [],
      isPinned: false,
    } as Omit<Story, "id" | "createdAt" | "updatedAt" | "commentCount">);

    router.push("/stories");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href="/stories" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        이야기 목록
      </Link>

      <h1 className="font-heading text-2xl">새 이야기 쓰기</h1>

      <Card className="p-6">
        <StoryEditor onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}
