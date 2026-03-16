"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { StoryDetail } from "@/components/story/story-detail";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import type { Story } from "@/types/story";

export function StoryDetailClient() {
  const params = useParams();
  const { user, userProfile } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  // Static export에서 useParams가 '_'를 반환할 수 있으므로 URL에서 직접 추출
  const id = (() => {
    const paramId = params.id as string;
    if (paramId && paramId !== "_") return paramId;
    if (typeof window !== "undefined") {
      const match = window.location.pathname.match(/\/stories\/([^/]+)/);
      if (match) return match[1];
    }
    return paramId;
  })();

  useEffect(() => {
    if (!id || id === "_" || !userProfile?.familyId) return;

    const fetchStory = async () => {
      const db = getFirebaseDb();
      const storyDoc = await getDoc(
        doc(db, "families", userProfile.familyId!, "stories", id)
      );
      if (storyDoc.exists()) {
        setStory({ id: storyDoc.id, ...storyDoc.data() } as Story);
      }
      setLoading(false);
    };

    fetchStory();
  }, [id, userProfile?.familyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="이야기를 불러오는 중..." />
      </div>
    );
  }

  if (!story || !user || !userProfile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted">이야기를 찾을 수 없습니다.</p>
        <a href="/stories">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록으로
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <a href="/stories" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        이야기 목록
      </a>

      <StoryDetail
        story={story}
        familyId={userProfile.familyId!}
        userId={user.uid}
        userName={userProfile.displayName}
      />
    </div>
  );
}
