"use client";


import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Media } from "@/types/media";
import { Image, Play, Mic } from "lucide-react";

interface RecentMediaProps {
  mediaList: Media[];
}

export function RecentMedia({ mediaList }: RecentMediaProps) {
  return (
    <a href="/gallery">
      <Card className="cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Image className="w-4 h-4 text-emerald-600" />
            </div>
            최근 미디어
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mediaList.length === 0 ? (
            <div className="h-24 flex items-center justify-center bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-400">사진과 영상을 올려보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {mediaList.slice(0, 4).map((media) => (
                <div
                  key={media.id}
                  className="aspect-square rounded-xl overflow-hidden border border-gray-100"
                >
                  {media.type === "PHOTO" ? (
                    <img
                      src={media.thumbnailUrl || media.downloadUrl}
                      alt={media.title || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : media.type === "VIDEO" ? (
                    <div className="w-full h-full flex items-center justify-center bg-sky-50">
                      <Play className="w-5 h-5 text-sky-600" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-50">
                      <Mic className="w-5 h-5 text-amber-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
