"use client";

interface PageFooterProps {
  pageLabel?: string;
}

export function PageFooter({ pageLabel }: PageFooterProps) {
  return (
    <div className="page-number">
      {pageLabel || "우리家 이야기"}
    </div>
  );
}
