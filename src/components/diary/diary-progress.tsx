"use client";

export type DiaryStep = "idle" | "loading" | "images" | "generating" | "done" | "error";

interface DiaryProgressProps {
  step: DiaryStep;
  progress?: number; // 0-100 for images step
  error?: string;
}

const STEP_LABELS: Record<DiaryStep, string> = {
  idle: "",
  loading: "데이터를 불러오는 중...",
  images: "이미지를 변환하는 중...",
  generating: "PDF를 생성하는 중...",
  done: "완료! 다운로드가 시작됩니다.",
  error: "오류가 발생했습니다.",
};

export function DiaryProgress({ step, progress, error }: DiaryProgressProps) {
  if (step === "idle") return null;

  const label = step === "error" ? error || STEP_LABELS.error : STEP_LABELS[step];
  const isActive = step !== "done" && step !== "error";
  const percentage = step === "images" && progress !== undefined ? progress : step === "done" ? 100 : undefined;

  return (
    <div className="mt-6 p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-3">
        {isActive && (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {step === "done" && (
          <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center shrink-0">
            <span className="text-accent-green text-xs">✓</span>
          </div>
        )}
        {step === "error" && (
          <div className="w-5 h-5 rounded-full bg-accent-red/20 flex items-center justify-center shrink-0">
            <span className="text-accent-red text-xs">!</span>
          </div>
        )}
        <span className="text-sm text-foreground">{label}</span>
      </div>

      {percentage !== undefined && (
        <div className="mt-3 h-1.5 bg-warm-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
