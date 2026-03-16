"use client";

import { usePathname } from "next/navigation";
import { BookOpen, Feather, PenLine, MessageCircle, Users } from "lucide-react";

const mobileChapters = [
  { href: "/dashboard", label: "홈", icon: BookOpen, isFab: false },
  { href: "/stories", label: "이야기", icon: Feather, isFab: false },
  { href: "/stories/new", label: "", icon: PenLine, isFab: true },
  { href: "/chat", label: "대화", icon: MessageCircle, isFab: false },
  { href: "/members", label: "인물", icon: Users, isFab: false },
];

export function MobileBookNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 mobile-book-nav h-16 flex items-center justify-around"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      {mobileChapters.map((chapter) => {
        const isActive =
          !chapter.isFab &&
          (pathname === chapter.href ||
            pathname === chapter.href + "/" ||
            pathname.startsWith(chapter.href + "/"));

        if (chapter.isFab) {
          return (
            <a
              key={chapter.href}
              href={chapter.href}
              className="-mt-5 w-12 h-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 flex items-center justify-center"
              aria-label="새 이야기 쓰기"
            >
              <chapter.icon className="w-5 h-5" />
            </a>
          );
        }

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
  );
}
