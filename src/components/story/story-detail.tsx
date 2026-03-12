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
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate, getRelativeTime } from "@/lib/utils";
import { STORY_CATEGORIES } from "@/lib/constants";
import type { Story, Comment } from "@/types/story";
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
  const category = STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES];

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
    <article className="space-y-6">
      {/* Story Header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {category?.label || story.category}
          </span>
          {story.isPinned && (
            <span className="flex items-center gap-1 text-xs text-amber-500">
              <Pin className="w-3 h-3" /> 고정됨
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{story.title}</h1>

        <div className="flex items-center gap-3">
          <Avatar name={story.authorName} size="md" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{story.authorName}</p>
            <p className="text-xs text-gray-400">
              {story.createdAt?.toDate && formatDate(story.createdAt.toDate())}
            </p>
          </div>
        </div>

        {story.storyDate && (
          <p className="text-xs text-gray-400 mt-3 pl-13">
            이야기 시점: {formatDate(story.storyDate.toDate())}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Story Content */}
      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
        {story.content}
      </div>

      {/* Media */}
      {story.mediaUrls?.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {story.mediaUrls.map((media, i) => {
            const isImage = media.type === "PHOTO" || media.type?.startsWith("image");
            const isVideo = media.type === "VIDEO" || media.type?.startsWith("video");
            return (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
                {isImage ? (
                  <img src={media.url} alt="" className="w-full h-48 object-cover" />
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

      {/* Mentioned Members */}
      {story.mentionedMembers?.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>등장인물:</span>
          {story.mentionedMembers.map((m) => (
            <span key={m.id} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {m.name}
            </span>
          ))}
        </div>
      )}

      {/* Comments Section */}
      <div className="border-t border-gray-100 pt-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          댓글 {comments.length}개
        </h3>

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar name={comment.authorName} size="sm" />
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">{comment.authorName}</span>
                <span className="text-xs text-gray-400">
                  {comment.createdAt?.toDate && getRelativeTime(comment.createdAt.toDate())}
                </span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}

        {/* Comment Input */}
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
            placeholder="댓글을 입력하세요..."
            className="flex-1 h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
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
    </article>
  );
}
