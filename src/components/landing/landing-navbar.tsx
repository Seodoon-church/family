"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "기능", href: "#features" },
  { label: "이용방법", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`landing-navbar fixed top-0 left-0 right-0 z-50 ${
        scrolled ? "scrolled" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* 로고 */}
        <a href="/" className="flex items-center gap-2">
          <div className="stamp-seal w-8 h-8 bg-primary/10 flex items-center justify-center">
            <span
              className="text-primary font-bold text-sm"
              style={{ fontFamily: "var(--font-story)" }}
            >
              家
            </span>
          </div>
          <span
            className="text-foreground font-semibold text-base hidden sm:inline"
            style={{ fontFamily: "var(--font-story)" }}
          >
            우리家 이야기
          </span>
        </a>

        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/70 hover:text-primary transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* 데스크톱 CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className="text-sm text-foreground/70 hover:text-primary transition-colors font-medium"
          >
            로그인
          </a>
          <a
            href="/login"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            시작하기
          </a>
        </div>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden p-2 text-foreground/70"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="메뉴 열기"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 모바일 드로어 */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm text-foreground/70 hover:text-primary py-2 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-border flex gap-3">
            <a
              href="/login"
              className="flex-1 text-center py-2 text-sm text-foreground/70 border border-border rounded-lg hover:bg-warm-hover"
            >
              로그인
            </a>
            <a
              href="/login"
              className="flex-1 text-center py-2 text-sm bg-primary text-white rounded-lg font-medium"
            >
              시작하기
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
