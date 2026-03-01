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