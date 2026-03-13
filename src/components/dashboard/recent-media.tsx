"use client";


import type { Media } from "@/types/media";
import { Camera, Play, Mic, ArrowRight } from "lucide-react";

interface RecentMediaProps {
  mediaList: Media[];
}

const tiltClasses = [
  "polaroid-tilt-1",
  "polaroid-tilt-2",
  "polaroid-tilt-3",
  "polaroid-tilt-4",
];

export function RecentMedia({ mediaList }: RecentMediaProps) {
  return (
    <div className="bg-card rounded-xl border border-border warm-shadow p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-accent-gold" />
          <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-story)" }}>
            최근 미디어
          </h3>
        </div>
        <a
          href="/gallery"
          className="text-xs text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          전체 보기 <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* Content */}
      {mediaList.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-background rounded-xl py-6">
          <p className="text-sm text-muted">사진과 영상을 올려보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 flex-1">
          {mediaList.slice(0, 4).map((media, idx) => (
            <div
              key={media.id}
              className={`polaroid ${tiltClasses[idx % tiltClasses.length]} transition-transform duration-200`}
            >
              {media.type === "PHOTO" ? (
                <img
                  src={media.thumbnailUrl || media.downloadUrl}
                  alt={media.title || ""}
                  className="w-full aspect-square object-cover rounded-sm"
                />
              ) : media.type === "VIDEO" ? (
                <div className="w-full aspect-square flex items-center justify-center bg-accent-blue/10 rounded-sm">
                  <Play className="w-5 h-5 text-accent-blue" />
                </div>
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-accent-gold/10 rounded-sm">
                  <Mic className="w-5 h-5 text-accent-gold" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
