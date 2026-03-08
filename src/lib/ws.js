const WS_TOKEN = String(import.meta.env.VITE_WS_TOKEN || "").trim();
const API_BASE = String(import.meta.env.VITE_API_BASE || "").trim().replace(/\/+$/, "");
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
  if (WS_URL) {
    if (!WS_TOKEN) return WS_URL;
    const sep = WS_URL.includes("?") ? "&" : "?";
    return `${WS_URL}${sep}token=${encodeURIComponent(WS_TOKEN)}`;
  }

  if (!API_BASE || !WS_TOKEN) return "";
  const wsBase = API_BASE.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");
  return `${wsBase}/ws?token=${encodeURIComponent(WS_TOKEN)}`;
}

export function createWsClient({ onEvent, onStatus, maxDelayMs = 12000 } = {}) {
  let ws = null;
  let stopped = false;
  let attempt = 0;
  let reconnectTimer = null;
  let currentUrl = "";
  let manuallyClosed = false;

  const notifyStatus = (status) => {
    try {
      if (typeof onStatus === "function") onStatus(status);
    } catch {}
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const cleanupSocket = () => {
    if (!ws) return;

    try {
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
    } catch {}

    try {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        manuallyClosed = true;
        ws.close();
      }
    } catch {}

    ws = null;
  };

  const scheduleReconnect = () => {
    if (stopped) return;

    attempt = Math.min(attempt + 1, 50);

    const base = Math.min(maxDelayMs, 450 * Math.pow(1.6, attempt));
    const jitter = Math.floor(Math.random() * 300);
    const delay = Math.min(maxDelayMs, base + jitter);

    clearReconnectTimer();

    notifyStatus({
      state: "reconnecting",
      attempt,
      delayMs: delay,
    });

    reconnectTimer = setTimeout(() => {
      if (stopped) return;
      connect();
    }, delay);
  };

  const connect = () => {
    if (stopped) return;

    const url = buildWsUrl();
    currentUrl = url;

    if (!url) {
      notifyStatus({
        state: "off",
        detail: "missing VITE_WS_TOKEN or VITE_API_BASE/VITE_WS_URL",
      });
      return;
    }

    clearReconnectTimer();
    cleanupSocket();
    manuallyClosed = false;

    notifyStatus({
      state: attempt === 0 ? "connecting" : "reconnecting",
      attempt,
      url,
    });

    try {
      ws = new WebSocket(url);

      ws.onopen = () => {
        attempt = 0;
        notifyStatus({
          state: "connected",
          url: currentUrl,
        });
      };

      ws.onclose = (ev) => {
        const wasManual = manuallyClosed;
        manuallyClosed = false;
        ws = null;

        notifyStatus({
          state: "disconnected",
          code: ev?.code ?? null,
          reason: ev?.reason || "",
          wasClean: Boolean(ev?.wasClean),
        });

        if (stopped || wasManual) return;
        scheduleReconnect();
      };

      ws.onerror = () => {
        notifyStatus({
          state: "error",
          url: currentUrl,
        });
      };

      ws.onmessage = (ev) => {
        const msg = safeJson(ev.data);
        if (!msg || typeof msg !== "object") return;

        const type = msg.type || msg.event;
        if (!type) return;

        try {
          if (typeof onEvent === "function") {
            onEvent({
              type,
              payload: msg,
              raw: ev.data,
            });
          }
        } catch {}
      };
    } catch (err) {
      notifyStatus({
        state: "error",
        detail: String(err?.message || err || "WebSocket init failed"),
      });
      scheduleReconnect();
    }
  };

  return {
    start() {
      stopped = false;
      attempt = 0;
      clearReconnectTimer();
      connect();
    },

    stop() {
      stopped = true;
      clearReconnectTimer();
      cleanupSocket();
      notifyStatus({ state: "stopped" });
    },

    send(obj) {
      try {
        if (!ws || ws.readyState !== WebSocket.OPEN) return false;
        ws.send(JSON.stringify(obj));
        return true;
      } catch {
        return false;
      }
    },

    canUseWs() {
      return Boolean((WS_URL || API_BASE) && WS_TOKEN);
    },

    getState() {
      if (!ws) return "idle";
      if (ws.readyState === WebSocket.CONNECTING) return "connecting";
      if (ws.readyState === WebSocket.OPEN) return "open";
      if (ws.readyState === WebSocket.CLOSING) return "closing";
      return "closed";
    },
  };
}