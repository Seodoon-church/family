"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { LogOut, Bell, Search, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const headerTabs = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/members", label: "가족" },
  { href: "/stories", label: "이야기" },
  { href: "/gallery", label: "갤러리" },
  { href: "/timeline", label: "연표" },
];

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, userProfile, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="flex h-16 items-center px-4 gap-3">
        {/* Logo */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-warm-hover transition-colors mr-1"
          aria-label="메뉴"
        >
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <a href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary shadow-sm shadow-primary/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm font-story">家</span>
          </div>
          <div className="hidden lg:block">
            <p className="font-bold text-sm text-foreground leading-tight font-story" style={{ fontFamily: "var(--font-story)" }}>우리家 이야기</p>
            <p className="text-[10px] text-muted leading-tight">가족 기록 플랫폼</p>
          </div>
        </a>

        {/* Header Tabs */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {headerTabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <a
                key={tab.href}
                href={tab.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "text-primary bg-background border-b-2 border-primary font-semibold"
                    : "text-muted hover:bg-warm-hover hover:text-foreground"
                )}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>

        <div className="flex-1" />

        {user && (
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <button className="p-2 rounded-lg hover:bg-warm-hover transition-colors hidden sm:flex items-center gap-2 text-muted text-sm">
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline text-muted">검색</span>
              <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-warm-hover text-muted font-mono">⌘K</kbd>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-warm-hover transition-colors relative">
              <Bell className="w-4 h-4 text-muted" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

            {/* User Profile */}
            {userProfile ? (
              <div className="flex items-center gap-2 pl-1">
                <Avatar
                  name={userProfile.displayName}
                  src={userProfile.profileImage}
                  size="sm"
                />
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground leading-tight">{userProfile.displayName}</p>
                  <p className="text-[10px] text-muted leading-tight">
                    {userProfile.role === "OWNER" ? "소유자" : userProfile.role === "ADMIN" ? "관리자" : "구성원"}
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="p-1 rounded hover:bg-warm-hover transition-colors"
                  title="로그아웃"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-muted" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{user.email}</span>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg hover:bg-warm-hover transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4 text-muted" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
