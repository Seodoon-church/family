"use client";

interface BookProgressProps {
  stories: number;
  media: number;
  members: number;
  events: number;
}

function calculatePages(stories: number, media: number, members: number, events: number): number {
  return stories + Math.ceil(media / 4) + Math.ceil(members / 2) + Math.ceil(events / 3);
}

export function BookProgress({ stories, media, members, events }: BookProgressProps) {
  const pages = calculatePages(stories, media, members, events);
  const maxPages = Math.max(pages + 10, 50);
  const percentage = Math.min((pages / maxPages) * 100, 100);

  return (
    <div className="text-center py-4 px-4">
      <p
        className="text-sm text-foreground/70 mb-3"
        style={{ fontFamily: "var(--font-story)" }}
      >
        우리 가족 책, 현재 <span className="text-primary font-semibold">{pages}쪽</span>
      </p>
      <div className="book-progress max-w-xs mx-auto mb-3">
        <div className="book-progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-xs text-muted">
        이야기 {stories}건 · 사진 {media}장 · 인물 {members}명 · 순간 {events}건
      </p>
    </div>
  );
}
