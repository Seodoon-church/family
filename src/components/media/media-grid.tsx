"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Media } from "@/types/media";
import { Play, Mic, X } from "lucide-react";

interface MediaGridProps {
  mediaList: Media[];
  onDelete?: (media: Media) => void;
}

export function MediaGrid({ mediaList, onDelete }: MediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  if (mediaList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">업로드된 미디어가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {mediaList.map((media) => (
          <div
            key={media.id}
            className="relative group cursor-pointer rounded-xl overflow-hidden border border-border bg-card aspect-square"
            onClick={() => setSelectedMedia(media)}
          >
            {media.type === "PHOTO" ? (
              <img
                src={media.downloadUrl}
                alt={media.title || media.fileName}
                className="w-full h-full object-cover"
              />
            ) : media.type === "VIDEO" ? (
              <div className="w-full h-full flex items-center justify-center bg-accent-blue/10">
                <Play className="w-10 h-10 text-accent-blue" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent-gold/10">
                <Mic className="w-10 h-10 text-accent-gold" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
              <div className="p-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">
                  {media.title || media.fileName}
                </p>
              </div>
            </div>

            {/* Type badge */}
            <div className="absolute top-2 right-2">
              <span className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white",
                media.type === "PHOTO" && "bg-accent-green",
                media.type === "VIDEO" && "bg-accent-blue",
                media.type === "AUDIO" && "bg-accent-gold"
              )}>
                {media.type === "PHOTO" ? "사진" : media.type === "VIDEO" ? "영상" : "음성"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <MediaLightbox
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

function MediaLightbox({
  media,
  onClose,
  onDelete,
}: {
  media: Media;
  onClose: () => void;
  onDelete?: (media: Media) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {media.type === "PHOTO" ? (
          <img
            src={media.downloadUrl}
            alt={media.title || media.fileName}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
        ) : media.type === "VIDEO" ? (
          <video
            src={media.downloadUrl}
            controls
            className="w-full max-h-[80vh] rounded-lg"
            autoPlay
          />
        ) : (
          <div className="bg-card rounded-lg p-8 text-center">
            <Mic className="w-16 h-16 text-accent-gold mx-auto mb-4" />
            <audio src={media.downloadUrl} controls className="w-full" autoPlay />
          </div>
        )}

        {/* Info */}
        <div className="mt-3 text-white/80 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{media.title || media.fileName}</p>
            {media.description && <p className="text-xs mt-1">{media.description}</p>}
          </div>
          {onDelete && (
            <button
              onClick={() => { onDelete(media); onClose(); }}
              className="text-xs text-accent-red hover:text-red-400"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
