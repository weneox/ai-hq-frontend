// src/api/proposals.js (FINAL — matches backend v2.10+ content/proposals routes)

import { apiGet, apiPost } from "./client.js";

/**
 * UI tabs -> Backend statuses
 * UI: draft | approved | published | rejected
 * DB: in_progress | approved | published | rejected
 */
function mapUiStatusToBackend(status) {
  const s = String(status || "").toLowerCase();

  // Draft tab should show "drafting" items
  if (s === "draft" || s === "drafting") return "in_progress";

  if (s === "approved") return "approved";
  if (s === "published") return "published";
  if (s === "rejected") return "rejected";

  // safety
  return "in_progress";
}

/**
 * List proposals by UI tab status.
 * ✅ Always include latestContent + pack for Draft Studio.
 */
export async function listProposals(status = "draft") {
  const backendStatus = mapUiStatusToBackend(status);
  const s = encodeURIComponent(backendStatus);

  const j = await apiGet(`/api/proposals?status=${s}&includeContent=1&includePack=1`);

  if (Array.isArray(j)) return j;
  return j?.proposals || [];
}

/**
 * Decision endpoint (used for reject in UI)
 * POST /api/proposals/:id/decision  { decision:"approved"|"rejected", reason? }
 */
export async function decideProposal(id, decision, reason) {
  const pid = encodeURIComponent(String(id));
  return apiPost(`/api/proposals/${pid}/decision`, {
    decision,
    reason: String(reason || ""),
  });
}

// ==========================
// Draft actions (content_items)
// ==========================

/**
 * Request changes (regenerate draft)
 * POST /api/content/:contentId/feedback  { feedbackText, tenantId? }
 */
export async function requestDraftChanges(proposalId, contentId, feedback) {
  const did = encodeURIComponent(String(contentId));
  const fb = String(feedback || "").trim();

  return apiPost(`/api/content/${did}/feedback`, {
    proposalId: String(proposalId || ""),
    draftId: String(contentId || ""),
    feedbackText: fb,
    feedback: fb,
  });
}

/**
 * Approve draft
 * POST /api/content/:contentId/approve
 */
export async function approveDraft(proposalId, contentId) {
  const did = encodeURIComponent(String(contentId));

  return apiPost(`/api/content/${did}/approve`, {
    proposalId: String(proposalId || ""),
    draftId: String(contentId || ""),
  });
}

/**
 * Reject (THIS IS PROPOSAL DECISION, not content route)
 * POST /api/proposals/:proposalId/decision { decision:"rejected", reason }
 */
export async function rejectDraft(proposalId, _contentId, reason) {
  const pid = encodeURIComponent(String(proposalId));
  const r = String(reason || "").trim();

  return apiPost(`/api/proposals/${pid}/decision`, {
    decision: "rejected",
    reason: r,
  });
}

/**
 * Publish
 * POST /api/content/:contentId/publish
 */
export async function publishDraft(proposalId, contentId) {
  const did = encodeURIComponent(String(contentId));

  return apiPost(`/api/content/${did}/publish`, {
    proposalId: String(proposalId || ""),
    draftId: String(contentId || ""),
  });
}