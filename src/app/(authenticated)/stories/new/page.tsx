"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useStories } from "@/hooks/use-stories";
import { useMedia } from "@/hooks/use-media";
import { StoryEditor } from "@/components/story/story-editor";
import { ChapterHeader } from "@/components/book/chapter-header";
import { GoldCorners } from "@/components/book/gold-corners";
import type { AttachedMedia } from "@/components/story/story-editor";
import { ArrowLeft } from "lucide-react";
import { stripHtml } from "@/lib/utils";

import type { StoryCategory } from "@/types/story";
import type { Story } from "@/types/story";
import { Timestamp } from "firebase/firestore";

export default function NewStoryPage() {
  const { user, userProfile } = useAuth();
  const { addStory } = useStories(userProfile?.familyId);
  const { uploadMedia } = useMedia(userProfile?.familyId);
  const router = useRouter();
  const [uploadStatus, setUploadStatus] = useState("");

  /** 글 중간 이미지 삽입 — 바로 Storage에 업로드하고 URL 반환 */
  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    if (!user || !userProfile) return null;
    const result = await uploadMedia(file, { title: "inline-image" }, user.uid);
    return result?.downloadUrl ?? null;
  }, [user, userProfile, uploadMedia]);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: StoryCategory;
    storyDate?: string;
    attachedFiles: AttachedMedia[];
  }) => {
    if (!user || !userProfile) return;

    // Upload attached media files first
    const mediaUrls: { url: string; type: string; thumbnail?: string }[] = [];

    if (data.attachedFiles.length > 0) {
      setUploadStatus(`미디어 업로드 중... (0/${data.attachedFiles.length})`);

      for (let i = 0; i < data.attachedFiles.length; i++) {
        const attached = data.attachedFiles[i];
        setUploadStatus(`미디어 업로드 중... (${i + 1}/${data.attachedFiles.length})`);

        const result = await uploadMedia(
          attached.file,
          { title: data.title },
          user.uid
        );

        if (result) {
          mediaUrls.push({
            url: result.downloadUrl,
            type: result.type,
            thumbnail: result.thumbnailUrl,
          });
        }
      }
    }

    setUploadStatus("이야기 저장 중...");

    const storyData: Record<string, unknown> = {
      title: data.title,
      content: data.content,
      excerpt: stripHtml(data.content).substring(0, 150),
      authorId: user.uid,
      authorName: userProfile.displayName,
      category: data.category,
      mentionedMembers: [],
      mediaUrls: mediaUrls.map((m) => ({
        url: m.url,
        type: m.type,
        ...(m.thumbnail ? { thumbnail: m.thumbnail } : {}),
      })),
      isPinned: false,
    };

    if (data.storyDate) {
      storyData.storyDate = Timestamp.fromDate(new Date(data.storyDate));
    }

    await addStory(storyData as Omit<Story, "id" | "createdAt" | "updatedAt" | "commentCount">);

    router.push("/stories");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <a href="/stories" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />
        이야기 목록
      </a>

      {/* Chapter Header */}
      <ChapterHeader title="새로운 한 페이지" />

      {/* Editor in paper-texture with gold corners */}
      <div className="relative paper-texture rounded-2xl border border-border p-6 md:p-8">
        <GoldCorners size={24} />
        <StoryEditor onSubmit={handleSubmit} onImageUpload={handleImageUpload} />
        {uploadStatus && (
          <div className="mt-4 text-center">
            <p className="text-sm text-primary animate-pulse">{uploadStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}
