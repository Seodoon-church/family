"use client";

interface ChapterHeaderProps {
  chapterNumber?: string;
  title: string;
  subtitle?: string;
}

export function ChapterHeader({ chapterNumber, title, subtitle }: ChapterHeaderProps) {
  return (
    <div className="text-center py-8 px-4">
      {chapterNumber && (
        <p className="text-xs tracking-[0.2em] uppercase text-muted mb-1">
          {chapterNumber}
        </p>
      )}
      <h1
        className="text-2xl md:text-3xl font-semibold text-foreground"
        style={{ fontFamily: "var(--font-story)" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted mt-2">{subtitle}</p>
      )}
      {/* Ornament divider */}
      <div className="ornament-divider mt-5">
        <span className="text-accent-gold text-sm">◆</span>
      </div>
    </div>
  );
}
