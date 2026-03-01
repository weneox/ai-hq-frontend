const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");

export function getApiBase() {
  return API_BASE;
}

export async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.ok === false) throw new Error(j?.error || `GET ${path} failed`);
  return j;
}

export async function apiPost(path, body) {
  const url = `${API_BASE}${path}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.ok === false) throw new Error(j?.error || `POST ${path} failed`);
  return j;
}