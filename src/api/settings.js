import { apiGet, apiPost, getApiBase } from "./client.js";

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

// ----------------------------------------
// Meta / Instagram connect flow
// ----------------------------------------

export async function getMetaChannelStatus() {
  const j = await apiGet(`/api/channels/meta/status`);
  if (!j?.ok) throw new Error(j?.error || "Failed to load Meta channel status");
  return j;
}

export function getMetaConnectUrl() {
  const base = getApiBase();
  if (!base) {
    throw new Error(
      "VITE_API_BASE is not set. (Example: https://ai-hq-backend-production.up.railway.app)"
    );
  }
  return `${base}/api/channels/meta/connect`;
}

export async function disconnectMetaChannel() {
  const j = await apiPost(`/api/channels/meta/disconnect`, {});
  if (!j?.ok) throw new Error(j?.error || "Failed to disconnect Meta");
  return j;
}