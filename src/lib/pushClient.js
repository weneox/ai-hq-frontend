// src/lib/pushClient.js
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// Backend URL (prod: same-origin, dev: VITE_API_BASE)
export function getApiBase() {
  const v = (import.meta?.env?.VITE_API_BASE || "").trim();
  return v || ""; // empty => same origin
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return { ok: false, error: "serviceWorker not supported" };

  // Vite public/sw.js root-da serv olunur
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  return { ok: true, reg };
}

export function canPush() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export async function getNotificationPermission() {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

export async function askPermission() {
  if (!("Notification" in window)) return "denied";
  const p = await Notification.requestPermission();
  return p;
}

export async function subscribePush({ vapidPublicKey, recipient = "ceo" }) {
  if (!canPush()) return { ok: false, error: "push not supported in this browser" };
  if (!vapidPublicKey) return { ok: false, error: "missing VAPID public key" };

  const perm = await getNotificationPermission();
  if (perm !== "granted") return { ok: false, error: `permission=${perm}` };

  const { ok, reg, error } = await registerServiceWorker();
  if (!ok) return { ok: false, error };

  const appServerKey = urlBase64ToUint8Array(vapidPublicKey);

  // get or create subscription
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey,
    });
  }

  const apiBase = getApiBase();
  const resp = await fetch(`${apiBase}/api/push/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      recipient,
      subscription: sub.toJSON(),
    }),
  });

  const json = await resp.json().catch(() => null);

  return { ok: resp.ok && json?.ok !== false, status: resp.status, json, subscription: sub };
}