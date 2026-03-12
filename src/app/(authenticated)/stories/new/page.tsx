"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useStories } from "@/hooks/use-stories";
import { useMedia } from "@/hooks/use-media";
import { StoryEditor } from "@/components/story/story-editor";
import type { AttachedMedia } from "@/components/story/story-editor";
import { ArrowLeft } from "lucide-react";

import type { StoryCategory } from "@/types/story";
import type { Story } from "@/types/story";
import { Timestamp } from "firebase/firestore";

export default function NewStoryPage() {
  const { user, userProfile } = useAuth();
  const { addStory } = useStories(userProfile?.familyId);
  const { uploadMedia } = useMedia(userProfile?.familyId);
  const router = useRouter();
  const [uploadStatus, setUploadStatus] = useState("");

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

    await addStory({
      title: data.title,
      content: data.content,
      excerpt: data.content.substring(0, 150),
      authorId: user.uid,
      authorName: userProfile.displayName,
      category: data.category,
      storyDate: data.storyDate ? Timestamp.fromDate(new Date(data.storyDate)) : undefined,
      mentionedMembers: [],
      mediaUrls,
      isPinned: false,
    } as Omit<Story, "id" | "createdAt" | "updatedAt" | "commentCount">);

    router.push("/stories");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <a href="/stories" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        이야기 목록
      </a>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <StoryEditor onSubmit={handleSubmit} />
        {uploadStatus && (
          <div className="mt-4 text-center">
            <p className="text-sm text-primary animate-pulse">{uploadStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}
