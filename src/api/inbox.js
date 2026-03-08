export function getApiBase() {
  const raw = String(import.meta.env.VITE_API_BASE || "").trim();
  return raw ? raw.replace(/\/+$/, "") : "";
}

async function readJsonSafe(r) {
  const text = await r.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function apiGet(path) {
  const base = getApiBase();
  if (!base) throw new Error("VITE_API_BASE is not set");

  const r = await fetch(`${base}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const j = await readJsonSafe(r);
  if (!r.ok || j?.ok === false) {
    throw new Error(j?.error || j?.details?.message || "Request failed");
  }
  return j;
}

export async function apiPost(path, body = {}) {
  const base = getApiBase();
  if (!base) throw new Error("VITE_API_BASE is not set");

  const r = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const j = await readJsonSafe(r);
  if (!r.ok || j?.ok === false) {
    throw new Error(j?.error || j?.details?.message || "Request failed");
  }
  return j;
}