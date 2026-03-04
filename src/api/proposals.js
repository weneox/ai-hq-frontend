// src/api/proposals.js (FINAL — robust + auto-fallback draft routes)

import { apiGet, apiPost } from "./client.js";

export async function listProposals(status = "pending") {
  const s = encodeURIComponent(status || "pending");
  const j = await apiGet(`/api/proposals?status=${s}`);

  // supports both {proposals: []} and direct []
  if (Array.isArray(j)) return j;
  return j?.proposals || [];
}

export async function decideProposal(id, decision, reason) {
  const pid = encodeURIComponent(String(id));
  return apiPost(`/api/proposals/${pid}/decision`, {
    decision,
    reason: String(reason || ""),
  });
}

// ---------- Draft actions (auto-fallback routes) ----------

function looksLikeRouteNotFound(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  if (msg.includes("not found")) return true;
  if (msg.includes("404")) return true;
  if (msg.includes("cannot post")) return true;
  if (msg.includes("cannot get")) return true;
  if (msg.includes("no route")) return true;
  if (msg.includes("route")) return true;
  if (msg.includes("status 404")) return true;
  return false;
}

async function postWithFallback(paths, body) {
  let lastErr = null;

  for (const p of paths) {
    try {
      return await apiPost(p, body);
    } catch (e) {
      lastErr = e;
      if (!looksLikeRouteNotFound(e)) throw e;
    }
  }

  throw lastErr || new Error("Draft action failed");
}

/**
 * Request changes (regenerate draft)
 * body: { proposalId, draftId, feedback }
 */
export async function requestDraftChanges(proposalId, draftId, feedback) {
  const pid = encodeURIComponent(String(proposalId));
  const did = encodeURIComponent(String(draftId));
  const fb = String(feedback || "").trim();

  return postWithFallback(
    [
      `/api/content/${did}/changes`,
      `/api/drafts/${did}/changes`,
      `/api/proposals/${pid}/draft/${did}/changes`,
      `/api/proposals/${pid}/draft/changes`,
    ],
    { proposalId: String(proposalId), draftId: String(draftId), feedback: fb }
  );
}

/**
 * Approve draft
 */
export async function approveDraft(proposalId, draftId) {
  const pid = encodeURIComponent(String(proposalId));
  const did = encodeURIComponent(String(draftId));

  return postWithFallback(
    [
      `/api/content/${did}/approve`,
      `/api/drafts/${did}/approve`,
      `/api/proposals/${pid}/draft/${did}/approve`,
      `/api/proposals/${pid}/draft/approve`,
    ],
    { proposalId: String(proposalId), draftId: String(draftId) }
  );
}

/**
 * Publish draft
 */
export async function publishDraft(proposalId, draftId) {
  const pid = encodeURIComponent(String(proposalId));
  const did = encodeURIComponent(String(draftId));

  return postWithFallback(
    [
      `/api/content/${did}/publish`,
      `/api/drafts/${did}/publish`,
      `/api/proposals/${pid}/draft/${did}/publish`,
      `/api/proposals/${pid}/draft/publish`,
    ],
    { proposalId: String(proposalId), draftId: String(draftId) }
  );
}