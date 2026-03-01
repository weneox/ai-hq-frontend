// src/lib/uiFormat.js
export function shortId(x) {
  const s = String(x || "");
  if (!s) return "";
  if (s.includes("-")) return s.split("-")[0]; // uuid -> first chunk
  if (s.length > 10) return s.slice(0, 10);
  return s;
}

export function relTime(iso) {
  const t = new Date(iso || Date.now()).getTime();
  const now = Date.now();
  const sec = Math.max(0, Math.floor((now - t) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export function safeText(x, max = 120) {
  const s = String(x || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function safeJson(x) {
  try {
    if (typeof x === "string") return JSON.parse(x);
    return x ?? null;
  } catch {
    return null;
  }
}

export function parsePayload(p) {
  const raw = p?.payload ?? p?.proposal ?? null;
  return safeJson(raw) || raw || null;
}

export function titleOf(p) {
  const payload = parsePayload(p);
  if (!payload) return `Proposal`;
  if (typeof payload === "string") return safeText(payload, 80);
  return (
    payload.title ||
    payload.name ||
    payload.summary ||
    payload.goal ||
    payload.objective ||
    `Proposal`
  );
}

export function summaryOf(p) {
  const payload = parsePayload(p);
  if (!payload) return "";
  if (typeof payload === "string") return safeText(payload, 120);
  const s =
    payload.summary ||
    payload.goal ||
    payload.objective ||
    payload.problem ||
    payload.context ||
    "";
  return safeText(s, 120);
}

export function rowsForOverview(payload) {
  if (!payload || typeof payload !== "object") return [];
  const rows = [];
  const pick = (k, label = k) => {
    const v = payload[k];
    if (v == null) return;
    rows.push({ k, label, v });
  };

  pick("goal", "Goal");
  pick("summary", "Summary");
  pick("objective", "Objective");
  pick("kpis", "KPIs");
  pick("channel", "Channel");
  pick("budget", "Budget");
  pick("dueDate", "Due date");
  pick("assignees", "Assignees");
  pick("priority", "Priority");

  return rows.slice(0, 8);
}

export function pretty(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}