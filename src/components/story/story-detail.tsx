"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { GoldCorners } from "@/components/book/gold-corners";
import { PageFooter } from "@/components/book/page-footer";
import { OrnamentDivider } from "@/components/book/ornament-divider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate, getRelativeTime } from "@/lib/utils";
import { STORY_CATEGORIES } from "@/lib/constants";
import type { Story, Comment } from "@/types/story";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { MessageCircle, Send, Pin } from "lucide-react";

interface StoryDetailProps {
  story: Story;
  familyId: string;
  userId: string;
  userName: string;
}

export function StoryDetail({ story, familyId, userId, userName }: StoryDetailProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const category = STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES];

  // 이미지만 필터링 (라이트박스용)
  const imageMedias = (story.mediaUrls || []).filter(
    (m) => m.type === "PHOTO" || m.type?.startsWith("image")
  );

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(
      collection(db, "families", familyId, "stories", story.id, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Comment[];
      setComments(data);
    });

    return unsubscribe;
  }, [familyId, story.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const db = getFirebaseDb();
      await addDoc(
        collection(db, "families", familyId, "stories", story.id, "comments"),
        {
          content: newComment,
          authorId: userId,
          authorName: userName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
      setNewComment("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="relative paper-texture rounded-2xl p-6 md:p-10">
      {/* Gold Corners */}
      <GoldCorners size={28} />

      {/* Story Header - Centered */}
      <div className="text-center mb-8 pt-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary-light text-primary border border-primary/10 font-medium">
            {category?.label || story.category}
          </span>
          {story.isPinned && (
            <span className="flex items-center gap-1 text-xs text-accent-gold">
              <Pin className="w-3 h-3" /> 고정됨
            </span>
          )}
        </div>

        <h1
          className="text-2xl md:text-3xl font-bold text-foreground mb-6"
          style={{ fontFamily: "var(--font-story)" }}
        >
          {story.title}
        </h1>

        <div className="flex items-center justify-center gap-3">
          <Avatar name={story.authorName} size="md" />
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{story.authorName}</p>
            <p className="text-xs text-muted">
              {story.createdAt?.toDate && formatDate(story.createdAt.toDate())}
            </p>
          </div>
        </div>

        {story.storyDate && (
          <p className="date-stamp text-xs mt-3">
            이야기 시점: {formatDate(story.storyDate.toDate())}
          </p>
        )}
      </div>

      {/* Ornament Divider */}
      <OrnamentDivider className="mb-8" />

      {/* Story Content - Prose centered */}
      <div
        className="max-w-prose mx-auto whitespace-pre-wrap text-foreground/80 leading-relaxed"
        style={{ fontFamily: "var(--font-story)" }}
      >
        {story.content}
      </div>

      {/* Media */}
      {story.mediaUrls?.length > 0 && (
        <div className="max-w-prose mx-auto grid grid-cols-2 gap-3 mt-8">
          {story.mediaUrls.map((media, i) => {
            const isImage = media.type === "PHOTO" || media.type?.startsWith("image");
            const isVideo = media.type === "VIDEO" || media.type?.startsWith("video");
            // 이미지 배열 내 인덱스 계산 (라이트박스 연결)
            const imageIndex = isImage
              ? imageMedias.findIndex((m) => m.url === media.url)
              : -1;
            return (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                {isImage ? (
                  <img
                    src={media.url}
                    alt=""
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxIndex(imageIndex)}
                  />
                ) : isVideo ? (
                  <video src={media.url} controls className="w-full" />
                ) : (
                  <audio src={media.url} controls className="w-full p-4" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxIndex !== null && imageMedias.length > 0 && (
        <ImageLightbox
          images={imageMedias}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Mentioned Members */}
      {story.mentionedMembers?.length > 0 && (
        <div className="max-w-prose mx-auto flex items-center gap-2 text-sm text-muted mt-6">
          <span>등장인물:</span>
          {story.mentionedMembers.map((m) => (
            <span key={m.id} className="px-2 py-0.5 rounded-full bg-primary-light text-primary border border-primary/10 text-xs font-medium">
              {m.name}
            </span>
          ))}
        </div>
      )}

      {/* Comments Section - "독자 노트" */}
      <div className="max-w-prose mx-auto pt-8 space-y-4">
        <OrnamentDivider symbol="~" className="mb-4" />
        <h3
          className="text-base font-semibold text-foreground flex items-center gap-2"
          style={{ fontFamily: "var(--font-story)" }}
        >
          <MessageCircle className="w-5 h-5 text-primary" />
          독자 노트 {comments.length}개
        </h3>

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar name={comment.authorName} size="sm" />
            <div className="flex-1 bg-primary-light/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">{comment.authorName}</span>
                <span className="text-xs text-muted">
                  {comment.createdAt?.toDate && getRelativeTime(comment.createdAt.toDate())}
                </span>
              </div>
              <p className="text-sm text-foreground/80">{comment.content}</p>
            </div>
          </div>
        ))}

        {/* Comment Input */}
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
            placeholder="노트를 남겨보세요..."
            className="flex-1 h-11 rounded-xl border border-border bg-card px-4 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || submitting}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Page Footer */}
      <div className="mt-10">
        <PageFooter />
      </div>
    </article>
  );
}
