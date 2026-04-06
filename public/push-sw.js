/* eslint-disable no-undef */
self.addEventListener('push', (event) => {
  let payload = { title: 'LYNX Auto Detailing', body: '', tag: 'lynx', data: {} };
  try {
    if (event.data) {
      payload = { ...payload, ...JSON.parse(event.data.text()) };
    }
  } catch (_) {
    /* ignore */
  }

  const options = {
    body: payload.body,
    icon: '/lynx-logo.png',
    badge: '/lynx-logo.png',
    data: payload.data || {},
    tag: payload.tag || 'lynx-notification',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
