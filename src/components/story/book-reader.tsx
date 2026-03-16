"use client";

import React, { forwardRef, useRef, useState, useCallback, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { STORY_CATEGORIES } from "@/lib/constants";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Story } from "@/types/story";

interface BookReaderProps {
  stories: Story[];
  familyName?: string;
  onClose: () => void;
  initialStoryIndex?: number;
}

// react-pageflip은 각 페이지가 forwardRef여야 함
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className }, ref) => (
    <div ref={ref} className={`book-reader-page ${className || ""}`}>
      {children}
    </div>
  )
);
Page.displayName = "Page";

export function BookReader({ stories, familyName, onClose, initialStoryIndex }: BookReaderProps) {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [lightbox, setLightbox] = useState<{ images: { url: string }[]; index: number } | null>(null);
  const totalPages = stories.length + 3; // 표지 + 목차 + 이야기들 + 끝

  // 화면 꽉 채우는 크기 계산
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pad = vw < 640 ? 16 : 96; // 모바일 16px, 데스크톱 96px (화살표 영역)
      const topBottom = 88; // 상단48 + 하단40
      const availW = vw - pad;
      const availH = vh - topBottom;
      // 비율 ~3:4 (세로가 더 긴 책)
      const ratio = 0.75;
      let w: number, h: number;
      if (availW / availH < ratio) {
        // 너비가 제한
        w = availW;
        h = Math.floor(w / ratio);
      } else {
        // 높이가 제한
        h = availH;
        w = Math.floor(h * ratio);
      }
      setDimensions({ width: w, height: h });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // 초기 페이지로 이동
  useEffect(() => {
    if (initialStoryIndex !== undefined && bookRef.current) {
      setTimeout(() => {
        bookRef.current?.pageFlip()?.turnToPage(initialStoryIndex + 2);
      }, 300);
    }
  }, [initialStoryIndex]);

  // 키보드 네비게이션
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        bookRef.current?.pageFlip()?.flipNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        bookRef.current?.pageFlip()?.flipPrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const goNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);
  const goPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);

  const formatDate = (story: Story) => {
    const d = (story.storyDate?.toDate ? story.storyDate.toDate() : null)
      || (story.createdAt?.toDate ? story.createdAt.toDate() : null);
    if (!d) return "";
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  if (!dimensions) return null; // 크기 계산 전 렌더링 안 함

  const openLightbox = (images: { url: string }[], index: number) => {
    setLightbox({ images, index });
  };

  const pages = buildPages(stories, familyName, formatDate, bookRef, openLightbox);

  return (
    <div className="fixed inset-0 z-50 bg-[#1a120b]/92 flex flex-col items-center justify-center">
      {/* 상단 바 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 h-12 z-10">
        <span className="text-white/60 text-sm" style={{ fontFamily: "var(--font-story)" }}>
          {familyName ? `${familyName} 이야기` : "가족 이야기"}
        </span>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 가운데: 화살표 + 책 */}
      <div className="flex items-center justify-center w-full flex-1 pt-12 pb-10">
        {/* 좌 화살표 */}
        <button
          onClick={goPrev}
          className="text-white/40 hover:text-white/80 p-2 hidden sm:block shrink-0"
        >
          <ChevronLeft className="w-9 h-9" />
        </button>

        {/* 책 모양 래퍼 */}
        <div className="relative shrink-0" style={{ width: dimensions.width, height: dimensions.height }}>
          {/* 책등 (왼쪽 측면) */}
          <div
            className="absolute top-1 -left-[6px] w-[6px] rounded-l-[2px]"
            style={{
              height: dimensions.height - 2,
              background: "linear-gradient(to right, #6B4E12, #8B6914, #A07828)",
              boxShadow: "-3px 2px 10px rgba(0,0,0,0.5)",
            }}
          />
          {/* 책 아래 두께 */}
          <div
            className="absolute -bottom-[5px] left-0 h-[5px] rounded-b-[2px]"
            style={{
              width: dimensions.width,
              background: "linear-gradient(to bottom, #E8DFD4, #C4B8A8)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
            }}
          />
          {/* 페이지 층 (오른쪽에 보이는 페이지 두께) */}
          <div
            className="absolute top-2 -right-[3px] w-[3px]"
            style={{
              height: dimensions.height - 4,
              background: "repeating-linear-gradient(to bottom, #FFFCF8 0px, #F5EDE3 1px, #FFFCF8 2px)",
              boxShadow: "2px 0 4px rgba(0,0,0,0.15)",
            }}
          />

          {/* @ts-expect-error - react-pageflip type issue */}
          <HTMLFlipBook
            ref={bookRef}
            width={dimensions.width}
            height={dimensions.height}
            size="fixed"
            showCover={true}
            flippingTime={700}
            usePortrait={true}
            startZIndex={1}
            autoSize={false}
            maxShadowOpacity={0.5}
            mobileScrollSupport={false}
            clickEventForward={false}
            swipeDistance={30}
            showPageCorners={true}
            drawShadow={true}
            onFlip={(e: any) => setCurrentPage(e.data)}
            className="book-reader-flipbook"
            style={{}}
            startPage={0}
          >
            {pages}
          </HTMLFlipBook>
        </div>

        {/* 우 화살표 */}
        <button
          onClick={goNext}
          className="text-white/40 hover:text-white/80 p-2 hidden sm:block shrink-0"
        >
          <ChevronRight className="w-9 h-9" />
        </button>
      </div>

      {/* 하단: 페이지 + 모바일 네비 */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 h-10 z-10">
        <button onClick={goPrev} className="text-white/50 hover:text-white p-1.5 sm:hidden">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-white/40 text-xs tabular-nums">
          {currentPage + 1} / {totalPages}
        </span>
        <button onClick={goNext} className="text-white/50 hover:text-white p-1.5 sm:hidden">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Image Lightbox */}
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

/** 페이지 배열 빌드 (JSX를 컴포넌트 밖으로 분리) */
function buildPages(
  stories: Story[],
  familyName: string | undefined,
  formatDate: (s: Story) => string,
  bookRef: React.MutableRefObject<any>,
  openLightbox: (images: { url: string }[], index: number) => void
) {
  const pages: React.ReactElement[] = [];

  // ===== 표지 =====
  pages.push(
    <Page key="cover" className="cover-page">
      <div className="flex flex-col items-center justify-center h-full px-8 text-center relative">
        <div className="absolute inset-3 sm:inset-5 border-2 border-[#C8920A]/30 rounded-sm pointer-events-none" />
        <div className="absolute inset-5 sm:inset-7 border border-[#C8920A]/15 rounded-sm pointer-events-none" />
        <div className="w-24 h-24 rounded-full border-2 border-[#A0604B] flex items-center justify-center mb-8">
          <span className="text-4xl text-[#A0604B]" style={{ fontFamily: "var(--font-story)" }}>家</span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#2C1810] mb-3"
          style={{ fontFamily: "var(--font-story)" }}
        >
          {familyName || "우리 가족"}
        </h1>
        <p className="text-xl text-[#A0604B] mb-10" style={{ fontFamily: "var(--font-story)" }}>
          이야기
        </p>
        <div className="w-20 h-px bg-[#C8920A]/40 mb-6" />
        <p className="text-sm text-[#8C7B6B]" style={{ fontFamily: "var(--font-story)" }}>
          {stories.length}편의 이야기가 담겨 있습니다
        </p>
      </div>
    </Page>
  );

  // ===== 목차 =====
  pages.push(
    <Page key="toc" className="toc-page">
      <div className="flex flex-col h-full px-8 sm:px-10 py-10">
        <h2
          className="text-xl font-semibold text-[#A0604B] text-center mb-2"
          style={{ fontFamily: "var(--font-story)" }}
        >
          목 차
        </h2>
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-8 h-px bg-[#C8920A]/30" />
          <span className="text-[#C8920A] text-xs">◆</span>
          <div className="w-8 h-px bg-[#C8920A]/30" />
        </div>
        <div className="flex-1 overflow-hidden space-y-3">
          {stories.map((story, i) => {
            const d = (story.storyDate?.toDate ? story.storyDate.toDate() : null)
              || (story.createdAt?.toDate ? story.createdAt.toDate() : null);
            const dateStr = d ? `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}` : "";
            return (
              <div
                key={story.id}
                className="flex items-baseline gap-2 cursor-pointer hover:text-[#A0604B] transition-colors group"
                onClick={() => bookRef.current?.pageFlip()?.turnToPage(i + 2)}
              >
                <span className="text-xs text-[#8C7B6B] shrink-0 w-6 text-right">{i + 1}.</span>
                <span
                  className="text-sm text-[#2C1810] group-hover:text-[#A0604B] truncate"
                  style={{ fontFamily: "var(--font-story)" }}
                >
                  {story.title}
                </span>
                <span className="border-b border-dotted border-[#D4C8BA] flex-1 min-w-4 mx-1 translate-y-[-3px]" />
                <span className="text-[10px] text-[#A89888] shrink-0">{story.authorName}</span>
                <span className="text-[10px] text-[#C8920A]/60 shrink-0 ml-1">{dateStr}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );

  // ===== 이야기 페이지들 =====
  stories.forEach((story, i) => {
    const cat = STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES];
    pages.push(
      <Page key={story.id} className="story-page">
        <div className="flex flex-col h-full px-8 sm:px-10 py-8">
          {/* 카테고리 */}
          <div className="text-center mb-2">
            <span className="text-[10px] text-[#A0604B] tracking-[0.2em] uppercase">
              {cat?.label || story.category}
            </span>
          </div>

          {/* 제목 */}
          <h2
            className="text-2xl sm:text-3xl font-semibold text-[#2C1810] text-center mb-4 leading-snug"
            style={{ fontFamily: "var(--font-story)" }}
          >
            {story.title}
          </h2>

          {/* 구분선 */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-px bg-[#D4C8BA]" />
            <span className="text-[#C8920A] text-xs">◆</span>
            <div className="w-10 h-px bg-[#D4C8BA]" />
          </div>

          {/* 본문 */}
          <div
            className="flex-1 overflow-hidden text-[15px] leading-[1.9] text-[#2C1810]/80"
            style={{ fontFamily: "var(--font-story)" }}
          >
            {story.content.split("\n").map((p, pi) => (
              <p key={pi} className={p.trim() ? "mb-4 indent-2" : "mb-2"}>
                {p || "\u00A0"}
              </p>
            ))}
          </div>

          {/* 미디어 */}
          {story.mediaUrls?.length > 0 && (() => {
            const imageMedias = story.mediaUrls.filter(
              (m) => m.type === "PHOTO" || m.type?.startsWith("image")
            );
            return (
              <div className="flex gap-2 mt-4 mb-2 overflow-hidden">
                {story.mediaUrls.slice(0, 4).map((media, mi) => {
                  const isImage = media.type === "PHOTO" || media.type?.startsWith("image");
                  const imgIdx = isImage ? imageMedias.findIndex((m) => m.url === media.url) : -1;
                  return (
                    <div
                      key={mi}
                      className={`w-20 h-20 rounded bg-cover bg-center border border-[#E8DFD4] shrink-0 ${isImage ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                      style={{ backgroundImage: `url(${media.thumbnail || media.url})` }}
                      onClick={isImage ? (e) => { e.stopPropagation(); openLightbox(imageMedias, imgIdx); } : undefined}
                    />
                  );
                })}
              </div>
            );
          })()}

          {/* 하단 */}
          <div className="mt-auto pt-4 border-t border-[#E8DFD4]/50">
            <div className="flex items-center justify-between text-xs text-[#A89888]">
              <span>{story.authorName}</span>
              <span>{formatDate(story)}</span>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-[11px] text-[#A89888]">— {i + 1} —</span>
          </div>
        </div>
      </Page>
    );
  });

  // ===== 뒷표지 =====
  pages.push(
    <Page key="back" className="back-cover-page">
      <div className="flex flex-col items-center justify-center h-full px-8 text-center relative">
        <div className="absolute inset-3 sm:inset-5 border-2 border-[#C8920A]/30 rounded-sm pointer-events-none" />
        <div className="w-16 h-px bg-[#C8920A]/40 mb-8" />
        <p className="text-xl text-[#2C1810]/50 mb-3" style={{ fontFamily: "var(--font-story)" }}>
          이야기는 계속됩니다
        </p>
        <p className="text-sm text-[#8C7B6B] mb-10" style={{ fontFamily: "var(--font-story)" }}>
          우리 가족의 소중한 순간들을 기록해주세요
        </p>
        <div className="w-16 h-px bg-[#C8920A]/40" />
      </div>
    </Page>
  );

  return pages;
}
