// src/api/knowledge.js
// FINAL v1.1 — workspace knowledge API helpers

import { apiGet, apiPost } from "./client.js";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function buildQuery(params = {}) {
  const sp = new URLSearchParams();

  for (const [key, value] of Object.entries(params || {})) {
    const x = s(value);
    if (!x) continue;
    sp.set(key, x);
  }

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function getKnowledgeCandidates(filters = {}) {
  const query = buildQuery({
    status: filters.status,
    category: filters.category,
    limit: filters.limit,
  });

  return apiGet(`/api/knowledge/candidates${query}`);
}

export function approveKnowledgeCandidate(candidateId, payload = {}) {
  return apiPost(
    `/api/knowledge/candidates/${encodeURIComponent(candidateId)}/approve`,
    payload
  );
}

export function rejectKnowledgeCandidate(candidateId, payload = {}) {
  return apiPost(
    `/api/knowledge/candidates/${encodeURIComponent(candidateId)}/reject`,
    payload
  );
}