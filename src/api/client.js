// src/api/client.js

const RAW = (import.meta.env.VITE_API_BASE || "").trim();
const API_BASE = RAW ? RAW.replace(/\/+$/, "") : "";

export function getApiBase() {
  return API_BASE;
}

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

async function readJson(r) {
  const text = await r.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, raw: text };
  }
}

function assertConfigured() {
  if (!API_BASE) {
    throw new Error(
      "VITE_API_BASE is not set. (Example: https://ai-hq-backend-production.up.railway.app)"
    );
  }
}

function pickErr(j, fallback) {
  const m = j?.error || j?.message || j?.details?.message || j?.raw || fallback;
  return String(m || fallback);
}

export async function apiGet(path) {
  assertConfigured();
  const url = `${API_BASE}${path}`;

  let r;
  try {
    r = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    throw new Error(`Network error (GET ${path}): ${String(e?.message || e)}`);
  }

  const j = await readJson(r);

  if (!r.ok) {
    throw new Error(pickErr(j, `GET ${path} failed (${r.status})`));
  }

  return j;
}

export async function apiPost(path, body) {
  assertConfigured();
  const url = `${API_BASE}${path}`;

  let r;
  try {
    r = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      body: JSON.stringify(body ?? {}),
    });
  } catch (e) {
    throw new Error(`Network error (POST ${path}): ${String(e?.message || e)}`);
  }

  const j = await readJson(r);

  if (!r.ok) {
    throw new Error(pickErr(j, `POST ${path} failed (${r.status})`));
  }

  return j;
}

export async function apiPatch(path, body) {
  assertConfigured();
  const url = `${API_BASE}${path}`;

  let r;
  try {
    r = await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      body: JSON.stringify(body ?? {}),
    });
  } catch (e) {
    throw new Error(`Network error (PATCH ${path}): ${String(e?.message || e)}`);
  }

  const j = await readJson(r);

  if (!r.ok) {
    throw new Error(pickErr(j, `PATCH ${path} failed (${r.status})`));
  }

  return j;
}

export async function apiDelete(path) {
  assertConfigured();
  const url = `${API_BASE}${path}`;

  let r;
  try {
    r = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (e) {
    throw new Error(`Network error (DELETE ${path}): ${String(e?.message || e)}`);
  }

  const j = await readJson(r);

  if (!r.ok) {
    throw new Error(pickErr(j, `DELETE ${path} failed (${r.status})`));
  }

  return j;
}