"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Media } from "@/types/media";
import { Image, Play, Mic } from "lucide-react";

interface RecentMediaProps {
  mediaList: Media[];
}

export function RecentMedia({ mediaList }: RecentMediaProps) {
  return (
    <Link href="/gallery">
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-accent-green" />
            최근 미디어
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mediaList.length === 0 ? (
            <div className="h-24 flex items-center justify-center bg-primary-light/30 rounded-lg border border-border">
              <p className="text-sm text-muted">사진과 영상을 올려보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {mediaList.slice(0, 4).map((media) => (
                <div
                  key={media.id}
                  className="aspect-square rounded-lg overflow-hidden border border-border"
                >
                  {media.type === "PHOTO" ? (
                    <img
                      src={media.thumbnailUrl || media.downloadUrl}
                      alt={media.title || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : media.type === "VIDEO" ? (
                    <div className="w-full h-full flex items-center justify-center bg-accent-blue/10">
                      <Play className="w-5 h-5 text-accent-blue" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent-gold/10">
                      <Mic className="w-5 h-5 text-accent-gold" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
