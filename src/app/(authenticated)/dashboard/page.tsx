"use client";

import { useAuth } from "@/lib/auth-context";
import { useMembers } from "@/hooks/use-members";
import { useStories } from "@/hooks/use-stories";
import { useMedia } from "@/hooks/use-media";
import { useEvents } from "@/hooks/use-events";
import { MiniTree } from "@/components/dashboard/mini-tree";
import { RecentStories } from "@/components/dashboard/recent-stories";
import { RecentMedia } from "@/components/dashboard/recent-media";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const familyId = userProfile?.familyId;
  const { members, loading: membersLoading } = useMembers(familyId);
  const { stories, loading: storiesLoading } = useStories(familyId);
  const { mediaList, loading: mediaLoading } = useMedia(familyId);
  const { events, loading: eventsLoading } = useEvents(familyId);

  const loading = membersLoading || storiesLoading || mediaLoading || eventsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="불러오는 중..." />
      </div>
    );
  }

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl text-foreground">
              환영합니다, <span className="text-primary">{userProfile?.displayName || "가족"}</span>님
            </h1>
            <p className="text-muted text-sm mt-1">
              오늘도 우리 가족의 이야기를 기록해보세요.
            </p>
          </div>
          <p className="text-sm text-muted hidden sm:block">{dateStr}</p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <span className="text-primary font-bold text-lg">{members.length}</span>
            <span className="text-muted ml-1">구성원</span>
          </div>
          <div>
            <span className="text-accent-blue font-bold text-lg">{stories.length}</span>
            <span className="text-muted ml-1">이야기</span>
          </div>
          <div>
            <span className="text-accent-green font-bold text-lg">{mediaList.length}</span>
            <span className="text-muted ml-1">미디어</span>
          </div>
          <div>
            <span className="text-accent-gold font-bold text-lg">{events.length}</span>
            <span className="text-muted ml-1">이벤트</span>
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MiniTree members={members} />
        <RecentStories stories={stories} />
        <RecentMedia mediaList={mediaList} />
        <UpcomingEvents events={events} />
      </div>
    </div>
  );
}
