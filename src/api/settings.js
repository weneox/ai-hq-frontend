// src/api/settings.js
// client workspace settings only

import { apiGet, apiPost } from "./client.js";

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