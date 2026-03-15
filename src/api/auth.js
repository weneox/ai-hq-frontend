// src/api/auth.js

const RAW = (import.meta.env.VITE_API_BASE || "").trim();
const API_BASE = RAW ? RAW.replace(/\/+$/, "") : "";

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function assertConfigured() {
  if (!API_BASE) {
    throw new Error("VITE_API_BASE is not set");
  }
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

function pickErr(j, fallback) {
  return String(j?.error || j?.message || j?.raw || fallback);
}

const NO_CACHE_HEADERS = {
  Accept: "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function loginUser({ email, password, tenantKey }) {
  assertConfigured();

  const r = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      ...NO_CACHE_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      email,
      password,
      tenantKey,
    }),
  });

  const j = await readJson(r);

  if (!r.ok || j?.ok === false) {
    throw new Error(pickErr(j, `Login failed (${r.status})`));
  }

  return j;
}

export async function logoutUser() {
  assertConfigured();

  const r = await fetch(apiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: NO_CACHE_HEADERS,
  });

  const j = await readJson(r);

  if (!r.ok || j?.ok === false) {
    throw new Error(pickErr(j, `Logout failed (${r.status})`));
  }

  return j;
}

export async function getAuthMe() {
  assertConfigured();

  const r = await fetch(apiUrl("/api/auth/me"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: NO_CACHE_HEADERS,
  });

  const j = await readJson(r);

  if (!r.ok) {
    throw new Error(pickErr(j, `Auth check failed (${r.status})`));
  }

  return j;
}

export async function getAdminAuthMe() {
  assertConfigured();

  const r = await fetch(apiUrl("/api/admin-auth/me"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: NO_CACHE_HEADERS,
  });

  const j = await readJson(r);

  if (!r.ok || j?.ok === false) {
    throw new Error(pickErr(j, `Admin status check failed (${r.status})`));
  }

  return j;
}

export async function loginAdminAuth(passcode) {
  assertConfigured();

  const r = await fetch(apiUrl("/api/admin-auth/login"), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      ...NO_CACHE_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ passcode }),
  });

  const j = await readJson(r);

  if (!r.ok || j?.ok === false) {
    throw new Error(pickErr(j, `Admin login failed (${r.status})`));
  }

  return j;
}

export async function logoutAdminAuth() {
  assertConfigured();

  const r = await fetch(apiUrl("/api/admin-auth/logout"), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: NO_CACHE_HEADERS,
  });

  const j = await readJson(r);

  if (!r.ok || j?.ok === false) {
    throw new Error(pickErr(j, `Admin logout failed (${r.status})`));
  }

  return j;
}