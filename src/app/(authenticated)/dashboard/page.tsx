"use client";


import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/hooks/use-family";
import { useMembers } from "@/hooks/use-members";
import { useStories } from "@/hooks/use-stories";
import { useMedia } from "@/hooks/use-media";
import { useEvents } from "@/hooks/use-events";
import { QuickCompose } from "@/components/dashboard/quick-compose";
import { MiniTree } from "@/components/dashboard/mini-tree";
import { RecentStories } from "@/components/dashboard/recent-stories";
import { RecentMedia } from "@/components/dashboard/recent-media";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Users, BookOpen, Image, CalendarDays, PenSquare, UserPlus, GitBranchPlus, ChevronRight, Feather, TreePine } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "좋은 밤입니다,";
  if (hour < 12) return "좋은 아침입니다,";
  if (hour < 18) return "좋은 오후입니다,";
  return "좋은 저녁입니다,";
}

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const familyId = userProfile?.familyId;
  const { family } = useFamily(familyId);
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
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${days[today.getDay()]}`;
  const familyName = family?.name || "우리 가족";

  const quickActions = [
    { href: "/stories/new", label: "이야기 쓰기", desc: "가족의 일상을 기록하세요", icon: PenSquare, color: "text-primary bg-primary/10" },
    { href: "/members", label: "구성원 추가", desc: "새 가족을 등록하세요", icon: UserPlus, color: "text-accent-green bg-accent-green/10" },
    { href: "/tree", label: "가계도 보기", desc: "가족 관계를 한눈에", icon: GitBranchPlus, color: "text-accent-gold bg-accent-gold/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Warm Text Greeting */}
      <div className="py-2">
        <p className="text-sm text-muted mb-1" style={{ fontFamily: "var(--font-story)" }}>
          {dateStr}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {getGreeting()}{" "}
          <span className="text-primary" style={{ fontFamily: "var(--font-story)" }}>
            {familyName}
          </span>
        </h1>
      </div>

      {/* Heartbeat Stats Strip */}
      <section className="flex items-center gap-6 py-3 px-5 bg-card rounded-xl border border-border warm-shadow">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Users className="w-4 h-4 text-primary" />
          <span>구성원 <strong>{members.length}</strong>명</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 text-sm text-foreground">
          <BookOpen className="w-4 h-4 text-accent-green" />
          <span>이야기 <strong>{stories.length}</strong>건</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Image className="w-4 h-4 text-accent-gold" />
          <span>추억 <strong>{mediaList.length}</strong>장</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 text-sm text-foreground">
          <CalendarDays className="w-4 h-4 text-accent-blue" />
          <span>이벤트 <strong>{events.length}</strong>건</span>
        </div>
      </section>

      {/* Tree Wizard Shortcut - shown when only self is registered */}
      {members.length <= 1 && (
        <a
          href="/setup"
          className="block bg-card rounded-xl border border-border warm-shadow p-5 hover:shadow-lg transition-all group relative overflow-hidden"
        >
          {/* Gold corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-gold rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-gold rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-gold rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-gold rounded-br-xl" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0 group-hover:bg-accent-gold/20 transition-colors">
              <TreePine className="w-6 h-6 text-accent-gold" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">가계도 만들기</p>
              <p className="text-sm text-muted">배우자, 부모, 형제, 자녀를 단계별로 등록하여 가계도를 완성하세요</p>
            </div>
            <ChevronRight className="w-5 h-5 text-warm-subtle group-hover:text-primary transition-colors" />
          </div>
        </a>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Compose */}
          <QuickCompose />

          {/* Recent Stories & Upcoming Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecentStories stories={stories} />
            <UpcomingEvents events={events} />
          </div>

          {/* Mini Tree & Recent Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MiniTree members={members} />
            <RecentMedia mediaList={mediaList} />
          </div>
        </div>

        {/* Right Column (1/3) - Quick Actions */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border warm-shadow p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Feather className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">빠른 액션</h3>
                <p className="text-[11px] text-muted">자주 사용하는 기능</p>
              </div>
            </div>

            <div className="space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a
                    key={action.href + action.label}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-warm-hover transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{action.label}</p>
                      <p className="text-[11px] text-muted">{action.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-warm-subtle group-hover:text-primary transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Family Info Card */}
          <div className="bg-card rounded-xl border border-border warm-shadow p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3" style={{ fontFamily: "var(--font-story)" }}>가족 정보</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">등록 구성원</span>
                <span className="font-semibold text-foreground">{members.length}명</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">작성된 이야기</span>
                <span className="font-semibold text-foreground">{stories.length}건</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">저장된 미디어</span>
                <span className="font-semibold text-foreground">{mediaList.length}개</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">등록 이벤트</span>
                <span className="font-semibold text-foreground">{events.length}건</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
