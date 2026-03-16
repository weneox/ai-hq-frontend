import { apiGet, apiPost, apiDelete } from "./client.js";

export async function getWorkspaceSettings() {
  const j = await apiGet(`/api/settings/workspace`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load workspace settings");
  return j;
}

export async function saveWorkspaceSettings(payload) {
  const j = await apiPost(`/api/settings/workspace`, payload);
  if (!j?.ok) throw new Error(j?.error || "Failed to save workspace settings");
  return j;
}

export async function getWorkspaceChannels() {
  const j = await apiGet(`/api/settings/channels`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load channels");
  return Array.isArray(j?.channels) ? j.channels : [];
}

export async function saveWorkspaceChannel(channelType, payload) {
  const t = encodeURIComponent(String(channelType || "").trim().toLowerCase());
  const j = await apiPost(`/api/settings/channels/${t}`, payload);
  if (!j?.ok) throw new Error(j?.error || "Failed to save channel");
  return j?.channel || j;
}

export async function getWorkspaceAgents() {
  const j = await apiGet(`/api/settings/agents`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load agents");
  return Array.isArray(j?.agents) ? j.agents : [];
}

export async function saveWorkspaceAgent(agentKey, payload) {
  const k = encodeURIComponent(String(agentKey || "").trim().toLowerCase());
  const j = await apiPost(`/api/settings/agents/${k}`, payload);
  if (!j?.ok) throw new Error(j?.error || "Failed to save agent");
  return j?.agent || j;
}

export async function getMetaChannelStatus() {
  const j = await apiGet(`/api/channels/meta/status`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load Meta channel status");
  return j;
}

export async function getMetaConnectUrl() {
  const j = await apiGet(`/api/channels/meta/connect-url`);
  if (!j?.ok || !j?.url) {
    throw new Error(j?.error || "Failed to build Meta connect URL");
  }
  return j.url;
}

export async function disconnectMetaChannel() {
  const j = await apiPost(`/api/channels/meta/disconnect`, {});
  if (!j?.ok) throw new Error(j?.error || "Failed to disconnect Meta");
  return j;
}

// ---------------------------------------------------------
// tenant business facts
// ---------------------------------------------------------

export async function getTenantBusinessFacts(params = {}) {
  const qs = new URLSearchParams();

  if (params.language) qs.set("language", String(params.language).trim().toLowerCase());
  if (params.factGroup) qs.set("factGroup", String(params.factGroup).trim().toLowerCase());

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const j = await apiGet(`/api/settings/business-facts${suffix}`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load business facts");
  return Array.isArray(j?.facts) ? j.facts : [];
}

export async function saveTenantBusinessFact(payload) {
  const j = await apiPost(`/api/settings/business-facts`, payload);
  if (!j?.ok) throw new Error(j?.error || "Failed to save business fact");
  return j?.fact || j;
}

export async function deleteTenantBusinessFact(id) {
  const x = encodeURIComponent(String(id || "").trim());
  const j = await apiDelete(`/api/settings/business-facts/${x}`);
  if (!j?.ok) throw new Error(j?.error || "Failed to delete business fact");
  return j;
}

// ---------------------------------------------------------
// tenant channel policies
// ---------------------------------------------------------

export async function getTenantChannelPolicies() {
  const j = await apiGet(`/api/settings/channel-policies`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load channel policies");
  return Array.isArray(j?.policies) ? j.policies : [];
}

export async function saveTenantChannelPolicy(payload) {
  const j = await apiPost(`/api/settings/channel-policies`, payload);
  if (!j?.ok) throw new Error(j?.error || "Failed to save channel policy");
  return j?.policy || j;
}

export async function deleteTenantChannelPolicy(id) {
  const x = encodeURIComponent(String(id || "").trim());
  const j = await apiDelete(`/api/settings/channel-policies/${x}`);
  if (!j?.ok) throw new Error(j?.error || "Failed to delete channel policy");
  return j;
}

// ---------------------------------------------------------
// tenant locations
// ---------------------------------------------------------

export async function getTenantLocations() {
  const j = await apiGet(`/api/settings/locations`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load locations");
  return Array.isArray(j?.locations) ? j.locations : [];
}

export async function saveTenantLocation(payload) {
  const j = await apiPost(`/api/settings/locations`, payload);
  if (!j?.ok) throw new Error(j?.error || "Failed to save location");
  return j?.location || j;
}

export async function deleteTenantLocation(id) {
  const x = encodeURIComponent(String(id || "").trim());
  const j = await apiDelete(`/api/settings/locations/${x}`);
  if (!j?.ok) throw new Error(j?.error || "Failed to delete location");
  return j;
}

// ---------------------------------------------------------
// tenant contacts
// ---------------------------------------------------------

export async function getTenantContacts() {
  const j = await apiGet(`/api/settings/contacts`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load contacts");
  return Array.isArray(j?.contacts) ? j.contacts : [];
}

export async function saveTenantContact(payload) {
  const j = await apiPost(`/api/settings/contacts`, payload);
  if (!j?.ok) throw new Error(j?.error || "Failed to save contact");
  return j?.contact || j;
}

export async function deleteTenantContact(id) {
  const x = encodeURIComponent(String(id || "").trim());
  const j = await apiDelete(`/api/settings/contacts/${x}`);
  if (!j?.ok) throw new Error(j?.error || "Failed to delete contact");
  return j;
}