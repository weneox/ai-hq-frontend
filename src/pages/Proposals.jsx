// src/pages/Proposals.jsx (FINAL — PREMIUM + DRAFT ACTIONS)
// ✅ Approve -> switch to in_progress (drafting) and keep selection
// ✅ TopBar stats across statuses
// ✅ WS updates refresh list + stats (+ keeps selected refreshed)
// ✅ Poll fallback when WS not connected
// ✅ Draft actions wired: Request changes / Approve draft / Publish (auto-fallback routes)

import { useEffect, useMemo, useRef, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import ProposalList from "../components/ProposalList.jsx";
import ProposalDetail from "../components/ProposalDetail.jsx";

import {
  listProposals,
  decideProposal,
  requestDraftChanges,
  approveDraft,
  publishDraft,
} from "../api/proposals.js";

import { createWsClient } from "../lib/ws.js";

const STATUSES = ["pending", "in_progress", "approved", "rejected"];

// listProposals returns [] (already) but keep safe
function normalizeList(resp) {
  if (Array.isArray(resp)) return resp;
  if (resp && Array.isArray(resp.proposals)) return resp.proposals;
  return [];
}

export default function ProposalsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [proposals, setProposals] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [decisionBusy, setDecisionBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");

  const [wsStatus, setWsStatus] = useState({ state: "disconnected" });
  const wsClientRef = useRef(null);

  const [stats, setStats] = useState({
    pending: 0,
    in_progress: 0,
    approved: 0,
    rejected: 0,
  });

  const showToast = (msg) => {
    if (!msg) return;
    setToast(msg);
    window.setTimeout(() => setToast(""), 1300);
  };

  const refreshStats = async () => {
    try {
      const results = await Promise.allSettled(
        STATUSES.map(async (s) => {
          const items = await listProposals(s);
          return { status: s, items: normalizeList(items) };
        })
      );

      const next = { pending: 0, in_progress: 0, approved: 0, rejected: 0 };
      for (const x of results) {
        if (x.status !== "fulfilled") continue;
        const { status: s, items } = x.value || {};
        if (!s) continue;
        next[s] = Array.isArray(items) ? items.length : 0;
      }
      setStats(next);
    } catch {
      // ignore
    }
  };

  const refreshProposals = async (why = "", opts = {}) => {
    const desiredStatus = opts.status ?? status;
    const keepSelectedId = opts.keepSelectedId ?? selectedId;

    setErr("");
    try {
      const list = await listProposals(desiredStatus);
      const next = normalizeList(list);
      setProposals(next);

      // Keep selection if possible
      const stillExists = next.some((p) => String(p.id) === String(keepSelectedId));
      if (stillExists) {
        setSelectedId(String(keepSelectedId));
      } else if ((!keepSelectedId || !stillExists) && next.length) {
        setSelectedId(String(next[0].id));
      } else {
        // list empty: keep selectedId as-is (user may switch tab)
      }

      if (why) showToast(why);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  // Initial + status change
  useEffect(() => {
    refreshProposals();
    refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // WS
  useEffect(() => {
    const ws = createWsClient({
      onStatus: (s) => setWsStatus(s),
      onEvent: ({ type, payload }) => {
        // Always refresh stats — affects all tabs
        if (type === "proposal.created" || type === "proposal.updated") {
          refreshStats();

          // If current tab is the one likely affected, refresh list
          refreshProposals(type === "proposal.created" ? "New proposal" : "Updated", {
            status,
            keepSelectedId: selectedId,
          });

          // If backend sends payload with id, and it's selected, keep it selected
          const pid = payload?.proposalId || payload?.id || payload?.proposal_id;
          if (pid && String(pid) === String(selectedId)) {
            // make sure we pull newest data
            refreshProposals("", { status, keepSelectedId: selectedId });
          }
        }

        // Optional job/execution events (draft becomes ready)
        if (type === "execution.updated" || type === "job.updated" || type === "content.updated") {
          refreshStats();
          refreshProposals("", { status, keepSelectedId: selectedId });
        }
      },
    });

    wsClientRef.current = ws;
    if (ws.canUseWs()) ws.start();
    else setWsStatus({ state: "off" });

    return () => {
      try {
        ws.stop();
      } catch {}
      wsClientRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll fallback when WS not connected
  useEffect(() => {
    const s = wsStatus?.state;
    if (s === "connected") return;

    const id = setInterval(() => {
      refreshProposals();
      refreshStats();
    }, 9000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsStatus?.state, status]);

  const selected = useMemo(
    () => proposals.find((x) => String(x.id) === String(selectedId)) || null,
    [proposals, selectedId]
  );

  // ---------- Decisions ----------
  const onApprove = async () => {
    if (!selected) return;
    setDecisionBusy(true);
    setErr("");
    try {
      await decideProposal(selected.id, "approve", reason?.trim() || "");
      setReason("");

      // ✅ UX: go Drafting + keep same selected
      setStatus("in_progress");
      await refreshProposals("Approved ✅ → Drafting", {
        status: "in_progress",
        keepSelectedId: selected.id,
      });
      await refreshStats();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setDecisionBusy(false);
    }
  };

  const onReject = async () => {
    if (!selected) return;
    if (!reason.trim()) {
      setErr("Reject üçün qısa reason yaz.");
      return;
    }
    setDecisionBusy(true);
    setErr("");
    try {
      await decideProposal(selected.id, "reject", reason.trim());
      setReason("");

      setStatus("rejected");
      await refreshProposals("Rejected ❌", {
        status: "rejected",
        keepSelectedId: selected.id,
      });
      await refreshStats();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setDecisionBusy(false);
    }
  };

  // ---------- Draft actions ----------
  const onRequestChanges = async (proposalId, draftId, feedbackText) => {
    setDecisionBusy(true);
    setErr("");
    try {
      await requestDraftChanges(proposalId, draftId, feedbackText);
      await refreshProposals("Changes requested ✅", { status, keepSelectedId: proposalId });
      await refreshStats();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setDecisionBusy(false);
    }
  };

  const onApproveDraft = async (proposalId, draftId) => {
    setDecisionBusy(true);
    setErr("");
    try {
      await approveDraft(proposalId, draftId);
      await refreshProposals("Draft approved ✅", { status, keepSelectedId: proposalId });
      await refreshStats();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setDecisionBusy(false);
    }
  };

  const onPublishDraft = async (proposalId, draftId) => {
    setDecisionBusy(true);
    setErr("");
    try {
      await publishDraft(proposalId, draftId);
      await refreshProposals("Publish requested ✅", { status, keepSelectedId: proposalId });
      await refreshStats();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setDecisionBusy(false);
    }
  };

  const handleManualRefresh = async () => {
    await refreshProposals("Refreshed");
    await refreshStats();
  };

  return (
    <div className="min-w-0 min-h-0 flex flex-col gap-5">
      <TopBar wsStatus={wsStatus} onRefresh={handleManualRefresh} stats={stats} toast={toast} />

      {err ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {err}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          Loading…
        </div>
      ) : (
        <div className="grid min-w-0 min-h-0 gap-5 items-stretch grid-cols-1 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
          {/* LEFT */}
          <div className="min-w-0 min-h-0">
            <ProposalList
              proposals={proposals}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              status={status}
              setStatus={setStatus}
              search={search}
              setSearch={setSearch}
            />
          </div>

          {/* RIGHT */}
          <div className="min-w-0 min-h-0">
            <div className="min-w-0 min-h-0 h-full overflow-hidden rounded-2xl">
              <div className="min-h-0 h-full overflow-auto">
                <ProposalDetail
                  proposal={selected}
                  busy={decisionBusy}
                  reason={reason}
                  setReason={setReason}
                  onApprove={onApprove}
                  onReject={onReject}
                  draftBusy={decisionBusy}
                  onRequestChanges={onRequestChanges}
                  onApproveDraft={onApproveDraft}
                  onPublishDraft={onPublishDraft}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}