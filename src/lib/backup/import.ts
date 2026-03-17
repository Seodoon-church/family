import JSZip from "jszip";
import {
  collection,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import type {
  BackupManifest,
  BackupMember,
  BackupRelationship,
  BackupStory,
  BackupEvent,
  BackupMessage,
  ImportOptions,
  ImportResult,
} from "@/types/backup";

type ProgressCallback = (progress: number, message: string) => void;

const CURRENT_VERSION = "2.0.0";
const BATCH_LIMIT = 450; // Firestore batch limit is 500

function isVersionCompatible(backupVersion: string): boolean {
  const [backupMajor] = backupVersion.split(".").map(Number);
  const [currentMajor] = CURRENT_VERSION.split(".").map(Number);
  return backupMajor <= currentMajor;
}

function toTimestamp(isoString?: string): Timestamp | null {
  if (!isoString) return null;
  try {
    return Timestamp.fromDate(new Date(isoString));
  } catch {
    return null;
  }
}

export async function importFromBackup(
  file: File,
  targetFamilyId: string,
  options: ImportOptions,
  onProgress?: ProgressCallback
): Promise<ImportResult> {
  const db = getFirebaseDb();
  const storage = getFirebaseStorage();
  const errors: string[] = [];
  let skipped = 0;

  onProgress?.(5, "ZIP 파일을 읽는 중...");

  // 1. ZIP 읽기
  const zip = await JSZip.loadAsync(file);

  onProgress?.(10, "매니페스트를 확인하는 중...");

  // 2. Manifest 확인
  const manifestFile = zip.file("manifest.json");
  if (!manifestFile) {
    return {
      success: false,
      stats: { membersImported: 0, storiesImported: 0, mediaImported: 0, eventsImported: 0, relationshipsImported: 0, messagesImported: 0, skipped: 0, errors: ["manifest.json이 없습니다."] },
    };
  }

  const manifest: BackupManifest = JSON.parse(await manifestFile.async("text"));

  if (!isVersionCompatible(manifest.version)) {
    return {
      success: false,
      stats: { membersImported: 0, storiesImported: 0, mediaImported: 0, eventsImported: 0, relationshipsImported: 0, messagesImported: 0, skipped: 0, errors: [`호환되지 않는 백업 버전입니다: ${manifest.version}`] },
    };
  }

  // 3. Members
  onProgress?.(20, "구성원 정보를 복원하는 중...");
  let membersImported = 0;
  const membersFile = zip.file("members.json");
  if (membersFile) {
    const members: BackupMember[] = JSON.parse(await membersFile.async("text"));
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const member of members) {
      const memberRef = doc(collection(db, "families", targetFamilyId, "members"), member.id);
      batch.set(memberRef, {
        nameKorean: member.nameKorean,
        nameHanja: member.nameHanja || null,
        nameFull: member.nameFull || null,
        gender: member.gender,
        birthDate: member.birthDate || null,
        birthDateLunar: member.birthDateLunar || null,
        deathDate: member.deathDate || null,
        isAlive: member.isAlive,
        generation: member.generation,
        birthOrder: member.birthOrder,
        generationName: member.generationName || null,
        generationCount: member.generationCount || null,
        profileImage: member.profileImage || null,
        bio: member.bio || null,
        occupation: member.occupation || null,
        education: member.education || null,
        birthPlace: member.birthPlace || null,
        currentPlace: member.currentPlace || null,
        linkedUserId: member.linkedUserId || null,
        surname: member.surname || null,
        clan: member.clan || null,
        branch: member.branch || null,
        createdAt: toTimestamp(member.createdAt) || serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: options.mergeMode === "merge" });

      membersImported++;
      batchCount++;

      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    if (batchCount > 0) await batch.commit();
  }

  // 4. Relationships
  onProgress?.(35, "관계 정보를 복원하는 중...");
  let relationshipsImported = 0;
  const relsFile = zip.file("relationships.json");
  if (relsFile) {
    const relationships: BackupRelationship[] = JSON.parse(await relsFile.async("text"));
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const rel of relationships) {
      const relRef = doc(collection(db, "families", targetFamilyId, "relationships"), rel.id);
      batch.set(relRef, {
        type: rel.type,
        fromId: rel.fromId,
        toId: rel.toId,
        marriageDate: rel.marriageDate || null,
        createdAt: toTimestamp(rel.createdAt) || serverTimestamp(),
      }, { merge: options.mergeMode === "merge" });

      relationshipsImported++;
      batchCount++;

      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    if (batchCount > 0) await batch.commit();
  }

  // 5. Stories
  onProgress?.(50, "이야기를 복원하는 중...");
  let storiesImported = 0;
  const storiesFile = zip.file("stories.json");
  if (storiesFile) {
    const stories: BackupStory[] = JSON.parse(await storiesFile.async("text"));
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const story of stories) {
      const storyRef = doc(collection(db, "families", targetFamilyId, "stories"), story.id);
      batch.set(storyRef, {
        title: story.title,
        content: story.content,
        excerpt: story.excerpt || null,
        category: story.category,
        authorId: story.authorId,
        authorName: story.authorName,
        storyDate: story.storyDate || null,
        mentionedMembers: story.mentionedMembers || [],
        mediaUrls: story.mediaUrls || [],
        isPinned: story.isPinned || false,
        commentCount: story.commentCount || 0,
        createdAt: toTimestamp(story.createdAt) || serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: options.mergeMode === "merge" });

      storiesImported++;
      batchCount++;

      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    if (batchCount > 0) await batch.commit();
  }

  // 6. Events
  onProgress?.(60, "이벤트를 복원하는 중...");
  let eventsImported = 0;
  const eventsFile = zip.file("events.json");
  if (eventsFile) {
    const events: BackupEvent[] = JSON.parse(await eventsFile.async("text"));
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const event of events) {
      const eventRef = doc(collection(db, "families", targetFamilyId, "events"), event.id);
      batch.set(eventRef, {
        title: event.title,
        category: event.type,
        eventDate: toTimestamp(event.date) || serverTimestamp(),
        isRecurring: event.isRecurring,
        description: event.description || null,
        location: event.location || null,
        participants: event.participants || [],
        createdAt: toTimestamp(event.createdAt) || serverTimestamp(),
      }, { merge: options.mergeMode === "merge" });

      eventsImported++;
      batchCount++;

      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    if (batchCount > 0) await batch.commit();
  }

  // 7. Messages (선택)
  let messagesImported = 0;
  const msgsFile = zip.file("messages.json");
  if (msgsFile && options.mergeMode !== "skip") {
    onProgress?.(65, "대화 기록을 복원하는 중...");
    const messages: BackupMessage[] = JSON.parse(await msgsFile.async("text"));
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const msg of messages) {
      const msgRef = doc(collection(db, "families", targetFamilyId, "messages"), msg.id);
      batch.set(msgRef, {
        text: msg.text || null,
        senderId: msg.senderId,
        senderName: msg.senderName,
        imageUrl: msg.imageUrl || null,
        type: msg.type,
        createdAt: toTimestamp(msg.createdAt) || serverTimestamp(),
      }, { merge: true });

      messagesImported++;
      batchCount++;

      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    if (batchCount > 0) await batch.commit();
  }

  // 8. Media 파일 (선택)
  let mediaImported = 0;
  if (options.importMedia) {
    const mediaFolder = zip.folder("media");
    const indexFile = mediaFolder?.file("index.json");
    if (indexFile) {
      onProgress?.(70, "미디어 파일을 복원하는 중...");
      const mediaIndex = JSON.parse(await indexFile.async("text"));
      let completed = 0;

      for (const media of mediaIndex) {
        try {
          const mediaFile = mediaFolder?.file(media.fileName);
          if (!mediaFile) {
            skipped++;
            continue;
          }

          const fileData = await mediaFile.async("blob");
          const storagePath = `families/${targetFamilyId}/media/${media.fileName}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, fileData);
          const downloadUrl = await getDownloadURL(storageRef);

          await setDoc(doc(db, "families", targetFamilyId, "media", media.id), {
            type: media.type,
            fileName: media.fileName,
            storagePath,
            downloadUrl,
            mimeType: media.mimeType,
            fileSize: media.fileSize,
            title: media.title || "",
            description: media.description || "",
            taggedMembers: [],
            uploadedBy: media.uploadedBy,
            createdAt: toTimestamp(media.createdAt) || serverTimestamp(),
          });

          mediaImported++;
          completed++;
          const mediaProgress = 70 + (completed / mediaIndex.length) * 25;
          onProgress?.(mediaProgress, `미디어 복원 중... (${completed}/${mediaIndex.length})`);
        } catch (err) {
          errors.push(`미디어 복원 실패: ${media.fileName} - ${err}`);
        }
      }
    }
  }

  onProgress?.(100, "복원 완료!");

  return {
    success: errors.length === 0,
    stats: {
      membersImported,
      storiesImported,
      mediaImported,
      eventsImported,
      relationshipsImported,
      messagesImported,
      skipped,
      errors,
    },
  };
}

export function parseManifest(manifestJson: string): BackupManifest | null {
  try {
    return JSON.parse(manifestJson);
  } catch {
    return null;
  }
}
