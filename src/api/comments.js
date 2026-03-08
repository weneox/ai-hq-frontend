// src/api/comments.js

function getApiBase() {
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

async function apiGet(path) {
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

export async function listComments({
  tenantKey = "neox",
  channel = "",
  category = "",
  q = "",
  limit = 50,
} = {}) {
  const params = new URLSearchParams();
  params.set("tenantKey", tenantKey);
  if (channel) params.set("channel", channel);
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  params.set("limit", String(limit));

  return apiGet(`/api/comments?${params.toString()}`);
}

export async function getCommentById(id) {
  if (!id) throw new Error("comment id required");
  return apiGet(`/api/comments/${encodeURIComponent(id)}`);
}