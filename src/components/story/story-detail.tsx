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
import { Card } from "@/components/ui/card";
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
    <div className="space-y-6">
      {/* Story Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary-dark">
            {category?.label || story.category}
          </span>
          {story.isPinned && <Pin className="w-3 h-3 text-accent-gold" />}
        </div>

        <h1 className="font-heading text-2xl font-bold mb-2">{story.title}</h1>

        <div className="flex items-center gap-3 text-sm text-muted">
          <Avatar name={story.authorName} size="sm" />
          <span>{story.authorName}</span>
          <span>
            {story.createdAt?.toDate && formatDate(story.createdAt.toDate())}
          </span>
        </div>

        {story.storyDate && (
          <p className="text-xs text-muted mt-2">
            이야기 시점: {formatDate(story.storyDate.toDate())}
          </p>
        )}
      </div>

      {/* Story Content */}
      <Card className="p-6">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
          {story.content}
        </div>
      </Card>

      {/* Media */}
      {story.mediaUrls?.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {story.mediaUrls.map((media, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-border">
              {media.type?.startsWith("image") ? (
                <img src={media.url} alt="" className="w-full h-48 object-cover" />
              ) : media.type?.startsWith("video") ? (
                <video src={media.url} controls className="w-full" />
              ) : (
                <audio src={media.url} controls className="w-full p-4" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mentioned Members */}
      {story.mentionedMembers?.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>등장인물:</span>
          {story.mentionedMembers.map((m) => (
            <span key={m.id} className="px-2 py-0.5 rounded-full bg-primary-light text-xs">
              {m.name}
            </span>
          ))}
        </div>
      )}

      {/* Comments */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          댓글 ({comments.length})
        </h3>

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar name={comment.authorName} size="sm" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.authorName}</span>
                <span className="text-xs text-muted">
                  {comment.createdAt?.toDate && getRelativeTime(comment.createdAt.toDate())}
                </span>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
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
            className="flex-1 h-10 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
    </div>
  );
}
