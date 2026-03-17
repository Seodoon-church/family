"use client";

import { formatDate } from "@/lib/utils";
import { EVENT_CATEGORIES } from "@/lib/constants";
import type { FamilyEvent } from "@/hooks/use-events";
import {
  Baby, Flower2, Heart, GraduationCap, Briefcase,
  Calendar, Home, Users, Plane, Star, RotateCcw,
  Pencil, Trash2,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  BIRTH: Baby,
  DEATH: Flower2,
  MARRIAGE: Heart,
  GRADUATION: GraduationCap,
  CAREER: Briefcase,
  ANNIVERSARY: Calendar,
  HOLIDAY: Home,
  REUNION: Users,
  TRAVEL: Plane,
  OTHER: Star,
};

interface EventTimelineProps {
  events: FamilyEvent[];
  onEdit?: (event: FamilyEvent) => void;
  onDelete?: (eventId: string) => void;
}

export function EventTimeline({ events, onEdit, onDelete }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p
          className="font-semibold text-lg text-foreground mb-2"
          style={{ fontFamily: "var(--font-story)" }}
        >
          아직 기록된 순간이 없습니다
        </p>
        <p className="text-sm text-muted">
          출생, 결혼, 졸업 등 가족의 중요한 순간을 기록하세요.
        </p>
      </div>
    );
  }

  // Group by year
  const grouped = events.reduce((acc, event) => {
    const year = event.eventDate?.toDate
      ? event.eventDate.toDate().getFullYear()
      : new Date().getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<number, FamilyEvent[]>);

  const sortedYears = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      {sortedYears.map((year) => (
        <div key={year}>
          <h2 className="mb-4 sticky top-0 bg-background py-1 z-10 flex items-center gap-2">
            <span className="chapter-number text-3xl">{year}</span>
            <span className="text-sm font-semibold text-foreground">년</span>
            <div className="flex-1 h-px bg-border ml-2" />
          </h2>

          <div className="relative pl-8 border-l-2 border-[#E8DFD4] space-y-4">
            {grouped[year]
              .sort((a, b) => {
                const dateA = a.eventDate?.toDate?.()?.getTime() || 0;
                const dateB = b.eventDate?.toDate?.()?.getTime() || 0;
                return dateB - dateA;
              })
              .map((event) => {
                const Icon = iconMap[event.category] || Star;
                const cat = EVENT_CATEGORIES[event.category as keyof typeof EVENT_CATEGORIES];

                return (
                  <div key={event.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                      <Icon className="w-3 h-3 text-primary" />
                    </div>

                    <div className="bg-card rounded-xl border border-border warm-shadow p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-foreground">
                            {event.title}
                          </h3>
                          <p className="date-stamp text-xs mt-0.5">
                            {event.eventDate?.toDate && formatDate(event.eventDate.toDate())}
                            {cat && <span className="text-muted ml-1">· {cat.label}</span>}
                          </p>
                          {event.description && (
                            <p className="text-sm text-foreground/80 mt-2">
                              {event.description}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs text-muted mt-1">{event.location}</p>
                          )}
                          {event.participants?.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {event.participants.map((p) => (
                                <span
                                  key={p.id}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-light text-primary border border-primary/10"
                                >
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {event.isRecurring && (
                            <span title="매년 반복"><RotateCcw className="w-3 h-3 text-muted" /></span>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(event)}
                              className="p-1 rounded hover:bg-primary/10 text-muted hover:text-primary transition-colors"
                              title="수정"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => {
                                if (confirm("이 이벤트를 삭제하시겠습니까?")) {
                                  onDelete(event.id);
                                }
                              }}
                              className="p-1 rounded hover:bg-accent-red/10 text-muted hover:text-accent-red transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
