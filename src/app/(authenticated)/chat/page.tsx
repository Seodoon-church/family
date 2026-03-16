"use client";

import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/hooks/use-family";
import { ChatRoom } from "@/components/chat/chat-room";
import { ChapterHeader } from "@/components/book/chapter-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ChatPage() {
  const { userProfile } = useAuth();
  const { family } = useFamily(userProfile?.familyId);

  if (!userProfile?.familyId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="불러오는 중..." />
      </div>
    );
  }

  return (
    <div>
      <ChapterHeader
        title={family?.name ? `${family.name} 대화방` : "가족 대화방"}
      />
      <ChatRoom
        familyId={userProfile.familyId}
        currentUserId={userProfile.id}
        currentUserName={userProfile.displayName}
        currentUserImage={userProfile.profileImage}
      />
    </div>
  );
}
