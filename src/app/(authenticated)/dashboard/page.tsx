"use client";


import { useAuth } from "@/lib/auth-context";
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
import { Users, BookOpen, Image, CalendarDays, PenSquare, UserPlus, GitBranchPlus, ChevronRight, Sparkles, TreePine } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "좋은 밤입니다!";
  if (hour < 12) return "좋은 아침입니다!";
  if (hour < 18) return "좋은 오후입니다!";
  return "좋은 저녁입니다!";
}

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
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${days[today.getDay()]}`;

  const stats = [
    { label: "전체 구성원", value: members.length, icon: Users, color: "text-white bg-primary", sub: "가계도 등록" },
    { label: "가족 이야기", value: stories.length, icon: BookOpen, color: "text-white bg-emerald-500", sub: `최근 ${stories.length}건` },
    { label: "미디어", value: mediaList.length, icon: Image, color: "text-white bg-amber-500", sub: "사진/영상" },
    { label: "가족 이벤트", value: events.length, icon: CalendarDays, color: "text-white bg-sky-500", sub: "기념일/모임" },
  ];

  const quickActions = [
    { href: "/stories/new", label: "이야기 쓰기", desc: "가족의 일상을 기록하세요", icon: PenSquare, color: "text-primary bg-primary/10" },
    { href: "/members", label: "구성원 추가", desc: "새 가족을 등록하세요", icon: UserPlus, color: "text-emerald-600 bg-emerald-50" },
    { href: "/tree", label: "가계도 보기", desc: "가족 관계를 한눈에", icon: GitBranchPlus, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-indigo-500 to-violet-500 p-6 md:p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            {dateStr}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {getGreeting()}
          </h1>
          <p className="text-white/80 text-sm">
            우리家 이야기에 오신 것을 환영합니다.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-12 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute right-24 -top-4 w-20 h-20 rounded-full bg-white/5" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-[11px] text-gray-400 mt-1">{stat.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tree Wizard Shortcut - shown when only self is registered */}
      {members.length <= 1 && (
        <a
          href="/setup"
          className="block bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-indigo-100 p-5 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <TreePine className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">가계도 만들기</p>
              <p className="text-sm text-gray-500">배우자, 부모, 형제, 자녀를 단계별로 등록하여 가계도를 완성하세요</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
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
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">빠른 액션</h3>
                <p className="text-[11px] text-gray-400">자주 사용하는 기능</p>
              </div>
            </div>

            <div className="space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a
                    key={action.href + action.label}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{action.label}</p>
                      <p className="text-[11px] text-gray-400">{action.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Family Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">가족 정보</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">등록 구성원</span>
                <span className="font-semibold text-gray-900">{members.length}명</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">작성된 이야기</span>
                <span className="font-semibold text-gray-900">{stories.length}건</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">저장된 미디어</span>
                <span className="font-semibold text-gray-900">{mediaList.length}개</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">등록 이벤트</span>
                <span className="font-semibold text-gray-900">{events.length}건</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
