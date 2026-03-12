"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { LogOut, Bell, Search, ChevronDown } from "lucide-react";
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex h-14 items-center px-4 gap-3">
        {/* Logo */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-1"
          aria-label="메뉴"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <a href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">家</span>
          </div>
          <div className="hidden lg:block">
            <p className="font-bold text-sm text-gray-900 leading-tight">우리家 이야기</p>
            <p className="text-[10px] text-gray-400 leading-tight">가족 기록 플랫폼</p>
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
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:flex items-center gap-2 text-gray-500 text-sm">
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline text-gray-400">검색</span>
              <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-mono">⌘K</kbd>
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell className="w-4 h-4 text-gray-500" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

            {/* User Profile */}
            {userProfile ? (
              <div className="flex items-center gap-2 pl-1">
                <Avatar
                  name={userProfile.displayName}
                  src={userProfile.profileImage}
                  size="sm"
                />
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{userProfile.displayName}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {userProfile.role === "ADMIN" ? "관리자" : "구성원"}
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="로그아웃"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{user.email}</span>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
