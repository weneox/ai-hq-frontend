// src/api/content.js
import { apiUrl } from "./client.js";

export async function getContentByProposalId(proposalId) {
  if (!proposalId) return null;
  const r = await fetch(apiUrl(`/api/content?proposalId=${encodeURIComponent(proposalId)}`), {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j?.ok) throw new Error(j?.error || `content fetch failed (${r.status})`);
  return j?.content || null; // content_items row
}