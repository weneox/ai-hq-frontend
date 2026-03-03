// src/pages/Proposals.jsx (FINAL — A+)
// ✅ Approve -> auto switch to in_progress (drafting) and keep selection
// ✅ Correct TopBar stats by fetching counts across statuses
// ✅ WS updates refresh both current list + stats
// ✅ Poll fallback when WS not connected

import { useEffect, useMemo, useRef, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import ProposalList from "../components/ProposalList.jsx";
import ProposalDetail from "../components/ProposalDetail.jsx";

import { listProposals, decideProposal } from "../api/proposals.js";
import { createWsClient } from "../lib/ws.js";

const STATUSES = ["pending", "in_progress", "approved", "rejected"];

// Safe: listProposals might return [] or {proposals:[...]}
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

  const [stats, setStats] = useState({ pending: 0, in_progress: 0, approved: 0, rejected: 0 });

  const refreshStats = async () => {
    try {
      const results = await Promise.allSettled(
        STATUSES.map(async (s) => {
          const r = await listProposals(s);
          return { status: s, items: normalizeList(r) };
        })
      );

      const next = { pending: 0, in_progress: 0, approved: 0, rejected: 0 };

      for (const x of results) {
        if (x.status !== "fulfilled") continue;
        const { status: s, items } = x.value || {};
        if (!s) continue;
        if (s === "pending") next.pending = items.length;
        else if (s === "in_progress") next.in_progress = items.length;
        else if (s === "approved") next.approved = items.length;
        else if (s === "rejected") next.rejected = items.length;
      }

      setStats(next);
    } catch {
      // stats failure should not break page
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

      // Keep selection if possible (important when approve -> in_progress)
      const stillExists = next.some((p) => String(p.id) === String(keepSelectedId));
      if (stillExists) {
        setSelectedId(String(keepSelectedId));
      } else if ((!keepSelectedId || !stillExists) && next.length) {
        setSelectedId(String(next[0].id));
      } else if (!next.length) {
        // If list empty, keep selection but it will show "Select a proposal" until user switches
        // (do not force-clear because user might switch tabs)
      }

      if (why) {
        setToast(why);
        window.setTimeout(() => setToast(""), 1200);
      }
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  // Initial + when status changes
  useEffect(() => {
    refreshProposals();
    refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // WS
  useEffect(() => {
    const ws = createWsClient({
      onStatus: (s) => setWsStatus(s),
      onEvent: ({ type }) => {
        // Proposal events can affect multiple tabs, so refresh stats always
        if (type === "proposal.created") {
          refreshStats();
          // If we are on pending, refresh list too
          refreshProposals("New proposal");
        } else if (type === "proposal.updated") {
          refreshStats();
          refreshProposals("Updated");
        } else if (type === "execution.updated" || type === "job.updated") {
          // Optional: if your backend emits these; safe no-op otherwise
          refreshStats();
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

  // Poll fallback when WS is not connected
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

  const onApprove = async () => {
    if (!selected) return;
    setDecisionBusy(true);
    setErr("");
    try {
      await decideProposal(selected.id, "approve", reason?.trim() || "");
      setReason("");

      // ✅ APPROVE FLOW UX:
      // - Move to in_progress tab (drafting)
      // - Keep the same proposal selected so Draft appears when ready
      setStatus("in_progress");
      await refreshProposals("Approved ✅ → Drafting", { status: "in_progress", keepSelectedId: selected.id });
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

      // Reject usually final — move to rejected tab and keep selection
      setStatus("rejected");
      await refreshProposals("Rejected ❌", { status: "rejected", keepSelectedId: selected.id });
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
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}