"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Feather,
  PenLine,
  MessageCircle,
  MoreHorizontal,
  Users,
  GitBranchPlus,
  Camera,
  Clock,
  Settings,
  X,
} from "lucide-react";

const mobileChapters = [
  { href: "/dashboard", label: "홈", icon: BookOpen, isFab: false },
  { href: "/stories", label: "이야기", icon: Feather, isFab: false },
  { href: "/stories/new", label: "", icon: PenLine, isFab: true },
  { href: "/chat", label: "대화", icon: MessageCircle, isFab: false },
  { href: "", label: "더보기", icon: MoreHorizontal, isFab: false, isMore: true },
];

const moreMenuItems = [
  { href: "/members", label: "인물", icon: Users, color: "text-accent-blue" },
  { href: "/tree", label: "가계도", icon: GitBranchPlus, color: "text-primary" },
  { href: "/gallery", label: "사진첩", icon: Camera, color: "text-accent-green" },
  { href: "/timeline", label: "연대기", icon: Clock, color: "text-accent-red" },
  { href: "/settings", label: "설정", icon: Settings, color: "text-muted" },
];

export function MobileBookNav() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  // 더보기 메뉴에 포함된 페이지에 있을 때 "더보기" 탭을 active로
  const isMoreActive = moreMenuItems.some(
    (item) =>
      pathname === item.href ||
      pathname === item.href + "/" ||
      pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* Bottom Sheet Overlay */}
      {showMenu && (
        <div className="md:hidden fixed inset-0 z-[45]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMenu(false)}
          />
          {/* Bottom Sheet */}
          <div className="absolute bottom-16 left-0 right-0 bg-card rounded-t-2xl shadow-xl border-t border-border"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-foreground">전체 메뉴</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="p-1 rounded-full hover:bg-warm-hover text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-3 pb-4 grid grid-cols-3 gap-1">
              {moreMenuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname === item.href + "/" ||
                  pathname.startsWith(item.href + "/");
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-warm-hover"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : item.color}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 mobile-book-nav h-16 flex items-center justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Mobile navigation"
      >
        {mobileChapters.map((chapter) => {
          if (chapter.isFab) {
            return (
              <a
                key="fab"
                href={chapter.href}
                className="-mt-5 w-12 h-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 flex items-center justify-center"
                aria-label="새 이야기 쓰기"
              >
                <chapter.icon className="w-5 h-5" />
              </a>
            );
          }

          if ("isMore" in chapter && chapter.isMore) {
            return (
              <button
                key="more"
                onClick={() => setShowMenu((v) => !v)}
                className={`mobile-book-tab flex flex-col items-center gap-0.5 px-3 py-2 ${
                  isMoreActive || showMenu ? "active text-primary" : "text-muted"
                }`}
              >
                <chapter.icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{chapter.label}</span>
              </button>
            );
          }

          const isActive =
            pathname === chapter.href ||
            pathname === chapter.href + "/" ||
            pathname.startsWith(chapter.href + "/");

          return (
            <a
              key={chapter.href}
              href={chapter.href}
              className={`mobile-book-tab flex flex-col items-center gap-0.5 px-3 py-2 ${
                isActive ? "active text-primary" : "text-muted"
              }`}
            >
              <chapter.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{chapter.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
