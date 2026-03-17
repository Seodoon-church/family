/**
 * 정적 HTML 내보내기 — 가족 데이터를 오프라인 열람 가능한 HTML 파일로 생성
 */
import { saveAs } from "file-saver";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

type ProgressCallback = (progress: number, message: string) => void;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(val: unknown): string {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "toDate" in val) {
    return (val as { toDate: () => Date }).toDate().toLocaleDateString("ko-KR");
  }
  if (typeof val === "string") {
    try {
      return new Date(val).toLocaleDateString("ko-KR");
    } catch {
      return val;
    }
  }
  return "";
}

export async function exportAsHtml(
  familyId: string,
  onProgress?: ProgressCallback
): Promise<void> {
  const db = getFirebaseDb();

  onProgress?.(10, "가족 정보를 불러오는 중...");

  // 1. Family
  const familyDoc = await getDoc(doc(db, "families", familyId));
  const familyData = familyDoc.data();
  const familyName = familyData?.name || "가족";

  onProgress?.(20, "구성원 정보를 불러오는 중...");

  // 2. Members
  const membersSnap = await getDocs(
    query(collection(db, "families", familyId, "members"), orderBy("generation"))
  );
  const members = membersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  onProgress?.(35, "관계 정보를 불러오는 중...");

  // 3. Relationships
  const relsSnap = await getDocs(collection(db, "families", familyId, "relationships"));
  const relationships = relsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  onProgress?.(50, "이야기를 불러오는 중...");

  // 4. Stories
  const storiesSnap = await getDocs(
    query(collection(db, "families", familyId, "stories"), orderBy("createdAt", "desc"))
  );
  const stories = storiesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  onProgress?.(65, "이벤트를 불러오는 중...");

  // 5. Events
  const eventsSnap = await getDocs(
    query(collection(db, "families", familyId, "events"), orderBy("eventDate", "desc"))
  );
  const events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  onProgress?.(80, "HTML을 생성하는 중...");

  // 6. Generate HTML
  const html = generateHtml(familyName, familyData, members, relationships, stories, events);

  onProgress?.(95, "파일을 저장하는 중...");

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const date = new Date().toISOString().split("T")[0];
  saveAs(blob, `${familyName}_가족이야기_${date}.html`);

  onProgress?.(100, "완료!");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateHtml(familyName: string, familyData: any, members: any[], relationships: any[], stories: any[], events: any[]): string {
  // 관계 매핑
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const getRelationships = (memberId: string) => {
    const rels: string[] = [];
    for (const rel of relationships) {
      if (rel.type === "SPOUSE") {
        if (rel.fromId === memberId) {
          const spouse = memberMap.get(rel.toId);
          if (spouse) rels.push(`배우자: ${spouse.nameKorean}`);
        } else if (rel.toId === memberId) {
          const spouse = memberMap.get(rel.fromId);
          if (spouse) rels.push(`배우자: ${spouse.nameKorean}`);
        }
      } else if (rel.type === "PARENT_CHILD") {
        if (rel.fromId === memberId) {
          const child = memberMap.get(rel.toId);
          if (child) rels.push(`자녀: ${child.nameKorean}`);
        } else if (rel.toId === memberId) {
          const parent = memberMap.get(rel.fromId);
          if (parent) rels.push(`부모: ${parent.nameKorean}`);
        }
      }
    }
    return rels;
  };

  // 세대별 그룹
  const generations = new Map<number, typeof members>();
  for (const m of members) {
    const gen = m.generation ?? 0;
    if (!generations.has(gen)) generations.set(gen, []);
    generations.get(gen)!.push(m);
  }

  // 카테고리 라벨
  const categoryLabels: Record<string, string> = {
    MEMORY: "추억", RECIPE: "레시피", TRADITION: "전통", WISDOM: "지혜",
    MILESTONE: "이정표", DAILY: "일상", TRAVEL: "여행", CELEBRATION: "경축",
    HISTORY: "역사", LETTER: "편지", DIARY: "일기", OTHER: "기타",
  };

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(familyName)} — 가족 이야기</title>
<style>
  :root { --primary: #C75B2A; --bg: #FAF7F2; --card: #FFFFFF; --text: #1A1A2E; --muted: #6B7280; --border: #D9CFC3; --gold: #D4A017; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Pretendard', -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; }
  .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
  h1 { font-size: 2.5rem; text-align: center; color: var(--primary); margin-bottom: 8px; }
  .subtitle { text-align: center; color: var(--muted); font-size: 0.9rem; margin-bottom: 40px; }
  .divider { width: 60px; height: 2px; background: var(--gold); margin: 30px auto; }
  h2 { font-size: 1.5rem; color: var(--primary); margin: 40px 0 20px; padding-bottom: 8px; border-bottom: 2px solid var(--border); }
  h3 { font-size: 1.1rem; color: var(--text); margin: 20px 0 10px; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
  .member-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .member-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
  .member-name { font-size: 1.1rem; font-weight: 600; color: var(--text); }
  .member-info { font-size: 0.8rem; color: var(--muted); margin-top: 4px; }
  .member-rels { font-size: 0.75rem; color: var(--primary); margin-top: 8px; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.7rem; margin: 2px; }
  .tag-gen { background: var(--primary); color: white; }
  .tag-cat { background: #FFF5EB; color: var(--primary); border: 1px solid var(--primary); }
  .story-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
  .story-title { font-size: 1.1rem; font-weight: 600; }
  .story-meta { font-size: 0.8rem; color: var(--muted); margin: 6px 0 12px; }
  .story-content { font-size: 0.95rem; line-height: 1.8; }
  .story-content img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
  .event-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .event-date { min-width: 90px; font-size: 0.85rem; color: var(--primary); font-weight: 600; }
  .event-title { font-size: 0.95rem; }
  .event-desc { font-size: 0.8rem; color: var(--muted); }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; text-align: center; margin: 20px 0; }
  .stat-box { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
  .stat-num { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
  .stat-label { font-size: 0.8rem; color: var(--muted); }
  .footer { text-align: center; color: var(--muted); font-size: 0.8rem; margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--border); }
  @media print { body { background: white; } .container { max-width: 100%; } }
</style>
</head>
<body>
<div class="container">
  <h1>${escapeHtml(familyName)}</h1>
  <p class="subtitle">우리 가족의 이야기${familyData?.surname ? ` — ${escapeHtml(familyData.surname)}씨` : ""}${familyData?.clan ? ` ${escapeHtml(familyData.clan)}` : ""}</p>
  <div class="divider"></div>

  <!-- 통계 -->
  <div class="stats">
    <div class="stat-box"><div class="stat-num">${members.length}</div><div class="stat-label">구성원</div></div>
    <div class="stat-box"><div class="stat-num">${stories.length}</div><div class="stat-label">이야기</div></div>
    <div class="stat-box"><div class="stat-num">${events.length}</div><div class="stat-label">이벤트</div></div>
    <div class="stat-box"><div class="stat-num">${relationships.length}</div><div class="stat-label">관계</div></div>
  </div>

  <!-- 구성원 -->
  <h2>구성원</h2>
  ${Array.from(generations.entries())
    .sort(([a], [b]) => a - b)
    .map(([gen, genMembers]) => `
    <h3><span class="tag tag-gen">${gen + 1}세대</span></h3>
    <div class="member-grid">
      ${genMembers.map((m: Record<string, unknown>) => {
        const rels = getRelationships(m.id as string);
        return `<div class="member-card">
          <div class="member-name">${escapeHtml(m.nameKorean as string)}${m.nameHanja ? ` (${escapeHtml(m.nameHanja as string)})` : ""}</div>
          <div class="member-info">
            ${m.gender === "MALE" ? "남" : "여"}
            ${m.birthDate ? ` · ${formatDate(m.birthDate)}` : ""}
            ${m.isAlive === false ? " · 별세" : ""}
          </div>
          ${m.occupation ? `<div class="member-info">${escapeHtml(m.occupation as string)}</div>` : ""}
          ${m.bio ? `<div class="member-info" style="margin-top:6px">${escapeHtml(m.bio as string)}</div>` : ""}
          ${rels.length > 0 ? `<div class="member-rels">${rels.join(" · ")}</div>` : ""}
        </div>`;
      }).join("")}
    </div>
  `).join("")}

  <!-- 이야기 -->
  ${stories.length > 0 ? `
  <h2>이야기</h2>
  ${stories.map((s: Record<string, unknown>) => `
    <div class="story-card">
      <div class="story-title">${escapeHtml(s.title as string)}</div>
      <div class="story-meta">
        <span class="tag tag-cat">${categoryLabels[(s.category as string) || "OTHER"] || "기타"}</span>
        ${s.authorName ? ` · ${escapeHtml(s.authorName as string)}` : ""}
        ${s.createdAt ? ` · ${formatDate(s.createdAt)}` : ""}
      </div>
      <div class="story-content">${s.content || ""}</div>
    </div>
  `).join("")}
  ` : ""}

  <!-- 연대기 -->
  ${events.length > 0 ? `
  <h2>가족 연대기</h2>
  <div class="card">
    ${events.map((e: Record<string, unknown>) => `
      <div class="event-item">
        <div class="event-date">${formatDate(e.eventDate)}</div>
        <div>
          <div class="event-title">${escapeHtml(e.title as string)}</div>
          ${e.description ? `<div class="event-desc">${escapeHtml(e.description as string)}</div>` : ""}
        </div>
      </div>
    `).join("")}
  </div>
  ` : ""}

  <div class="footer">
    <p>${escapeHtml(familyName)} — 우리家 이야기</p>
    <p>생성일: ${new Date().toLocaleDateString("ko-KR")} · www.familya.co.kr</p>
  </div>
</div>
</body>
</html>`;
}
