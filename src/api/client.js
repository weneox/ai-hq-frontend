const RAW = (import.meta.env.VITE_API_BASE || "").trim();
const API_BASE = RAW ? RAW.replace(/\/+$/, "") : "";

export function getApiBase() {
  return API_BASE;
}

async function readJson(r) {
  const text = await r.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function assertConfigured() {
  if (!API_BASE) {
    throw new Error("VITE_API_BASE is not set. (Example: https://ai-hq-backend-production.up.railway.app)");
  }
}

export async function apiGet(path) {
  assertConfigured();
  const url = `${API_BASE}${path}`;
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  const j = await readJson(r);
  if (!r.ok || j?.ok === false) throw new Error(j?.error || `GET ${path} failed`);
  return j;
}

export async function apiPost(path, body) {
  assertConfigured();
  const url = `${API_BASE}${path}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });
  const j = await readJson(r);
  if (!r.ok || j?.ok === false) throw new Error(j?.error || `POST ${path} failed`);
  return j;
}