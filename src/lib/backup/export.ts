import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, getBlob } from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import type {
  BackupManifest,
  BackupFamily,
  BackupMember,
  BackupRelationship,
  BackupStory,
  BackupMedia,
  BackupEvent,
  BackupMessage,
  BackupStats,
  ExportOptions,
} from "@/types/backup";

type ProgressCallback = (progress: number, message: string) => void;

// Firestore Timestamp → ISO string 변환
function toISOString(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === "object" && val !== null && "toDate" in val) {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof val === "string") return val;
  return new Date().toISOString();
}

export async function exportFullBackup(
  familyId: string,
  userId: string,
  userDisplayName: string,
  userEmail: string,
  options: ExportOptions,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const db = getFirebaseDb();
  const storage = getFirebaseStorage();

  onProgress?.(5, "가족 정보를 불러오는 중...");

  // 1. Family 정보
  const familyDoc = await getDoc(doc(db, "families", familyId));
  const familyData = familyDoc.data();
  const family: BackupFamily = {
    id: familyId,
    name: familyData?.name || "",
    description: familyData?.description,
    surname: familyData?.surname,
    clan: familyData?.clan,
    branch: familyData?.branch,
    inviteCode: familyData?.inviteCode,
    createdBy: familyData?.createdBy || "",
    createdAt: toISOString(familyData?.createdAt),
  };

  onProgress?.(10, "구성원 정보를 불러오는 중...");

  // 2. Members
  const membersSnap = await getDocs(
    query(collection(db, "families", familyId, "members"), orderBy("generation"))
  );
  const members: BackupMember[] = membersSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      nameKorean: data.nameKorean || "",
      nameHanja: data.nameHanja,
      nameFull: data.nameFull,
      gender: data.gender || "MALE",
      birthDate: data.birthDate,
      birthDateLunar: data.birthDateLunar,
      deathDate: data.deathDate,
      isAlive: data.isAlive !== false,
      generation: data.generation || 1,
      birthOrder: data.birthOrder || 1,
      generationName: data.generationName,
      generationCount: data.generationCount,
      profileImage: data.profileImage,
      bio: data.bio,
      occupation: data.occupation,
      education: data.education,
      birthPlace: data.birthPlace,
      currentPlace: data.currentPlace,
      linkedUserId: data.linkedUserId || null,
      surname: data.surname,
      clan: data.clan,
      branch: data.branch,
      createdAt: toISOString(data.createdAt),
      updatedAt: toISOString(data.updatedAt),
    };
  });

  onProgress?.(20, "관계 정보를 불러오는 중...");

  // 3. Relationships
  const relsSnap = await getDocs(collection(db, "families", familyId, "relationships"));
  const relationships: BackupRelationship[] = relsSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      type: data.type,
      fromId: data.fromId,
      toId: data.toId,
      marriageDate: data.marriageDate,
      createdAt: toISOString(data.createdAt),
    };
  });

  onProgress?.(30, "이야기를 불러오는 중...");

  // 4. Stories
  const storiesSnap = await getDocs(
    query(collection(db, "families", familyId, "stories"), orderBy("createdAt", "desc"))
  );
  const stories: BackupStory[] = storiesSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || "",
      content: data.content || "",
      excerpt: data.excerpt,
      category: data.category || "OTHER",
      authorId: data.authorId || "",
      authorName: data.authorName || "",
      storyDate: data.storyDate,
      mentionedMembers: data.mentionedMembers || [],
      mediaUrls: data.mediaUrls || [],
      isPinned: data.isPinned || false,
      commentCount: data.commentCount || 0,
      createdAt: toISOString(data.createdAt),
      updatedAt: toISOString(data.updatedAt),
    };
  });

  onProgress?.(40, "이벤트를 불러오는 중...");

  // 5. Events
  const eventsSnap = await getDocs(
    query(collection(db, "families", familyId, "events"), orderBy("eventDate", "desc"))
  );
  const events: BackupEvent[] = eventsSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || "",
      type: data.category || "OTHER",
      date: toISOString(data.eventDate),
      isLunar: data.isLunar || false,
      isRecurring: data.isRecurring || false,
      description: data.description,
      location: data.location,
      participants: data.participants || [],
      createdAt: toISOString(data.createdAt),
    };
  });

  // 6. Media metadata
  const mediaSnap = await getDocs(
    query(collection(db, "families", familyId, "media"), orderBy("createdAt", "desc"))
  );
  const mediaList: BackupMedia[] = mediaSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      type: data.type || "PHOTO",
      fileName: data.fileName || "",
      originalName: data.fileName,
      storagePath: data.storagePath || "",
      mimeType: data.mimeType || "",
      fileSize: data.fileSize || 0,
      width: data.width,
      height: data.height,
      duration: data.duration,
      title: data.title,
      description: data.description,
      dateTaken: data.takenAt ? toISOString(data.takenAt) : undefined,
      location: data.location,
      taggedMembers: (data.taggedMembers || []).map(
        (t: { id: string }) => t.id
      ),
      uploadedBy: data.uploadedBy || "",
      createdAt: toISOString(data.createdAt),
    };
  });

  onProgress?.(45, "대화 기록을 불러오는 중...");

  // 7. Messages (선택)
  let messages: BackupMessage[] = [];
  if (options.includeMessages) {
    const msgsSnap = await getDocs(
      query(collection(db, "families", familyId, "messages"), orderBy("createdAt", "asc"))
    );
    messages = msgsSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        senderId: data.senderId || "",
        senderName: data.senderName || "",
        text: data.text,
        imageUrl: data.imageUrl,
        type: data.type || "TEXT",
        createdAt: toISOString(data.createdAt),
      };
    });
  }

  // 8. ZIP 생성
  const zip = new JSZip();

  onProgress?.(50, "미디어 파일을 다운로드하는 중...");

  // 9. 미디어 파일 다운로드 (선택)
  if (options.includeMedia && mediaList.length > 0) {
    const mediaFolder = zip.folder("media");
    let downloaded = 0;
    for (const media of mediaList) {
      try {
        const storageRef = ref(storage, media.storagePath);
        const blob = await getBlob(storageRef);
        mediaFolder?.file(media.fileName, blob);
        downloaded++;
        const mediaProgress = 50 + (downloaded / mediaList.length) * 40;
        onProgress?.(mediaProgress, `미디어 다운로드 중... (${downloaded}/${mediaList.length})`);
      } catch {
        // 다운로드 실패 시 건너뛰기
      }
    }
    // 미디어 인덱스
    mediaFolder?.file("index.json", JSON.stringify(mediaList, null, 2));
  }

  onProgress?.(92, "통계를 계산하는 중...");

  // 10. 통계
  const stats: BackupStats = {
    memberCount: members.length,
    storyCount: stories.length,
    mediaCount: mediaList.length,
    mediaSize: mediaList.reduce((sum, m) => sum + m.fileSize, 0),
    eventCount: events.length,
    relationshipCount: relationships.length,
    messageCount: messages.length,
  };

  // 11. Manifest
  const manifest: BackupManifest = {
    version: "2.0.0",
    createdAt: new Date().toISOString(),
    generator: "우리家이야기/2.0.0",
    familyId,
    familyName: family.name,
    exportedBy: {
      userId,
      displayName: userDisplayName,
      email: userEmail,
    },
    stats,
  };

  onProgress?.(95, "파일을 생성하는 중...");

  // 12. JSON 파일 추가
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("family.json", JSON.stringify(family, null, 2));
  zip.file("members.json", JSON.stringify(members, null, 2));
  zip.file("relationships.json", JSON.stringify(relationships, null, 2));
  zip.file("stories.json", JSON.stringify(stories, null, 2));
  zip.file("events.json", JSON.stringify(events, null, 2));
  if (options.includeMessages) {
    zip.file("messages.json", JSON.stringify(messages, null, 2));
  }

  // 13. README
  zip.file("README.txt", generateReadme(family.name, stats));

  onProgress?.(98, "ZIP 파일을 압축하는 중...");

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  onProgress?.(100, "완료!");

  return blob;
}

