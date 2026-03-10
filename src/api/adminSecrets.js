import { apiGet, apiPost, getApiBase } from "./client.js";

export async function getAdminSecrets(provider = "") {
  const p = String(provider || "").trim().toLowerCase();
  const path = p
    ? `/api/settings/secrets?provider=${encodeURIComponent(p)}`
    : `/api/settings/secrets`;

  const j = await apiGet(path);
  if (!j?.ok) throw new Error(j?.error || "Failed to load secrets");
  return Array.isArray(j?.secrets) ? j.secrets : [];
}

export async function saveAdminSecret(provider, secretKey, value) {
  const p = encodeURIComponent(String(provider || "").trim().toLowerCase());
  const k = encodeURIComponent(String(secretKey || "").trim().toLowerCase());

  const j = await apiPost(`/api/settings/secrets/${p}/${k}`, { value });
  if (!j?.ok) throw new Error(j?.error || "Failed to save secret");
  return j?.secret || j;
}

export async function deleteAdminSecret(provider, secretKey) {
  const p = encodeURIComponent(String(provider || "").trim().toLowerCase());
  const k = encodeURIComponent(String(secretKey || "").trim().toLowerCase());

  const base = getApiBase();
  if (!base) {
    throw new Error("VITE_API_BASE is not set");
  }

  const r = await fetch(`${base}/api/settings/secrets/${p}/${k}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await r.text().catch(() => "");
  let j = {};
  try {
    j = text ? JSON.parse(text) : {};
  } catch {
    j = { raw: text };
  }

  if (!j?.ok) throw new Error(j?.error || "Failed to delete secret");
  return j;
}