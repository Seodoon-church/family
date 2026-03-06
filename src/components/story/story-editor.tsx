"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STORY_CATEGORIES } from "@/lib/constants";
import type { StoryCategory } from "@/types/story";
import { Send } from "lucide-react";

interface StoryEditorProps {
  onSubmit: (data: {
    title: string;
    content: string;
    category: StoryCategory;
    storyDate?: string;
  }) => Promise<void>;
}

export function StoryEditor({ onSubmit }: StoryEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<StoryCategory>("MEMORY");
  const [storyDate, setStoryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({ title, content, category, storyDate: storyDate || undefined });
      setTitle("");
      setContent("");
      setStoryDate("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="story-title"
        label="제목 *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="이야기 제목을 입력하세요"
        required
      />

      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STORY_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key as StoryCategory)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                category === key
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-border hover:border-primary/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <Input
        id="story-date"
        label="이야기 시점 (언제의 이야기인가요?)"
        type="date"
        value={storyDate}
        onChange={(e) => setStoryDate(e.target.value)}
      />

      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">내용 *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          placeholder="가족의 이야기를 자유롭게 적어보세요..."
          required
        />
        <p className="text-xs text-muted mt-1">Markdown 문법을 지원합니다.</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || !title.trim() || !content.trim()}>
          <Send className="w-4 h-4 mr-1" />
          {submitting ? "등록 중..." : "이야기 등록"}
        </Button>
      </div>
    </form>
  );
}
