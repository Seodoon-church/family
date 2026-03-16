"use client";

import { usePathname } from "next/navigation";
import {
  BookOpen,
  Feather,
  MessageCircle,
  Users,
  Camera,
  Clock,
  GitBranchPlus,
  BookMarked,
} from "lucide-react";

const chapters = [
  { href: "/dashboard", label: "홈", icon: BookOpen, bgColor: "bg-primary" },
  { href: "/stories", label: "이야기", icon: Feather, bgColor: "bg-accent-gold" },
  { href: "/chat", label: "대화", icon: MessageCircle, bgColor: "bg-accent-blue" },
  { href: "/members", label: "인물", icon: Users, bgColor: "bg-accent-blue" },
  { href: "/gallery", label: "사진첩", icon: Camera, bgColor: "bg-accent-green" },
  { href: "/timeline", label: "연대기", icon: Clock, bgColor: "bg-accent-red" },
  { href: "/tree", label: "가계도", icon: GitBranchPlus, bgColor: "bg-primary" },
  { href: "/settings", label: "판권", icon: BookMarked, bgColor: "bg-muted" },
];

export function BookmarkNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex bookmark-nav" aria-label="Chapter navigation">
      {chapters.map((chapter) => {
        const isActive =
          pathname === chapter.href ||
          pathname === chapter.href + "/" ||
          pathname.startsWith(chapter.href + "/");

        return (
          <a
            key={chapter.href}
            href={chapter.href}
            className={`bookmark-item ${
              isActive ? `active ${chapter.bgColor}` : ""
            }`}
          >
            <chapter.icon className="w-4 h-4 flex-shrink-0" />
            <span>{chapter.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
