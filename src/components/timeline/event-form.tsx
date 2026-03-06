"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { X } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface EventFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    eventDate: Timestamp;
    category: string;
    isRecurring: boolean;
    location?: string;
    participants: { id: string; name: string }[];
  }) => Promise<void>;
  onCancel: () => void;
}

export function EventForm({ onSubmit, onCancel }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [isRecurring, setIsRecurring] = useState(false);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description: description || undefined,
        eventDate: Timestamp.fromDate(new Date(eventDate)),
        category,
        isRecurring,
        location: location || undefined,
        participants: [],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-heading text-lg">이벤트 추가</h2>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-primary-light">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            id="event-title"
            label="제목 *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="이벤트 제목"
            required
          />

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(EVENT_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>
          </div>

          <Input
            id="event-date"
            label="날짜 *"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />

          <Input
            id="event-location"
            label="장소"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="장소 (선택)"
          />

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="이벤트 설명 (선택)"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm">매년 반복 (생일, 기일 등)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              취소
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "추가 중..." : "추가"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
