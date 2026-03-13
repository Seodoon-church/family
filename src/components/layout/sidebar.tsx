"use client";


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
  PenSquare,
} from "lucide-react";

const navGroups = [
  {
    items: [
      { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
    ],
  },
  {
    label: "가족",
    items: [
      { href: "/tree", label: "가계도", icon: GitBranchPlus },
      { href: "/members", label: "구성원 관리", icon: Users },
    ],
  },
  {
    label: "기록",
    items: [
      { href: "/stories", label: "가족 이야기", icon: BookOpen },
      { href: "/gallery", label: "미디어 갤러리", icon: Image },
      { href: "/timeline", label: "가족 연표", icon: Clock },
    ],
  },
  {
    label: "설정",
    items: [
      { href: "/settings", label: "설정", icon: Settings },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function SidebarNav({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 pb-3">
      {navGroups.map((group, gi) => (
        <div key={gi} className={gi > 0 ? "mt-5" : ""}>
          {group.label && (
            <p className="px-3 mb-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <a
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => onClose()}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer",
                    isActive
                      ? "bg-primary-light text-primary-dark border-l-[3px] border-l-primary"
                      : "text-foreground/70 hover:bg-warm-hover hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-primary" : "text-muted")} />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar - always visible, normal flow */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-full bg-background border-r border-border">
        <div className="p-3">
          <a
            href="/stories/new"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20"
          >
            <PenSquare className="w-4 h-4" />
            이야기 쓰기
          </a>
        </div>
        <SidebarNav pathname={pathname} onClose={onClose} />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar - fixed overlay */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-60 bg-card border-r border-border flex flex-col md:hidden",
          "transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">家</span>
            </div>
            <span className="font-semibold text-foreground">우리家 이야기</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-warm-hover transition-colors"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
        <SidebarNav pathname={pathname} onClose={onClose} />
      </aside>
    </>
  );
}
