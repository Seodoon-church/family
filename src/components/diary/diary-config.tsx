"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/hooks/use-family";
import { useDiaryData } from "@/hooks/use-diary-data";
import { DiaryProgress, type DiaryStep } from "./diary-progress";
import { Button } from "@/components/ui/button";
import { BookText, Download, Calendar, Feather, Camera, ChevronDown } from "lucide-react";
import {
  fetchImageAsDataUrl,
  generateAvatarDataUrl,
  stripHtmlForPdf,
  truncateText,
} from "@/lib/pdf-utils";
import type { ProcessedMember } from "@/components/pdf/pages/members-page";
import type { ProcessedStory } from "@/components/pdf/pages/story-highlights-page";
import type { CalendarEvent } from "@/components/pdf/pages/calendar-page";
import type { ProcessedPhoto } from "@/components/pdf/pages/photo-gallery-page";
import type { DiaryStats } from "@/components/pdf/pages/stats-closing-page";
import type { FamilyMember } from "@/types/family";


const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export function DiaryConfig() {
  const { userProfile } = useAuth();
  const familyId = userProfile?.familyId;
  const { family } = useFamily(familyId);
  const familyName = family?.name || "우리 가족";

  const { data, loading: dataLoading, error: dataError, loadYear } = useDiaryData(familyId);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [step, setStep] = useState<DiaryStep>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>();

  // 데이터 미리 로드
  const handleLoadYear = async (year: number) => {
    setSelectedYear(year);
    await loadYear(year);
  };

  // 월별 이야기/사진 요약
  const getMonthlySummary = () => {
    if (!data) return [];
    return Array.from({ length: 12 }, (_, month) => {
      const storyCount = data.stories.filter((s) => {
        const d = s.createdAt?.toDate?.();
        return d && d.getMonth() === month;
      }).length;
      const photoCount = data.media.filter((m) => {
        if (m.type !== "PHOTO") return false;
        const d = m.createdAt?.toDate?.();
        return d && d.getMonth() === month;
      }).length;
      const eventCount = data.events.filter((e) => {
        const d = e.eventDate?.toDate?.();
        if (!d) return false;
        if (e.isRecurring) return d.getMonth() === month;
        return d.getMonth() === month;
      }).length;
      return { month, storyCount, photoCount, eventCount };
    });
  };

  // PDF 생성
  const handleGenerate = async () => {
    if (!data) return;

    setStep("loading");
    setProgress(0);
    setErrorMsg(undefined);

    try {
      // 1) 멤버 데이터 가공 + 이미지 변환
      setStep("images");
      const totalImages = data.members.length + data.media.filter((m) => m.type === "PHOTO").length;
      let processedCount = 0;

      const updateProgress = () => {
        processedCount++;
        setProgress(totalImages > 0 ? Math.round((processedCount / totalImages) * 100) : 100);
      };

      // 멤버 프로필 이미지
      const members: ProcessedMember[] = await Promise.all(
        data.members.map(async (member: FamilyMember) => {
          let avatarDataUrl: string;
          if (member.profileImage) {
            const dataUrl = await fetchImageAsDataUrl(member.profileImage);
            avatarDataUrl = dataUrl || generateAvatarDataUrl(member.nameKorean, member.gender);
          } else {
            avatarDataUrl = generateAvatarDataUrl(member.nameKorean, member.gender);
          }
          updateProgress();
          return {
            id: member.id,
            nameKorean: member.nameKorean,
            gender: member.gender,
            generation: member.generation,
            birthYear: member.birthDate?.toDate
              ? member.birthDate.toDate().getFullYear()
              : undefined,
            isAlive: member.isAlive,
            avatarDataUrl,
          };
        })
      );

      // 이야기 가공 (월별)
      const storiesByMonth: Record<number, ProcessedStory[]> = {};
      for (const story of data.stories) {
        const d = story.createdAt?.toDate?.();
        if (!d) continue;
        const month = d.getMonth();
        if (!storiesByMonth[month]) storiesByMonth[month] = [];
        const plainText = stripHtmlForPdf(story.content);
        storiesByMonth[month].push({
          id: story.id,
          title: story.title,
          excerpt: truncateText(plainText, 150),
          category: story.category,
          authorName: story.authorName,
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          month,
        });
      }

      // 이벤트 가공 (월별)
      const eventsByMonth: Record<number, CalendarEvent[]> = {};
      for (const event of data.events) {
        const d = event.eventDate?.toDate?.();
        if (!d) continue;
        const month = d.getMonth();
        const day = d.getDate();
        if (!eventsByMonth[month]) eventsByMonth[month] = [];

        const color =
          event.category === "BIRTHDAY"
            ? "primary"
            : event.category === "ANNIVERSARY"
              ? "gold"
              : "blue";

        eventsByMonth[month].push({
          day,
          label: event.title,
          color,
        });
      }

      // 사진 가공 (최대 30장)
      const photoMedia = data.media
        .filter((m) => m.type === "PHOTO")
        .slice(0, 30);

      const photos: ProcessedPhoto[] = [];
      for (const media of photoMedia) {
        const dataUrl = await fetchImageAsDataUrl(media.downloadUrl);
        updateProgress();
        if (dataUrl) {
          photos.push({
            id: media.id,
            dataUrl,
            caption: media.title || media.fileName || "",
          });
        }
      }

      // 통계 계산
      let maxStories = 0;
      let mostActiveMonthIdx = 0;
      for (let m = 0; m < 12; m++) {
        const count = (storiesByMonth[m] || []).length;
        if (count > maxStories) {
          maxStories = count;
          mostActiveMonthIdx = m;
        }
      }

      const stats: DiaryStats = {
        memberCount: members.length,
        storyCount: data.stories.length,
        photoCount: photos.length,
        eventCount: data.events.length,
        mostActiveMonth: maxStories > 0 ? MONTH_NAMES[mostActiveMonthIdx] : undefined,
      };

      // 2) PDF 생성
      setStep("generating");
      const reactPdf = await import("@react-pdf/renderer");
      const { FamilyDiaryDocument } = await import("@/components/pdf/family-diary-document");
      const React = await import("react");

      const doc = React.createElement(FamilyDiaryDocument, {
        familyName,
        year: data.year,
        members,
        storiesByMonth,
        eventsByMonth,
        photos,
        stats,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await reactPdf.pdf(doc as any).toBlob();

      // 3) 다운로드
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${familyName}_${data.year}_다이어리.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStep("done");
    } catch (err) {
      console.error("PDF generation failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "PDF 생성에 실패했습니다.");
      setStep("error");
    }
  };

  const summary = getMonthlySummary();
  const hasData = data && (data.stories.length > 0 || data.media.length > 0 || data.events.length > 0);
  const isGenerating = step === "loading" || step === "images" || step === "generating";

  return (
    <div className="max-w-2xl mx-auto">
      {/* 연도 선택 */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <label className="text-sm text-muted">연도 선택</label>
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => handleLoadYear(Number(e.target.value))}
            disabled={dataLoading || isGenerating}
            className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-8 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
        {!data && !dataLoading && (
          <Button size="sm" variant="outline" onClick={() => handleLoadYear(selectedYear)}>
            불러오기
          </Button>
        )}
      </div>

      {/* 데이터 로딩 중 */}
      {dataLoading && (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted">데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 데이터 오류 */}
      {dataError && (
        <div className="text-center py-8">
          <p className="text-sm text-accent-red">{dataError}</p>
          <Button size="sm" variant="outline" onClick={() => handleLoadYear(selectedYear)} className="mt-3">
            다시 시도
          </Button>
        </div>
      )}

      {/* 데이터 요약 */}
      {data && !dataLoading && (
        <>
          {/* 전체 요약 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Feather className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-semibold text-foreground">{data.stories.length}</p>
              <p className="text-xs text-muted">이야기</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Camera className="w-5 h-5 text-accent-green mx-auto mb-1" />
              <p className="text-lg font-semibold text-foreground">
                {data.media.filter((m) => m.type === "PHOTO").length}
              </p>
              <p className="text-xs text-muted">사진</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 text-accent-blue mx-auto mb-1" />
              <p className="text-lg font-semibold text-foreground">{data.events.length}</p>
              <p className="text-xs text-muted">이벤트</p>
            </div>
          </div>

          {/* 월별 미리보기 */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">월별 현황</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {summary.map(({ month, storyCount, photoCount }) => {
                const total = storyCount + photoCount;
                return (
                  <div
                    key={month}
                    className={`py-2 px-1 rounded-lg text-xs ${
                      total > 0 ? "bg-primary/5" : "bg-warm-hover/50"
                    }`}
                  >
                    <p className="font-medium text-foreground">{MONTH_NAMES[month]}</p>
                    {total > 0 ? (
                      <p className="text-muted mt-0.5">
                        {storyCount > 0 && `${storyCount}편`}
                        {storyCount > 0 && photoCount > 0 && " · "}
                        {photoCount > 0 && `${photoCount}장`}
                      </p>
                    ) : (
                      <p className="text-muted/50 mt-0.5">—</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 생성 버튼 */}
          <div className="text-center">
            {!hasData ? (
              <div className="py-6">
                <p className="text-sm text-muted mb-2">
                  {selectedYear}년에 기록된 데이터가 없습니다.
                </p>
                <p className="text-xs text-muted">
                  이야기, 사진, 이벤트를 먼저 추가해주세요.
                </p>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {selectedYear}년 다이어리 만들기
                  </>
                )}
              </Button>
            )}
          </div>

          {/* 진행 표시 */}
          <DiaryProgress step={step} progress={progress} error={errorMsg} />
        </>
      )}

      {/* 안내 */}
      {!data && !dataLoading && !dataError && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
            <BookText className="w-8 h-8 text-primary/40" />
          </div>
          <p
            className="text-lg text-foreground mb-2"
            style={{ fontFamily: "var(--font-story)" }}
          >
            가족 연간 다이어리
          </p>
          <p className="text-sm text-muted mb-4">
            한 해 동안의 이야기, 사진, 이벤트를 모아<br />
            아름다운 PDF 다이어리로 만들어 드립니다.
          </p>
          <Button size="sm" onClick={() => handleLoadYear(selectedYear)}>
            {selectedYear}년 데이터 불러오기
          </Button>
        </div>
      )}
    </div>
  );
}
