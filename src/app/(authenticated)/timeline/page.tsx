"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/hooks/use-events";
import { EventTimeline } from "@/components/timeline/event-timeline";
import { EventForm } from "@/components/timeline/event-form";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChapterHeader } from "@/components/book/chapter-header";
import { OrnamentDivider } from "@/components/book/ornament-divider";
import { Plus } from "lucide-react";

export default function TimelinePage() {
  const { userProfile } = useAuth();
  const { events, loading, addEvent } = useEvents(userProfile?.familyId);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async (data: Parameters<typeof addEvent>[0]) => {
    await addEvent(data);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="연대기를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ChapterHeader
        title="가족 연대기"
        subtitle="시간 속에 새겨진 우리 가족의 발자취"
      />

      <div className="flex justify-center mb-6">
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          순간 기록하기
        </Button>
      </div>

      <EventTimeline events={events} />

      <OrnamentDivider className="mt-10 mb-4" />

      <p
        className="text-center text-sm text-muted pb-8"
        style={{ fontFamily: "var(--font-story)" }}
      >
        계속 이어갈 이야기...
      </p>

      {showForm && (
        <EventForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