export function downloadBackup(blob: Blob, familyName: string) {
  const date = new Date().toISOString().split("T")[0];
  const fileName = `${familyName}_백업_${date}.zip`;
  saveAs(blob, fileName);
}

function generateReadme(familyName: string, stats: BackupStats): string {
  return `==================================
  ${familyName} - 가족 데이터 백업
==================================

이 파일은 "우리家 이야기" 플랫폼에서 내보낸 가족 데이터 백업입니다.

포함된 데이터:
- 가족 정보 (family.json)
- 구성원 ${stats.memberCount}명 (members.json)
- 관계 ${stats.relationshipCount}건 (relationships.json)
- 이야기 ${stats.storyCount}편 (stories.json)
- 이벤트 ${stats.eventCount}건 (events.json)
${stats.messageCount > 0 ? `- 대화 ${stats.messageCount}건 (messages.json)\n` : ""}\
${stats.mediaCount > 0 ? `- 미디어 ${stats.mediaCount}개 (media/ 폴더)\n` : ""}\

복원 방법:
1. https://www.familya.co.kr 에 로그인합니다.
2. 설정 > 백업 및 복원 메뉴로 이동합니다.
3. "복원" 섹션에서 이 ZIP 파일을 업로드합니다.
4. 안내에 따라 복원을 진행합니다.

주의사항:
- 이 백업에는 개인 정보가 포함되어 있습니다.
- 안전한 장소에 보관하세요.
- 분기별 백업을 권장합니다.

생성일: ${new Date().toLocaleDateString("ko-KR")}
생성기: 우리家이야기 v2.0.0
`;
}
