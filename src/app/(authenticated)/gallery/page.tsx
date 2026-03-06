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
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">미디어 갤러리</h1>
        <Button size="sm" onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4 mr-1" />
          업로드
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: "ALL" as const, label: "전체", icon: null },
          { value: "PHOTO" as const, label: "사진", icon: Image },
          { value: "VIDEO" as const, label: "영상", icon: Video },
          { value: "AUDIO" as const, label: "음성", icon: Mic },
        ].map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={filter === value ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(value)}
          >
            {Icon && <Icon className="w-3 h-3 mr-1" />}
            {label}
            {value !== "ALL" && (
              <span className="ml-1 text-xs">
                ({mediaList.filter((m) => m.type === value).length})
              </span>
            )}
          </Button>
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
