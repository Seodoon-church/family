import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getMessaging } from "firebase-admin/messaging";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const JSZip = require("jszip");

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * 카카오 로그인 → Firebase 커스텀 토큰 발급
 */
export const kakaoLogin = onCall(
  { region: "us-central1" },
  async (request) => {
    const { accessToken } = request.data;
    if (!accessToken || typeof accessToken !== "string") {
      throw new HttpsError("invalid-argument", "카카오 access token이 필요합니다.");
    }

    // 1. 카카오 API로 사용자 정보 조회
    const kakaoRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!kakaoRes.ok) {
      throw new HttpsError("unauthenticated", "카카오 토큰이 유효하지 않습니다.");
    }

    const kakaoUser = await kakaoRes.json() as {
      id: number;
      kakao_account?: {
        email?: string;
        profile?: { nickname?: string; profile_image_url?: string };
      };
    };

    const kakaoId = kakaoUser.id.toString();
    const email = kakaoUser.kakao_account?.email;
    const displayName = kakaoUser.kakao_account?.profile?.nickname || "카카오 사용자";
    const photoURL = kakaoUser.kakao_account?.profile?.profile_image_url;

    const auth = getAuth();
    const uid = `kakao:${kakaoId}`;

    // 2. Firebase Auth 사용자 생성/업데이트
    try {
      await auth.getUser(uid);
      // 기존 사용자 — 정보 업데이트
      await auth.updateUser(uid, {
        displayName,
        ...(photoURL ? { photoURL } : {}),
      });
    } catch {
      // 신규 사용자 생성
      await auth.createUser({
        uid,
        displayName,
        ...(email ? { email } : {}),
        ...(photoURL ? { photoURL } : {}),
      });
    }

    // 3. Firestore 프로필 생성 (없으면)
    const userDoc = await db.doc(`users/${uid}`).get();
    if (!userDoc.exists) {
      await db.doc(`users/${uid}`).set({
        email: email || "",
        displayName,
        role: "MEMBER",
        createdAt: new Date(),
      });
    }

    // 4. 커스텀 토큰 발급
    const customToken = await auth.createCustomToken(uid);
    return { customToken };
  }
);

/**
 * 가족 채팅 메시지 생성 시 → 같은 가족에게 푸시 알림
 */
export const onChatMessageCreated = onDocumentCreated(
  "families/{familyId}/messages/{messageId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const message = snapshot.data();
    const familyId = event.params.familyId;
    const senderId = message.senderId as string;
    const senderName = message.senderName as string;
    const text = message.text as string;
    const type = message.type as string;

    // 발신자 제외한 가족 전원의 FCM 토큰 조회
    const tokensSnap = await db
      .collection("fcmTokens")
      .where("familyId", "==", familyId)
      .get();

    const tokens = tokensSnap.docs
      .filter((d) => d.data().userId !== senderId)
      .map((d) => d.data().token as string);

    if (tokens.length === 0) return;

    const body = type === "IMAGE" ? "사진을 보냈습니다" : text;

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: senderName,
        body: body.length > 100 ? body.slice(0, 100) + "..." : body,
      },
      data: {
        type: "CHAT",
        familyId,
        link: "/chat/",
      },
      webpush: {
        fcmOptions: { link: "/chat/" },
      },
    });

    // 만료된 토큰 정리
    await cleanupInvalidTokens(tokensSnap, tokens, response);
  }
);

/**
 * 새 이야기 생성 시 → 같은 가족에게 푸시 알림
 */
export const onStoryCreated = onDocumentCreated(
  "families/{familyId}/stories/{storyId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const story = snapshot.data();
    const familyId = event.params.familyId;
    const storyId = event.params.storyId;
    const authorId = story.authorId as string;
    const authorName = story.authorName as string;
    const title = story.title as string;

    const tokensSnap = await db
      .collection("fcmTokens")
      .where("familyId", "==", familyId)
      .get();

    const tokens = tokensSnap.docs
      .filter((d) => d.data().userId !== authorId)
      .map((d) => d.data().token as string);

    if (tokens.length === 0) return;

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: "새 이야기가 추가되었습니다",
        body: `${authorName}: ${title}`,
      },
      data: {
        type: "STORY",
        familyId,
        storyId,
        link: `/stories/${storyId}/`,
      },
      webpush: {
        fcmOptions: { link: `/stories/${storyId}/` },
      },
    });

    await cleanupInvalidTokens(tokensSnap, tokens, response);
  }
);

/**
 * 자동 월간 백업 — 매월 1일 새벽 3시 (KST) 실행
 */
