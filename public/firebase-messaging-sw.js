// public/firebase-messaging-sw.js — NOTIF-1: Background push message handler
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyA7JyqZe1M4hP4ANYUjSgCm5LaMxMZvaZc',
  projectId:         'cbt-simulator',
  messagingSenderId: '575780213782',
  appId:             '1:575780213782:web:5f1d7945cff62fe9a01137',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  if (!title) return;

  self.registration.showNotification(title, {
    body: body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.type || 'notification',
    data: payload.data || {},
    requireInteraction: false,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/dashboard');
    })
  );
});
