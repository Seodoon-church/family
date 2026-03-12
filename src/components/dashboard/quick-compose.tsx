"use client";


import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Image, Calendar, Heart, PenSquare } from "lucide-react";

export function QuickCompose() {
  const { userProfile } = useAuth();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start gap-3">
        <Avatar
          name={userProfile?.displayName || ""}
          src={userProfile?.profileImage}
          size="md"
        />
        <a
          href="/stories/new"
          className="flex-1 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-400 text-sm cursor-pointer"
        >
          오늘 어떤 이야기가 있었나요?
        </a>
      </div>
      <div className="flex items-center gap-1 mt-3 ml-13">
        <a
          href="/stories/new?category=MEMORY"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <Heart className="w-4 h-4" />
          추억
        </a>
        <a
          href="/stories/new?category=DAILY"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          일상
        </a>
        <a
          href="/gallery"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
        >
          <Image className="w-4 h-4" />
          사진
        </a>
        <a
          href="/timeline"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          이벤트
        </a>
      </div>
    </div>
  );
}
