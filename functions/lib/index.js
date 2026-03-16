"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onStoryCreated = exports.onChatMessageCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
const messaging_1 = require("firebase-admin/messaging");
(0, app_1.initializeApp)();
const db = (0, firestore_2.getFirestore)();
const messaging = (0, messaging_1.getMessaging)();
/**
 * 가족 채팅 메시지 생성 시 → 같은 가족에게 푸시 알림
 */
exports.onChatMessageCreated = (0, firestore_1.onDocumentCreated)("families/{familyId}/messages/{messageId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const message = snapshot.data();
    const familyId = event.params.familyId;
    const senderId = message.senderId;
    const senderName = message.senderName;
    const text = message.text;
    const type = message.type;
    // 발신자 제외한 가족 전원의 FCM 토큰 조회
    const tokensSnap = await db
        .collection("fcmTokens")
        .where("familyId", "==", familyId)
        .get();
    const tokens = tokensSnap.docs
        .filter((d) => d.data().userId !== senderId)
        .map((d) => d.data().token);
    if (tokens.length === 0)
        return;
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
});
/**
 * 새 이야기 생성 시 → 같은 가족에게 푸시 알림
 */
exports.onStoryCreated = (0, firestore_1.onDocumentCreated)("families/{familyId}/stories/{storyId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const story = snapshot.data();
    const familyId = event.params.familyId;
    const storyId = event.params.storyId;
    const authorId = story.authorId;
    const authorName = story.authorName;
    const title = story.title;
    const tokensSnap = await db
        .collection("fcmTokens")
        .where("familyId", "==", familyId)
        .get();
    const tokens = tokensSnap.docs
        .filter((d) => d.data().userId !== authorId)
        .map((d) => d.data().token);
    if (tokens.length === 0)
        return;
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
});
/**
 * 만료/무효 토큰 자동 정리
 */
async function cleanupInvalidTokens(tokensSnap, tokens, response) {
    const invalidIds = [];
    response.responses.forEach((resp, idx) => {
        if (!resp.success &&
            (resp.error?.code === "messaging/registration-token-not-registered" ||
                resp.error?.code === "messaging/invalid-registration-token")) {
            const tokenDoc = tokensSnap.docs.find((d) => d.data().token === tokens[idx]);
            if (tokenDoc)
                invalidIds.push(tokenDoc.id);
        }
    });
    if (invalidIds.length > 0) {
        const batch = db.batch();
        invalidIds.forEach((id) => batch.delete(db.collection("fcmTokens").doc(id)));
        await batch.commit();
        console.log(`Cleaned up ${invalidIds.length} invalid FCM tokens`);
    }
}
//# sourceMappingURL=index.js.map