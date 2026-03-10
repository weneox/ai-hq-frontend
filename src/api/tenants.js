import { apiGet, apiPost, apiPatch } from "./client.js";

export async function listTenants() {
  const j = await apiGet(`/api/tenants`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load tenants");
  return Array.isArray(j?.tenants) ? j.tenants : [];
}

export async function createTenant(payload) {
  const j = await apiPost(`/api/tenants`, payload);
  if (!j?.ok) throw new Error(j?.error || "Failed to create tenant");
  return j;
}

export async function getTenantByKey(tenantKey) {
  const k = encodeURIComponent(String(tenantKey || "").trim().toLowerCase());
  const j = await apiGet(`/api/tenants/${k}`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load tenant");
  return j;
}

export async function updateTenant(tenantKey, payload) {
  const k = encodeURIComponent(String(tenantKey || "").trim().toLowerCase());
  const j = await apiPatch(`/api/tenants/${k}`, payload);
  if (!j?.ok) throw new Error(j?.error || "Failed to update tenant");
  return j;
}

export async function exportTenantJson(tenantKey) {
  const k = encodeURIComponent(String(tenantKey || "").trim().toLowerCase());
  const j = await apiGet(`/api/tenants/${k}/export`);
  if (!j?.ok) throw new Error(j?.error || "Failed to export tenant JSON");
  return j;
}

export async function exportTenantCsvBundle(tenantKey) {
  const k = encodeURIComponent(String(tenantKey || "").trim().toLowerCase());
  const j = await apiGet(`/api/tenants/${k}/export/csv`);
  if (!j?.ok) throw new Error(j?.error || "Failed to export tenant CSV");
  return j;
}

export async function downloadTenantZip(tenantKey) {
  const k = encodeURIComponent(String(tenantKey || "").trim().toLowerCase());
  const base =
    String(import.meta.env.VITE_API_BASE || "").trim().replace(/\/+$/, "") || "";

  if (!base) {
    throw new Error("VITE_API_BASE is not set");
  }

  const url = `${base}/api/tenants/${k}/export/zip`;
  window.open(url, "_blank", "noopener,noreferrer");
}