"use client";


import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Image, Calendar, Heart, PenSquare } from "lucide-react";

export function QuickCompose() {
  const { userProfile } = useAuth();

  return (
    <div className="bg-card rounded-xl border border-border warm-shadow p-5 paper-texture">
      <div className="flex items-start gap-3">
        <Avatar
          name={userProfile?.displayName || ""}
          src={userProfile?.profileImage}
          size="md"
        />
        <a
          href="/stories/new"
          className="flex-1 px-4 py-3 rounded-xl bg-background hover:bg-warm-hover transition-colors cursor-pointer text-sm italic text-muted"
          style={{ fontFamily: "var(--font-story)" }}
        >
          오늘의 이야기를 남겨보세요...
        </a>
      </div>
      <div className="flex items-center gap-1 mt-3 ml-13">
        <a
          href="/stories/new?category=MEMORY"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted border border-transparent hover:border-accent-red/30 hover:bg-accent-red/5 hover:text-accent-red transition-colors"
        >
          <Heart className="w-4 h-4" />
          추억
        </a>
        <a
          href="/stories/new?category=DAILY"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted border border-transparent hover:border-accent-gold/30 hover:bg-accent-gold/5 hover:text-accent-gold transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          일상
        </a>
        <a
          href="/gallery"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted border border-transparent hover:border-accent-blue/30 hover:bg-accent-blue/5 hover:text-accent-blue transition-colors"
        >
          <Image className="w-4 h-4" />
          사진
        </a>
        <a
          href="/timeline"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted border border-transparent hover:border-accent-green/30 hover:bg-accent-green/5 hover:text-accent-green transition-colors"
        >
          <Calendar className="w-4 h-4" />
          이벤트
        </a>
      </div>
    </div>
  );
}
