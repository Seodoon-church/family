"use client";

import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { EVENT_CATEGORIES } from "@/lib/constants";
import type { FamilyEvent } from "@/hooks/use-events";
import {
  Baby, Flower2, Heart, GraduationCap, Briefcase,
  Calendar, Home, Users, Plane, Star, RotateCcw,
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
}

export function EventTimeline({ events }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-semibold text-lg mb-2">등록된 이벤트가 없습니다</p>
        <p className="text-sm text-gray-500">
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
          <h2 className="font-semibold text-xl text-primary mb-4 sticky top-0 bg-background py-1 z-10">
            {year}년
          </h2>

          <div className="relative pl-8 border-l-2 border-gray-200 space-y-4">
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

                    <Card className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm">
                            {event.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {event.eventDate?.toDate && formatDate(event.eventDate.toDate())}
                            {cat && ` · ${cat.label}`}
                          </p>
                          {event.description && (
                            <p className="text-sm text-gray-900 mt-2">
                              {event.description}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                          )}
                          {event.participants?.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {event.participants.map((p) => (
                                <span
                                  key={p.id}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10"
                                >
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {event.isRecurring && (
                          <span title="매년 반복"><RotateCcw className="w-3 h-3 text-gray-500 shrink-0" /></span>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
