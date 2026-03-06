"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { EVENT_CATEGORIES } from "@/lib/constants";
import type { FamilyEvent } from "@/hooks/use-events";
import { Calendar } from "lucide-react";

interface UpcomingEventsProps {
  events: FamilyEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const now = new Date();

  // For recurring events, calculate next occurrence this year
  const upcomingEvents = events
    .map((event) => {
      if (!event.eventDate?.toDate) return null;
      const eventDate = event.eventDate.toDate();

      if (event.isRecurring) {
        const thisYear = new Date(now.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        if (thisYear < now) {
          thisYear.setFullYear(now.getFullYear() + 1);
        }
        return { ...event, nextDate: thisYear };
      }

      if (eventDate >= now) {
        return { ...event, nextDate: eventDate };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.nextDate.getTime() - b!.nextDate.getTime())
    .slice(0, 5);

  return (
    <Link href="/timeline">
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-gold" />
            다가오는 이벤트
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted">등록된 이벤트가 없습니다.</p>
              <p className="text-xs text-primary">가족 기념일을 등록해보세요 &rarr;</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => {
                if (!event) return null;
                const cat = EVENT_CATEGORIES[event.category as keyof typeof EVENT_CATEGORIES];
                const daysUntil = Math.ceil(
                  (event.nextDate.getTime() - now.getTime()) / 86400000
                );

                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted">
                        {formatDate(event.nextDate)}
                        {cat && ` · ${cat.label}`}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-primary shrink-0">
                      {daysUntil === 0
                        ? "오늘"
                        : daysUntil === 1
                        ? "내일"
                        : `D-${daysUntil}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
