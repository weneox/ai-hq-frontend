import { apiGet, apiPost } from "./client.js";

export async function listProposals(status = "pending") {
  const s = encodeURIComponent(status || "pending");
  const j = await apiGet(`/api/proposals?status=${s}`);
  return j.proposals || [];
}

export async function decideProposal(id, decision, reason) {
  const pid = encodeURIComponent(String(id));
  return apiPost(`/api/proposals/${pid}/decision`, {
    decision,
    reason: reason || "",
  });
}

// ---------- Draft actions (auto-fallback routes) ----------

async function postWithFallback(paths, body) {
  let lastErr = null;

  for (const p of paths) {
    try {
      return await apiPost(p, body);
    } catch (e) {
      lastErr = e;
      const msg = String(e?.message || e);

      // if it's not a routing issue, don't keep trying
      const looksLikeNotFound =
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("404") ||
        msg.toLowerCase().includes("cannot") ||
        msg.toLowerCase().includes("no route");

      if (!looksLikeNotFound) throw e;
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

  return postWithFallback(
    [
      // option A: content_items
      `/api/content/${did}/changes`,
      // option B: drafts
      `/api/drafts/${did}/changes`,
      // option C: under proposal
      `/api/proposals/${pid}/draft/${did}/changes`,
      `/api/proposals/${pid}/draft/changes`,
    ],
    { proposalId: String(proposalId), draftId: String(draftId), feedback: String(feedback || "") }
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