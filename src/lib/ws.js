const WS_TOKEN = String(import.meta.env.VITE_WS_TOKEN || "").trim();
const API_BASE = String(import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
const WS_URL = String(import.meta.env.VITE_WS_URL || "").trim();

function safeJson(x) {
  try {
    if (typeof x === "string") return JSON.parse(x);
    return x ?? null;
  } catch {
    return null;
  }
}

function buildWsUrl() {
  // Prefer explicit WS URL if provided (Cloudflare Pages friendly)
  if (WS_URL) {
    if (!WS_TOKEN) return WS_URL;
    const sep = WS_URL.includes("?") ? "&" : "?";
    return `${WS_URL}${sep}token=${encodeURIComponent(WS_TOKEN)}`;
  }

  if (!API_BASE || !WS_TOKEN) return "";
  const wsBase = API_BASE.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");
  return `${wsBase}/ws?token=${encodeURIComponent(WS_TOKEN)}`;
}

/**
 * Simple WS client with:
 * - auto reconnect (exponential backoff)
 * - status events
 * - subscribe/unsubscribe
 */
export function createWsClient({ onEvent, onStatus, maxDelayMs = 12000 } = {}) {
  let ws = null;
  let stopped = false;
  let attempt = 0;
  let t = 0;

  const notifyStatus = (s) => {
    try {
      onStatus && onStatus(s);
    } catch {}
  };

  const connect = () => {
    const url = buildWsUrl();
    if (!url) {
      notifyStatus({ state: "off", detail: "missing VITE_WS_TOKEN or VITE_API_BASE/VITE_WS_URL" });
      return;
    }

    notifyStatus({ state: attempt === 0 ? "connecting" : "reconnecting", attempt });

    try {
      ws = new WebSocket(url);

      ws.onopen = () => {
        attempt = 0;
        notifyStatus({ state: "connected" });
      };

      ws.onclose = () => {
        notifyStatus({ state: "disconnected" });
        if (stopped) return;
        scheduleReconnect();
      };

      ws.onerror = () => {
        notifyStatus({ state: "error" });
        // reconnect handled by onclose
      };

      ws.onmessage = (ev) => {
        const msg = safeJson(ev.data);
        if (!msg) return;
        const type = msg.type || msg.event;
        if (!type) return;

        try {
          onEvent && onEvent({ type, payload: msg });
        } catch {}
      };
    } catch {
      notifyStatus({ state: "error" });
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    attempt = Math.min(attempt + 1, 50);
    const base = Math.min(maxDelayMs, 400 * Math.pow(1.6, attempt));
    const jitter = Math.floor(Math.random() * 250);
    const delay = Math.min(maxDelayMs, base + jitter);

    clearTimeout(t);
    t = setTimeout(() => {
      if (stopped) return;
      connect();
    }, delay);

    // optional: keep UI updated
    notifyStatus({ state: "reconnecting", attempt, delayMs: delay });
  };

  return {
    start() {
      stopped = false;
      connect();
    },
    stop() {
      stopped = true;
      clearTimeout(t);
      try {
        ws && ws.close();
      } catch {}
      ws = null;
      notifyStatus({ state: "stopped" });
    },
    send(obj) {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
      } catch {}
    },
    canUseWs() {
      return Boolean((WS_URL || API_BASE) && WS_TOKEN);
    },
  };
}