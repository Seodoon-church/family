"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitBranchPlus,
  BookOpen,
  Image,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "홈", icon: LayoutDashboard },
  { href: "/tree", label: "가계도", icon: GitBranchPlus },
  { href: "/stories", label: "이야기", icon: BookOpen },
  { href: "/gallery", label: "갤러리", icon: Image },
  { href: "/members", label: "가족", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-0",
                isActive ? "text-primary" : "text-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
