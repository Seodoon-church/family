import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return formatDate(date);
}

export function getGenerationLabel(generation: number): string {
  const labels = ["시조", "2세", "3세", "4세", "5세", "6세", "7세", "8세", "9세", "10세"];
  return labels[generation] || `${generation + 1}세`;
}

/** HTML 태그를 제거하고 텍스트만 반환 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** 기존 plain text 콘텐츠를 HTML로 변환 (하위 호환) */
export function convertLegacyContent(content: string): string {
  if (!content) return "";
  // 이미 HTML 태그가 있으면 그대로 반환
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  // plain text → 줄바꿈을 <p> 태그로 변환
  return content
    .split("\n")
    .map((line) => `<p>${line || "&nbsp;"}</p>`)
    .join("");
}
