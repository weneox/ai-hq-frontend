// src/api/knowledge.js

import { apiGet, apiPost } from "./client.js";

export function getKnowledgeCandidates() {
  return apiGet("/api/knowledge/candidates");
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