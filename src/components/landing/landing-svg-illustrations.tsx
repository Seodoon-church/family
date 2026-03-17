interface SvgProps {
  className?: string;
}

export function BookOpenSvg({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true" fill="none">
      <path
        d="M100,15 Q65,8 25,18 L25,100 Q65,90 100,95 Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      <path
        d="M100,15 Q135,8 175,18 L175,100 Q135,90 100,95 Z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      <line x1="100" y1="15" x2="100" y2="95" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      {/* 왼쪽 페이지 텍스트 라인 */}
      <line x1="40" y1="35" x2="85" y2="33" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="42" y1="45" x2="87" y2="43" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="44" y1="55" x2="88" y2="53" stroke="currentColor" strokeWidth="1" opacity="0.18" />
      <line x1="45" y1="65" x2="89" y2="63" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      {/* 오른쪽 페이지 텍스트 라인 */}
      <line x1="115" y1="33" x2="160" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="113" y1="43" x2="158" y2="45" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="112" y1="53" x2="156" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.18" />
    </svg>
  );
}

export function FamilyTreeSvg({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      {/* 루트 */}
      <circle cx="32" cy="10" r="5" strokeWidth="2.5" />
      <line x1="32" y1="15" x2="32" y2="24" strokeWidth="2" />
      {/* 가로 가지 */}
      <line x1="14" y1="24" x2="50" y2="24" strokeWidth="2" />
      {/* 왼쪽 자녀 */}
      <line x1="14" y1="24" x2="14" y2="32" strokeWidth="2" />
      <circle cx="14" cy="37" r="4.5" strokeWidth="2" />
      {/* 중앙 자녀 */}
      <line x1="32" y1="24" x2="32" y2="32" strokeWidth="2" />
      <circle cx="32" cy="37" r="4.5" strokeWidth="2" />
      {/* 오른쪽 자녀 */}
      <line x1="50" y1="24" x2="50" y2="32" strokeWidth="2" />
      <circle cx="50" cy="37" r="4.5" strokeWidth="2" />
      {/* 손자녀 */}
      <line x1="14" y1="41.5" x2="14" y2="48" strokeWidth="1.5" opacity="0.7" />
      <circle cx="14" cy="52" r="3" strokeWidth="1.5" opacity="0.7" />
      <line x1="32" y1="41.5" x2="32" y2="48" strokeWidth="1.5" opacity="0.7" />
      <circle cx="32" cy="52" r="3" strokeWidth="1.5" opacity="0.7" />
      <line x1="50" y1="41.5" x2="50" y2="48" strokeWidth="1.5" opacity="0.7" />
      <circle cx="50" cy="52" r="3" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

export function QuillPenSvg({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      {/* 깃펜 몸통 */}
      <path d="M44,8 C38,14 28,28 22,40 L20,46 L26,44 C32,34 42,20 48,12 Z" strokeWidth="2.5" />
      {/* 펜촉 */}
      <path d="M20,46 L16,56 L26,44" strokeWidth="2" />
      <line x1="16" y1="56" x2="18" y2="52" strokeWidth="1.5" opacity="0.6" />
      {/* 깃털 결 */}
      <path d="M48,12 C50,8 54,4 58,2" strokeWidth="2" opacity="0.7" />
      <path d="M46,14 C50,10 55,7 58,6" strokeWidth="1.5" opacity="0.5" />
      <path d="M44,16 C48,13 53,10 56,10" strokeWidth="1.5" opacity="0.4" />
      {/* 글씨 라인 */}
      <line x1="22" y1="58" x2="48" y2="58" strokeWidth="1.5" opacity="0.35" />
      <line x1="26" y1="62" x2="42" y2="62" strokeWidth="1" opacity="0.25" />
    </svg>
  );
}

export function PolaroidStackSvg({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      {/* 뒤 폴라로이드 (기울어짐) */}
      <g transform="rotate(-6 32 32)">
        <rect x="12" y="8" width="40" height="48" rx="2" strokeWidth="1.5" opacity="0.5" />
      </g>
      {/* 앞 폴라로이드 */}
      <g transform="rotate(3 32 32)">
        <rect x="12" y="8" width="40" height="48" rx="2" strokeWidth="2.5" />
        {/* 이미지 영역 */}
        <rect x="16" y="12" width="32" height="30" rx="1" fill="currentColor" opacity="0.1" />
        {/* 산 풍경 */}
        <path d="M16,38 L26,22 L34,32 L40,26 L48,38 Z" fill="currentColor" opacity="0.2" />
        {/* 태양 */}
        <circle cx="42" cy="18" r="3" fill="currentColor" opacity="0.2" />
      </g>
    </svg>
  );
}

export function ChatBubblesSvg({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      {/* 왼쪽 큰 말풍선 */}
      <path
        d="M6,12 h28 a4,4 0 0 1 4,4 v16 a4,4 0 0 1 -4,4 h-16 l-8,8 v-8 h-4 a4,4 0 0 1 -4,-4 v-16 a4,4 0 0 1 4,-4 z"
        strokeWidth="2.5"
      />
      {/* 말풍선 안의 점 */}
      <circle cx="14" cy="24" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="22" cy="24" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="30" cy="24" r="2" fill="currentColor" opacity="0.6" />
      {/* 오른쪽 작은 말풍선 */}
      <path
        d="M30,28 h24 a4,4 0 0 1 4,4 v12 a4,4 0 0 1 -4,4 h-4 v6 l-6,-6 h-14 a4,4 0 0 1 -4,-4 v-12 a4,4 0 0 1 4,-4 z"
        strokeWidth="2"
        opacity="0.8"
      />
      {/* 하트 */}
      <path
        d="M42,38 l-2,-2 a2,2 0 0 1 2,-3 a2,2 0 0 1 2,3 z"
        fill="currentColor"
        opacity="0.5"
        stroke="none"
      />
    </svg>
  );
}

export function DiaryBookSvg({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      {/* 책 본체 */}
      <rect x="10" y="6" width="38" height="50" rx="3" strokeWidth="2.5" />
      {/* 책등 */}
      <line x1="16" y1="6" x2="16" y2="56" strokeWidth="2" />
      {/* 제목 라인 */}
      <line x1="22" y1="16" x2="42" y2="16" strokeWidth="2" opacity="0.6" />
      <line x1="24" y1="22" x2="38" y2="22" strokeWidth="1.5" opacity="0.5" />
      {/* 리본 북마크 */}
      <path d="M36,6 v18 l4,-4 l4,4 v-18" strokeWidth="1.5" fill="currentColor" opacity="0.25" />
      {/* 장식선 */}
      <line x1="22" y1="32" x2="42" y2="32" strokeWidth="1" opacity="0.3" />
      <line x1="22" y1="36" x2="42" y2="36" strokeWidth="1" opacity="0.3" />
      <line x1="22" y1="40" x2="42" y2="40" strokeWidth="1" opacity="0.3" />
      <line x1="22" y1="44" x2="36" y2="44" strokeWidth="1" opacity="0.25" />
      {/* 연도 표시 */}
      <text x="32" y="50" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="6" fontFamily="serif">2026</text>
    </svg>
  );
}

export function TimelineSvg({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      {/* 세로 메인 라인 */}
      <line x1="20" y1="8" x2="20" y2="58" strokeWidth="2.5" opacity="0.5" />
      {/* 첫 번째 이벤트 */}
      <circle cx="20" cy="14" r="4" strokeWidth="2.5" fill="currentColor" opacity="0.25" />
      <line x1="24" y1="14" x2="32" y2="14" strokeWidth="1.5" opacity="0.5" />
      <line x1="32" y1="14" x2="54" y2="14" strokeWidth="2" opacity="0.35" />
      <line x1="32" y1="18" x2="48" y2="18" strokeWidth="1.5" opacity="0.25" />
      {/* 두 번째 이벤트 */}
      <circle cx="20" cy="30" r="4" strokeWidth="2.5" fill="currentColor" opacity="0.25" />
      <line x1="24" y1="30" x2="32" y2="30" strokeWidth="1.5" opacity="0.5" />
      <line x1="32" y1="30" x2="52" y2="30" strokeWidth="2" opacity="0.35" />
      <line x1="32" y1="34" x2="46" y2="34" strokeWidth="1.5" opacity="0.25" />
      {/* 세 번째 이벤트 */}
      <circle cx="20" cy="46" r="4" strokeWidth="2.5" fill="currentColor" opacity="0.25" />
      <line x1="24" y1="46" x2="32" y2="46" strokeWidth="1.5" opacity="0.5" />
      <line x1="32" y1="46" x2="50" y2="46" strokeWidth="2" opacity="0.35" />
      <line x1="32" y1="50" x2="44" y2="50" strokeWidth="1.5" opacity="0.25" />
    </svg>
  );
}
