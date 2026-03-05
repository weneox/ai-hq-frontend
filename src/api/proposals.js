// src/api/proposals.js (FINAL v3.2 — robust + auto-fallback draft routes + rejectDraft)

import { apiGet, apiPost } from "./client.js";

export async function listProposals(status = "draft") {
  const s = encodeURIComponent(status || "draft");
  const j = await apiGet(`/api/proposals?status=${s}`);

  // supports both {proposals: []} and direct []
  if (Array.isArray(j)) return j;
  return j?.proposals || [];
}

// NOTE: legacy decideProposal still here if you ever need it (not used by UI v3)
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
      `/api/content/${did}/feedback`, // some backends use /feedback
      `/api/drafts/${did}/changes`,
      `/api/proposals/${pid}/draft/${did}/changes`,
      `/api/proposals/${pid}/draft/changes`,
      `/api/proposals/${pid}/request-changes`, // your convenience route returns contentId sometimes
    ],
    { proposalId: String(proposalId), draftId: String(draftId), feedback: fb, feedbackText: fb }
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
 * Reject draft (moves proposal to rejected)
 * body: { proposalId, draftId, reason }
 */
export async function rejectDraft(proposalId, draftId, reason) {
  const pid = encodeURIComponent(String(proposalId));
  const did = encodeURIComponent(String(draftId));
  const r = String(reason || "").trim();

  return postWithFallback(
    [
      `/api/content/${did}/reject`,
      `/api/drafts/${did}/reject`,
      `/api/proposals/${pid}/draft/${did}/reject`,
      `/api/proposals/${pid}/draft/reject`,
      `/api/proposals/${pid}/reject`, // optional convenience if you add it later
    ],
    { proposalId: String(proposalId), draftId: String(draftId), reason: r, rejectReason: r }
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
      `/api/proposals/${pid}/publish`, // your convenience route returns contentId
    ],
    { proposalId: String(proposalId), draftId: String(draftId) }
  );
}