"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitBranchPlus,
  Users,
  BookOpen,
  Image,
  Clock,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/tree", label: "가계도", icon: GitBranchPlus },
  { href: "/members", label: "가족 구성원", icon: Users },
  { href: "/stories", label: "가족 이야기", icon: BookOpen },
  { href: "/gallery", label: "미디어 갤러리", icon: Image },
  { href: "/timeline", label: "가족 연표", icon: Clock },
  { href: "/settings", label: "설정", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out",
          "md:relative md:translate-x-0 md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
          <span className="font-brush text-lg text-primary-dark">우리家 이야기</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-primary-light"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-primary-light"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="p-3 rounded-lg bg-primary-light/50 border border-border">
            <p className="text-xs text-muted text-center font-heading">
              가문의 뿌리를 기록하다
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
