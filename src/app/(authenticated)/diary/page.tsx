"use client";

import { ChapterHeader } from "@/components/book/chapter-header";
import { OrnamentDivider } from "@/components/book/ornament-divider";
import { DiaryConfig } from "@/components/diary/diary-config";

export default function DiaryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <ChapterHeader
        title="가족 연간 다이어리"
        subtitle="한 해의 이야기를 한 권의 책으로"
      />
      <DiaryConfig />
      <OrnamentDivider className="mt-10" />
    </div>
  );
}
