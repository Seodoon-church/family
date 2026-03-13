"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/hooks/use-events";
import { EventTimeline } from "@/components/timeline/event-timeline";
import { EventForm } from "@/components/timeline/event-form";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
        <LoadingSpinner text="연표를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h1
            className="text-xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-story)" }}
          >
            가족 연표
          </h1>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            순간 기록하기
          </Button>
        </div>
        <div className="warm-divider mt-3" />
      </div>

      <EventTimeline events={events} />

      {showForm && (
        <EventForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
