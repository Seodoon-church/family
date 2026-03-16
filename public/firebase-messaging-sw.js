/* eslint-disable no-undef */
// Firebase Messaging Service Worker
// 백그라운드 푸시 알림 처리

importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCySOFwaqZuk7OBPAMaGxqtmKnS7TmvlDw",
  authDomain: "hans-family-452b8.firebaseapp.com",
  projectId: "hans-family-452b8",
  storageBucket: "hans-family-452b8.firebasestorage.app",
  messagingSenderId: "767126490149",
  appId: "1:767126490149:web:d4e60e345cf6ef35c283cc",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "우리家 이야기";
  const body = payload.notification?.body || "새로운 알림이 있습니다";
  const link = payload.data?.link || "/dashboard/";

  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    data: { url: link },
    tag: payload.data?.type || "default",
  });
});

// 알림 클릭 시 해당 페이지로 이동
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // 없으면 새 탭
      return clients.openWindow(url);
    })
  );
});
