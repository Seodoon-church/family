"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useMedia } from "@/hooks/use-media";
import { MediaUpload } from "@/components/media/media-upload";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChapterHeader } from "@/components/book/chapter-header";
import { OrnamentDivider } from "@/components/book/ornament-divider";
import { Upload, Image, Video, Mic, Play, X, Camera, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaType, Media } from "@/types/media";

export default function GalleryPage() {
  const { user, userProfile } = useAuth();
  const familyId = userProfile?.familyId;
  const { mediaList, loading, uploadProgress, uploadMedia, deleteMedia } = useMedia(familyId);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState<MediaType | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredMedia = (filter === "ALL"
    ? mediaList
    : mediaList.filter((m) => m.type === filter)
  ).sort((a, b) => {
    const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
    const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
    return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
  });

  const selectedMedia = selectedIndex !== null ? filteredMedia[selectedIndex] : null;

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < filteredMedia.length - 1 ? selectedIndex + 1 : 0);
  }, [selectedIndex, filteredMedia.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : filteredMedia.length - 1);
  }, [selectedIndex, filteredMedia.length]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, goNext, goPrev]);

  const handleUpload = async (file: File, metadata: { title?: string; description?: string }) => {
    if (!user) return;
    await uploadMedia(file, metadata, user.uid);
    setShowUpload(false);
  };

  const tiltClasses = ["polaroid-tilt-1", "polaroid-tilt-2", "polaroid-tilt-3", "polaroid-tilt-4"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="추억을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <ChapterHeader
        title="추억 사진첩"
        subtitle="함께한 순간들을 모아둔 앨범"
      />

      <div className="flex justify-center mb-6">
        <Button size="sm" onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4 mr-1" />
          추억 추가하기
        </Button>
      </div>

      {/* Filter tabs + sort */}
      <div className="flex justify-center items-end gap-1 border-b border-border pb-0 mb-8">
        {[
          { value: "ALL" as const, label: "전체", icon: null },
          { value: "PHOTO" as const, label: "사진", icon: Image },
          { value: "VIDEO" as const, label: "영상", icon: Video },
          { value: "AUDIO" as const, label: "음성", icon: Mic },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`relative flex items-center gap-1 text-sm px-4 py-2 transition-colors ${
              filter === value
                ? "text-primary font-semibold border-b-2 border-primary"
                : "text-muted hover:text-foreground"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
            {value !== "ALL" && (
              <span className="ml-1 text-xs">
                ({mediaList.filter((m) => m.type === value).length})
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
          className="flex items-center gap-1 text-xs px-3 py-2 text-muted hover:text-foreground transition-colors ml-2"
          title={sortOrder === "newest" ? "오래된순" : "최신순"}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {sortOrder === "newest" ? "최신순" : "오래된순"}
        </button>
      </div>

      {/* Scrapbook grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary-light mx-auto flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-primary/40" />
          </div>
          <p
            className="text-lg text-foreground mb-2"
            style={{ fontFamily: "var(--font-story)" }}
          >
            아직 추억이 없습니다
          </p>
          <p
            className="text-sm text-muted"
            style={{ fontFamily: "var(--font-story)" }}
          >
            소중한 순간을 사진으로 남겨보세요.
          </p>
        </div>
      ) : (
        <div className="scrapbook-grid">
          {filteredMedia.map((media, idx) => (
            <div
              key={media.id}
              className={cn(
                "polaroid cursor-pointer transition-transform duration-300",
                tiltClasses[idx % 4]
              )}
              onClick={() => setSelectedIndex(idx)}
            >
              {media.type === "PHOTO" ? (
                <img
                  src={media.thumbnailUrl || media.downloadUrl}
                  alt={media.title || media.fileName}
                  className="w-full rounded-sm"
                  loading="lazy"
                />
              ) : media.type === "VIDEO" ? (
                <div className="w-full aspect-video flex items-center justify-center bg-accent-blue/10 rounded-sm">
                  <Play className="w-10 h-10 text-accent-blue" />
                </div>
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-accent-gold/10 rounded-sm">
                  <Mic className="w-10 h-10 text-accent-gold" />
                </div>
              )}
              {/* Caption */}
              <p
                className="text-xs text-muted text-center mt-1 truncate px-1"
                style={{ fontFamily: "var(--font-story)" }}
              >
                {media.title || media.fileName}
              </p>
            </div>
          ))}
        </div>
      )}

      <OrnamentDivider className="mt-10" />

      {/* Lightbox with navigation */}
      {selectedMedia && selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setSelectedIndex(null)}>
          {/* Prev button */}
          {filteredMedia.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
              aria-label="이전 사진"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          )}

          {/* Next button */}
          {filteredMedia.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
              aria-label="다음 사진"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          )}

          {/* Close button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          {filteredMedia.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm">
              {selectedIndex + 1} / {filteredMedia.length}
            </div>
          )}

          {/* Content */}
          <div className="relative max-w-4xl max-h-[85vh] w-full px-14 md:px-20" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === "PHOTO" ? (
              <img
                src={selectedMedia.downloadUrl}
                alt={selectedMedia.title || selectedMedia.fileName}
                className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
              />
            ) : selectedMedia.type === "VIDEO" ? (
              <video
                key={selectedMedia.id}
                src={selectedMedia.downloadUrl}
                controls
                className="w-full max-h-[75vh] rounded-lg"
                autoPlay
              />
            ) : (
              <div className="bg-card rounded-lg p-8 text-center">
                <Mic className="w-16 h-16 text-accent-gold mx-auto mb-4" />
                <audio key={selectedMedia.id} src={selectedMedia.downloadUrl} controls className="w-full" autoPlay />
              </div>
            )}

            <div className="mt-3 text-white/80 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{selectedMedia.title || selectedMedia.fileName}</p>
                {selectedMedia.description && <p className="text-xs mt-1">{selectedMedia.description}</p>}
              </div>
              {(userProfile?.role === "OWNER" || userProfile?.role === "ADMIN") && (
                <button
                  onClick={() => { deleteMedia(selectedMedia); setSelectedIndex(null); }}
                  className="text-xs text-accent-red hover:text-red-400"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <MediaUpload
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
          uploadProgress={uploadProgress}
        />
      )}
    </div>
  );
}
