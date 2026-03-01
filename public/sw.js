/* public/sw.js — AI HQ PWA Service Worker (Push + Notification Click) */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push event (backend web-push buranı vurur)
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || "AI HQ";
  const body = data.body || "";
  const payload = data.data || {};

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: payload,
      badge: "/pwa-192.png",
      icon: "/pwa-192.png",
      tag: payload?.tag || "ai-hq",
      renotify: false
    })
  );
});

// Notification click → app aç + uyğun səhifəyə get
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification?.data || {};

  // simple routing
  let target = "/";
  if (data.type === "proposal.created" || data.type === "proposal.updated") target = "/proposals";
  if (data.type === "job.updated") target = "/executions";
  if (data.type === "notification.created") target = "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        // focus existing tab
        if ("focus" in client) {
          client.focus();
          try {
            client.navigate(target);
          } catch {}
          return;
        }
      }
      // open new
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })()
  );
});