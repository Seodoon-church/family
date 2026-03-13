"use client";

interface BookSpineProps {
  familyName: string;
  pageCount: number;
}

export function BookSpine({ familyName, pageCount }: BookSpineProps) {
  return (
    <div className="hidden md:flex book-spine h-screen flex-col items-center justify-between py-6 flex-shrink-0">
      {/* Stamp seal logo */}
      <a href="/dashboard" className="stamp-seal flex items-center justify-center w-8 h-8">
        <span
          className="text-white text-sm font-bold"
          style={{ fontFamily: "var(--font-story)" }}
        >
          家
        </span>
      </a>

      {/* Family name in vertical text */}
      <div className="flex-1 flex items-center justify-center py-4">
        <span className="spine-text text-xs tracking-widest">
          {familyName || "우리家"}
        </span>
      </div>

      {/* Page count at bottom */}
      <div className="spine-text text-[10px] opacity-60">
        현재 {pageCount}쪽
      </div>
    </div>
  );
}
