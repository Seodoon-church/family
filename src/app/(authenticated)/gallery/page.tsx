"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useMedia } from "@/hooks/use-media";
import { MediaGrid } from "@/components/media/media-grid";
import { MediaUpload } from "@/components/media/media-upload";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Upload, Image, Video, Mic } from "lucide-react";
import type { MediaType } from "@/types/media";

export default function GalleryPage() {
  const { user, userProfile } = useAuth();
  const familyId = userProfile?.familyId;
  const { mediaList, loading, uploadProgress, uploadMedia, deleteMedia } = useMedia(familyId);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState<MediaType | "ALL">("ALL");

  const filteredMedia = filter === "ALL"
    ? mediaList
    : mediaList.filter((m) => m.type === filter);

  const handleUpload = async (file: File, metadata: { title?: string; description?: string }) => {
    if (!user) return;
    await uploadMedia(file, metadata, user.uid);
    setShowUpload(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="미디어를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h1
            className="text-xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-story)" }}
          >
            갤러리
          </h1>
          <Button size="sm" onClick={() => setShowUpload(true)}>
            <Upload className="w-4 h-4 mr-1" />
            추억 추가하기
          </Button>
        </div>
        <div className="warm-divider mt-3" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-border pb-2">
        {[
          { value: "ALL" as const, label: "전체", icon: null },
          { value: "PHOTO" as const, label: "사진", icon: Image },
          { value: "VIDEO" as const, label: "영상", icon: Video },
          { value: "AUDIO" as const, label: "음성", icon: Mic },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-1 text-sm px-3 py-1.5 transition-colors ${
              filter === value
                ? "text-primary border-b-2 border-primary font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {label}
            {value !== "ALL" && (
              <span className="ml-1 text-xs">
                ({mediaList.filter((m) => m.type === value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <MediaGrid
        mediaList={filteredMedia}
        onDelete={userProfile?.role === "ADMIN" ? deleteMedia : undefined}
      />

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
