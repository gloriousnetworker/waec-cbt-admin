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

  const data = payload.data || {};
  const url = data.url || (data.section ? `/dashboard?section=${data.section}` : '/dashboard');

  self.registration.showNotification(title, {
    body: body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: data.type || 'notification',
    data: { ...data, url },
    requireInteraction: true,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'navigate' in client) {
          return client.navigate(targetUrl).then(c => c?.focus());
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
