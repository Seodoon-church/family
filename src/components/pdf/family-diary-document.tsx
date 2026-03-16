import { Document } from "@react-pdf/renderer";
import "@/lib/pdf-fonts";

import { CoverPage } from "./pages/cover-page";
import { MembersPage, type ProcessedMember } from "./pages/members-page";
import { CalendarPage, type CalendarEvent } from "./pages/calendar-page";
import { StoryHighlightsPage, type ProcessedStory } from "./pages/story-highlights-page";
import { PhotoGalleryPage, type ProcessedPhoto } from "./pages/photo-gallery-page";
import { StatsClosingPage, type DiaryStats } from "./pages/stats-closing-page";

export interface DiaryDocumentProps {
  familyName: string;
  year: number;
  members: ProcessedMember[];
  storiesByMonth: Record<number, ProcessedStory[]>; // 0-11
  eventsByMonth: Record<number, CalendarEvent[]>; // 0-11
  photos: ProcessedPhoto[];
  stats: DiaryStats;
}

export function FamilyDiaryDocument({
  familyName,
  year,
  members,
  storiesByMonth,
  eventsByMonth,
  photos,
  stats,
}: DiaryDocumentProps) {
  // 사진을 6장씩 페이지 분할
  const photoPages: ProcessedPhoto[][] = [];
  for (let i = 0; i < photos.length; i += 6) {
    photoPages.push(photos.slice(i, i + 6));
  }

  return (
    <Document
      title={`${familyName} ${year}년 다이어리`}
      author={familyName}
      subject="가족 연간 다이어리"
    >
      {/* 표지 */}
      <CoverPage
        familyName={familyName}
        year={year}
        memberCount={members.length}
        storyCount={stats.storyCount}
        photoCount={stats.photoCount}
      />

      {/* 구성원 */}
      <MembersPage members={members} />

      {/* 월별 달력 + 이야기 */}
      {Array.from({ length: 12 }, (_, month) => {
        const monthStories = storiesByMonth[month] || [];
        const monthEvents = eventsByMonth[month] || [];

        return (
          <CalendarAndStories
            key={month}
            year={year}
            month={month}
            events={monthEvents}
            stories={monthStories}
          />
        );
      })}

      {/* 사진 갤러리 */}
      {photoPages.map((pagePhotos, i) => (
        <PhotoGalleryPage key={`photos-${i}`} photos={pagePhotos} isFirstPage={i === 0} />
      ))}

      {/* 통계 / 마무리 */}
      <StatsClosingPage stats={stats} year={year} familyName={familyName} />
    </Document>
  );
}

// 월별 달력 + 이야기 쌍
function CalendarAndStories({
  year,
  month,
  events,
  stories,
}: {
  year: number;
  month: number;
  events: CalendarEvent[];
  stories: ProcessedStory[];
}) {
  return (
    <>
      <CalendarPage year={year} month={month} events={events} />
      {stories.length > 0 && <StoryHighlightsPage month={month} stories={stories} />}
    </>
  );
}
