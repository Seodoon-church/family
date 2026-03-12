"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { STORY_CATEGORIES, MEDIA_MAX_SIZES } from "@/lib/constants";
import type { StoryCategory } from "@/types/story";
import { Send, ImagePlus, Video, X, Loader2 } from "lucide-react";

export interface AttachedMedia {
  file: File;
  preview: string;
  type: "image" | "video";
}

export interface UploadedMedia {
  url: string;
  type: string;
  thumbnail?: string;
}

interface StoryEditorProps {
  onSubmit: (data: {
    title: string;
    content: string;
    category: StoryCategory;
    storyDate?: string;
    attachedFiles: AttachedMedia[];
  }) => Promise<void>;
}

export function StoryEditor({ onSubmit }: StoryEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<StoryCategory>("MEMORY");
  const [storyDate, setStoryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    setError("");
    const newMedia: AttachedMedia[] = [];

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setError("사진 또는 영상 파일만 첨부할 수 있습니다.");
        continue;
      }

      const maxSize = isImage ? MEDIA_MAX_SIZES.PHOTO : MEDIA_MAX_SIZES.VIDEO;
      if (file.size > maxSize) {
        setError(`${file.name}: 파일 크기가 ${Math.round(maxSize / 1024 / 1024)}MB를 초과합니다.`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      newMedia.push({
        file,
        preview,
        type: isImage ? "image" : "video",
      });
    }

    if (newMedia.length > 0) {
      setAttachedMedia((prev) => [...prev, ...newMedia]);
    }
  }, []);

  const removeMedia = useCallback((index: number) => {
    setAttachedMedia((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        content,
        category,
        storyDate: storyDate || undefined,
        attachedFiles: attachedMedia,
      });
      // Cleanup previews
      attachedMedia.forEach((m) => URL.revokeObjectURL(m.preview));
      setTitle("");
      setContent("");
      setStoryDate("");
      setAttachedMedia([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Immersive Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="w-full text-2xl font-bold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent"
        required
      />

      {/* Category & Date Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(STORY_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key as StoryCategory)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 ${
                category === key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-gray-400">이야기 시점</label>
          <input
            type="date"
            value={storyDate}
            onChange={(e) => setStoryDate(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Content */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[200px] text-base text-gray-700 placeholder:text-gray-300 border-none outline-none bg-transparent resize-y leading-relaxed"
          placeholder="가족의 이야기를 자유롭게 적어보세요..."
          required
        />
      </div>

      {/* Attached Media Preview */}
      {attachedMedia.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {attachedMedia.map((media, index) => (
            <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              {media.type === "image" ? (
                <img
                  src={media.preview}
                  alt={`첨부 ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <video
                  src={media.preview}
                  className="w-full h-32 object-cover"
                />
              )}
              {/* Type badge */}
              <div className="absolute bottom-2 left-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/50 text-white">
                  {media.type === "image" ? "사진" : "영상"}
                </span>
              </div>
              {/* File size */}
              <div className="absolute bottom-2 right-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/50 text-white">
                  {(media.file.size / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Submit Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-primary"
            title="사진 첨부"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-primary"
            title="영상 첨부"
          >
            <Video className="w-5 h-5" />
          </button>
          {attachedMedia.length > 0 && (
            <span className="text-xs text-gray-400 ml-1">
              {attachedMedia.length}개 파일 첨부됨
            </span>
          )}
        </div>
        <Button type="submit" disabled={submitting || !title.trim() || !content.trim()}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              업로드 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-1.5" />
              발행하기
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
