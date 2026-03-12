"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitBranchPlus,
  BookOpen,
  Image,
  Users,
  Plus,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "홈", icon: LayoutDashboard },
  { href: "/tree", label: "가계도", icon: GitBranchPlus },
  { href: "/stories/new", label: "", icon: Plus, isFab: true },
  { href: "/gallery", label: "갤러리", icon: Image },
  { href: "/members", label: "가족", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-100 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          if (item.isFab) {
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all active:scale-95"
              >
                <Icon className="w-6 h-6" />
              </a>
            );
          }

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
