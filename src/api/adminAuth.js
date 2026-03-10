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

export async function getAdminAuthMe() {
  const base = getApiBase();
  if (!base) throw new Error("VITE_API_BASE is not set");

  const r = await fetch(`${base}/api/admin-auth/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  const j = await readJsonSafe(r);
  if (!r.ok) throw new Error(j?.error || "Admin status check failed");
  return j;
}

export async function loginAdminAuth(passcode) {
  const base = getApiBase();
  if (!base) throw new Error("VITE_API_BASE is not set");

  const r = await fetch(`${base}/api/admin-auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify({ passcode }),
  });

  const j = await readJsonSafe(r);
  if (!r.ok || j?.ok === false) {
    throw new Error(j?.error || "Admin login failed");
  }
  return j;
}

export async function logoutAdminAuth() {
  const base = getApiBase();
  if (!base) throw new Error("VITE_API_BASE is not set");

  const r = await fetch(`${base}/api/admin-auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  const j = await readJsonSafe(r);
  if (!r.ok || j?.ok === false) {
    throw new Error(j?.error || "Logout failed");
  }
  return j;
}