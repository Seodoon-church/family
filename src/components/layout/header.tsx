"use client";

import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { LogOut, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { userProfile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-primary-light transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-brush text-xl text-primary-dark">우리家 이야기</span>
        </div>

        <div className="flex-1" />

        {userProfile && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{userProfile.displayName}</p>
              <p className="text-xs text-muted">
                {userProfile.role === "ADMIN" ? "관리자" : "구성원"}
              </p>
            </div>
            <Avatar
              name={userProfile.displayName}
              src={userProfile.profileImage}
              size="sm"
            />
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-primary-light transition-colors"
              aria-label="로그아웃"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4 text-muted" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
