/* EMIS ONLINE ACADEMY service worker: shows phone notifications, even when the app is closed. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { });
self.addEventListener('push', e => e.waitUntil((async () => {
  let items = [];
  try {
    const sub = await self.registration.pushManager.getSubscription();
    if (sub) { const r = await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'pending', endpoint: sub.endpoint }) }); const j = await r.json(); items = (j && j.items) || []; }
  } catch (err) { }
  if (!items.length) items = [{ title: 'EMIS ONLINE ACADEMY', body: 'You have a new notification.', url: 'dashboard.html' }];
  for (const it of items.slice(0, 6)) await self.registration.showNotification(it.title || 'EMIS ONLINE ACADEMY', { body: it.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: 'emis-' + (it.url || ''), renotify: true, data: { url: it.url || 'dashboard.html' } });
})()));
self.addEventListener('notificationclick', e => {
  e.notification.close(); const url = new URL((e.notification.data && e.notification.data.url) || 'dashboard.html', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => { for (const c of cs) { if ('focus' in c) { c.navigate && c.navigate(url); return c.focus(); } } return self.clients.openWindow(url); }));
});
