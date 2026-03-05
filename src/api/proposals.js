// src/api/proposals.js (FIXED — tolerant approve/publish responses)

import { apiGet, apiPost } from "./client.js";

/**
 * UI tabs -> Backend statuses
 * UI: draft | approved | published | rejected
 * DB: in_progress | approved | published | rejected
 */
function mapUiStatusToBackend(status) {
  const s = String(status || "").toLowerCase();

  // Draft tab should show drafting items
  if (s === "draft" || s === "drafting") return "in_progress";

  if (s === "approved") return "approved";
  if (s === "published") return "published";
  if (s === "rejected") return "rejected";

  return "in_progress";
}

export async function listProposals(status = "draft") {
  const backendStatus = mapUiStatusToBackend(status);
  const s = encodeURIComponent(backendStatus);

  const j = await apiGet(`/api/proposals?status=${s}&includeContent=1&includePack=1`);

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

// ==========================
// Draft actions (content_items)
// ==========================

export async function requestDraftChanges(_proposalId, contentId, feedback) {
  const did = encodeURIComponent(String(contentId));
  const fb = String(feedback || "").trim();

  // backend only needs feedbackText (proposalId/draftId artıq şərt deyil)
  const j = await apiPost(`/api/content/${did}/feedback`, {
    feedbackText: fb,
  });

  // normalize return (UI-safe)
  return {
    ok: !!j?.ok,
    content: j?.content || null,
    jobId: j?.jobId || j?.job_id || null,
    error: j?.ok ? null : (j?.error || "feedback failed"),
  };
}

/**
 * Approve draft:
 * NEW FLOW: approve => asset generation request (no proposal object required)
 */
export async function approveDraft(_proposalId, contentId) {
  const did = encodeURIComponent(String(contentId));

  const j = await apiPost(`/api/content/${did}/approve`, {});

  return {
    ok: !!j?.ok,
    content: j?.content || null,
    jobId: j?.jobId || j?.job_id || null,
    note: j?.note || null,
    error: j?.ok ? null : (j?.error || "approve failed"),
  };
}

export async function rejectDraft(proposalId, _contentId, reason) {
  const pid = encodeURIComponent(String(proposalId));
  const r = String(reason || "").trim();

  return apiPost(`/api/proposals/${pid}/decision`, {
    decision: "rejected",
    reason: r,
  });
}

/**
 * Publish:
 * backend may require asset.ready depending on your new content.js
 */
export async function publishDraft(_proposalId, contentId) {
  const did = encodeURIComponent(String(contentId));

  const j = await apiPost(`/api/content/${did}/publish`, {});

  return {
    ok: !!j?.ok,
    content: j?.content || null,
    jobId: j?.jobId || j?.job_id || null,
    error: j?.ok ? null : (j?.error || "publish failed"),
  };
}