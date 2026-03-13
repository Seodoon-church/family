"use client";


import { formatDate } from "@/lib/utils";
import { EVENT_CATEGORIES } from "@/lib/constants";
import type { FamilyEvent } from "@/hooks/use-events";
import { Calendar, ArrowRight } from "lucide-react";

interface UpcomingEventsProps {
  events: FamilyEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const now = new Date();

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
    <div className="bg-card rounded-xl border border-border warm-shadow p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent-blue" />
          <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-story)" }}>
            다가오는 날
          </h3>
        </div>
        <a
          href="/timeline"
          className="text-xs text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          전체 보기 <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* Content */}
      {upcomingEvents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <p className="text-sm text-muted mb-1">등록된 이벤트가 없습니다.</p>
          <a href="/timeline" className="text-xs text-primary font-medium">
            가족 기념일을 등록해보세요 &rarr;
          </a>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1">
          {upcomingEvents.map((event) => {
            if (!event) return null;
            const cat = EVENT_CATEGORIES[event.category as keyof typeof EVENT_CATEGORIES];
            const daysUntil = Math.ceil(
              (event.nextDate.getTime() - now.getTime()) / 86400000
            );
            const eventDay = event.nextDate.getDate();
            const eventMonth = event.nextDate.getMonth() + 1;

            // D-day color: cherry for <=3, gold for <=7, primary for rest
            const ddayColor =
              daysUntil <= 3
                ? "bg-accent-red/10 text-accent-red"
                : daysUntil <= 7
                ? "bg-accent-gold/10 text-accent-gold"
                : "bg-primary/10 text-primary";

            return (
              <div
                key={event.id}
                className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
              >
                {/* Date circle badge */}
                <div className="w-11 h-11 rounded-full bg-background border border-border flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-foreground leading-none">{eventDay}</span>
                  <span className="text-[10px] text-muted leading-none mt-0.5">{eventMonth}월</span>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                  <p className="text-[11px] text-muted">
                    {formatDate(event.nextDate)}
                    {cat && ` · ${cat.label}`}
                  </p>
                </div>

                {/* D-day badge */}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${ddayColor}`}>
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
    </div>
  );
}
