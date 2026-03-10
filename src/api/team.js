// src/api/team.js
// FINAL — team management API client

import { apiGet, apiPost, apiPatch, apiDelete } from "./client.js";

function qs(params = {}) {
  const q = new URLSearchParams();

  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });

  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function listTeam(params = {}) {
  const j = await apiGet(`/api/team${qs(params)}`);
  return Array.isArray(j?.users) ? j.users : [];
}

export async function getTeamUser(id) {
  if (!id) throw new Error("team user id is required");
  const j = await apiGet(`/api/team/${encodeURIComponent(id)}`);
  return j?.user || null;
}

export async function createTeamUser(payload) {
  const j = await apiPost(`/api/team`, payload || {});
  return j?.user || null;
}

export async function updateTeamUser(id, payload) {
  if (!id) throw new Error("team user id is required");
  const j = await apiPatch(`/api/team/${encodeURIComponent(id)}`, payload || {});
  return j?.user || null;
}

export async function setTeamUserStatus(id, status) {
  if (!id) throw new Error("team user id is required");
  const j = await apiPost(`/api/team/${encodeURIComponent(id)}/status`, { status });
  return j?.user || null;
}

export async function deleteTeamUser(id) {
  if (!id) throw new Error("team user id is required");
  const j = await apiDelete(`/api/team/${encodeURIComponent(id)}`);
  return !!j?.deleted;
}