export const monthlyAutoBackup = onSchedule(
  {
    schedule: "0 3 1 * *",
    timeZone: "Asia/Seoul",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 300,
  },
  async () => {
    const storage = getStorage();
    const bucket = storage.bucket();

    // 모든 가족 조회
    const familiesSnap = await db.collection("families").get();
    if (familiesSnap.empty) {
      console.log("No families to backup");
      return;
    }

    for (const familyDoc of familiesSnap.docs) {
      try {
        const familyId = familyDoc.id;
        const familyData = familyDoc.data();
        const familyName = familyData.name || "가족";

        console.log(`Backing up family: ${familyName} (${familyId})`);

        // 하위 컬렉션 조회
        const [membersSnap, relsSnap, storiesSnap, eventsSnap, msgsSnap] =
          await Promise.all([
            db.collection(`families/${familyId}/members`).get(),
            db.collection(`families/${familyId}/relationships`).get(),
            db.collection(`families/${familyId}/stories`).get(),
            db.collection(`families/${familyId}/events`).get(),
            db.collection(`families/${familyId}/messages`).get(),
          ]);

        const toISO = (val: unknown): string => {
          if (!val) return new Date().toISOString();
          if (typeof val === "object" && val !== null && "toDate" in val) {
            return (val as { toDate: () => Date }).toDate().toISOString();
          }
          return typeof val === "string" ? val : new Date().toISOString();
        };

        // 데이터 변환
        const family = {
          id: familyId,
          name: familyData.name || "",
          description: familyData.description,
          surname: familyData.surname,
          clan: familyData.clan,
          branch: familyData.branch,
          createdBy: familyData.createdBy || "",
          createdAt: toISO(familyData.createdAt),
        };

        const members = membersSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: toISO(d.data().createdAt),
          updatedAt: toISO(d.data().updatedAt),
        }));

        const relationships = relsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: toISO(d.data().createdAt),
        }));

        const stories = storiesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: toISO(d.data().createdAt),
          updatedAt: toISO(d.data().updatedAt),
        }));

        const events = eventsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          eventDate: toISO(d.data().eventDate),
          createdAt: toISO(d.data().createdAt),
        }));

        const messages = msgsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: toISO(d.data().createdAt),
        }));

        // 매니페스트
        const manifest = {
          version: "2.0.0",
          createdAt: new Date().toISOString(),
          generator: "우리家이야기/auto-backup",
          familyId,
          familyName,
          exportedBy: { userId: "system", displayName: "자동 백업", email: "" },
          stats: {
            memberCount: members.length,
            storyCount: stories.length,
            mediaCount: 0,
            mediaSize: 0,
            eventCount: events.length,
            relationshipCount: relationships.length,
            messageCount: messages.length,
          },
        };

        // ZIP 생성 (미디어 제외 — 데이터만)
        const zip = new JSZip();
        zip.file("manifest.json", JSON.stringify(manifest, null, 2));
        zip.file("family.json", JSON.stringify(family, null, 2));
        zip.file("members.json", JSON.stringify(members, null, 2));
        zip.file("relationships.json", JSON.stringify(relationships, null, 2));
        zip.file("stories.json", JSON.stringify(stories, null, 2));
        zip.file("events.json", JSON.stringify(events, null, 2));
        zip.file("messages.json", JSON.stringify(messages, null, 2));

        const zipBuffer = await zip.generateAsync({
          type: "nodebuffer",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });

        // Firebase Storage에 업로드
        const date = new Date().toISOString().split("T")[0];
        const fileName = `backups/${familyId}/${date}_auto.zip`;
        const file = bucket.file(fileName);
        await file.save(zipBuffer, {
          metadata: { contentType: "application/zip" },
        });

        // Firestore에 백업 기록
        await db.collection(`families/${familyId}/backupHistory`).add({
          type: "auto",
          fileName,
          fileSize: zipBuffer.length,
          stats: manifest.stats,
          createdAt: new Date(),
        });

        console.log(`Backup complete: ${fileName} (${zipBuffer.length} bytes)`);
      } catch (err) {
        console.error(`Backup failed for family ${familyDoc.id}:`, err);
      }
    }
  }
);

/**
 * 만료/무효 토큰 자동 정리
 */
async function cleanupInvalidTokens(
  tokensSnap: FirebaseFirestore.QuerySnapshot,
  tokens: string[],
  response: { responses: Array<{ success: boolean; error?: { code: string } }> }
) {
  const invalidIds: string[] = [];

  response.responses.forEach((resp, idx) => {
    if (
      !resp.success &&
      (resp.error?.code === "messaging/registration-token-not-registered" ||
        resp.error?.code === "messaging/invalid-registration-token")
    ) {
      const tokenDoc = tokensSnap.docs.find(
        (d) => d.data().token === tokens[idx]
      );
      if (tokenDoc) invalidIds.push(tokenDoc.id);
    }
  });

  if (invalidIds.length > 0) {
    const batch = db.batch();
    invalidIds.forEach((id) =>
      batch.delete(db.collection("fcmTokens").doc(id))
    );
    await batch.commit();
    console.log(`Cleaned up ${invalidIds.length} invalid FCM tokens`);
  }
}
