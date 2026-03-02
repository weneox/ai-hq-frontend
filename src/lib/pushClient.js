// src/lib/pushClient.js — FINAL (stable)
// ✅ Dev: VITE_API_BASE varsa onu istifadə edir
// ✅ Dev fallback: env oxunmasa belə localhost-da Railway backend-ə vurur (404 fix)
// ✅ Prod: same-origin fallback
// ✅ Safe: fetch JSON/non-JSON, service worker, logs

function urlBase64ToUint8Array(base64String) {
  const s = String(base64String || "").trim();
  const padding = "=".repeat((4 - (s.length % 4)) % 4);
  const base64 = (s + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function trimSlashEnd(s) {
  return String(s || "").trim().replace(/\/+$/, "");
}

// Import-meta env safe getter (avoid weird runtime contexts)
function getViteEnv(key) {
  try {
    // Vite runtime
    return String(import.meta?.env?.[key] || "").trim();
  } catch {
    return "";
  }
}

// Backend URL (prod: same-origin, dev: VITE_API_BASE; fallback: localhost => Railway)
export function getApiBase() {
  const v = trimSlashEnd(getViteEnv("VITE_API_BASE"));
  if (v) return v;

  // 🔥 Fail-safe: env oxunmasa belə dev-də 404 olmasın
  if (typeof window !== "undefined" && window.location?.hostname === "localhost") {
    return "https://ai-hq-backend-production.up.railway.app";
  }

  return ""; // prod: same origin
}

// Build endpoint URL safely (handles empty base)
export function apiUrl(pathname) {
  const base = getApiBase();
  const p = String(pathname || "").startsWith("/") ? pathname : `/${pathname}`;
  return base ? `${base}${p}` : p;
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

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return { ok: false, error: "serviceWorker not supported" };

  try {
    // If already registered (common in dev), reuse it
    const existing = await navigator.serviceWorker.getRegistration("/");
    const reg = existing || (await navigator.serviceWorker.register("/sw.js"));

    // Wait until active/ready
    await navigator.serviceWorker.ready;

    return { ok: true, reg };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

async function safeReadJson(resp) {
  try {
    const ct = String(resp.headers.get("content-type") || "");
    if (ct.includes("application/json")) return await resp.json();
    // try anyway
    return await resp.json();
  } catch {
    return null;
  }
}

export async function subscribePush({ vapidPublicKey, recipient = "ceo" }) {
  if (!canPush()) return { ok: false, error: "push not supported in this browser" };
  const key = String(vapidPublicKey || "").trim();
  if (!key) return { ok: false, error: "missing VAPID public key" };

  const perm = await getNotificationPermission();
  if (perm !== "granted") return { ok: false, error: `permission=${perm}` };

  const sw = await registerServiceWorker();
  if (!sw.ok) return { ok: false, error: sw.error };

  const reg = sw.reg;
  const appServerKey = urlBase64ToUint8Array(key);

  // get or create subscription
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey,
    });
  }

  const url = apiUrl("/api/push/subscribe");

  // ✅ Debug (only logs in dev)
  try {
    const isDev = getViteEnv("DEV") === "true" || getViteEnv("MODE") === "development";
    if (isDev) {
      console.log("[push] VITE_API_BASE =", getViteEnv("VITE_API_BASE"));
      console.log("[push] resolved base =", getApiBase());
      console.log("[push] subscribe url =", url);
    }
  } catch {}

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      recipient,
      subscription: sub.toJSON(),
    }),
  });

  const json = await safeReadJson(resp);

  return {
    ok: Boolean(resp.ok && (json?.ok ?? true)),
    status: resp.status,
    json,
    subscription: sub,
  };
}