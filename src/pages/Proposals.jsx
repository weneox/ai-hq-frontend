// src/pages/Proposals.jsx (FINAL — PREMIUM + DRAFT MERGE)
// ✅ UI Tabs: Draft (= pending + in_progress), Approved, Published, Rejected
// ✅ Pending tab removed from UI (but backend status pending still exists)
// ✅ Draft tab shows cron-created items immediately (pending) + drafting items (in_progress)
// ✅ Approve (pending) -> move to in_progress and keep selection
// ✅ WS updates refresh list + stats (+ keeps selected refreshed)
// ✅ Poll fallback when WS not connected

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

const BACKEND_STATUSES = ["pending", "in_progress", "approved", "published", "rejected"];
const UI_TABS = ["draft", "approved", "published", "rejected"]; // ✅ no pending tab

function normalizeList(resp) {
  if (Array.isArray(resp)) return resp;
  if (resp && Array.isArray(resp.proposals)) return resp.proposals;
  return [];
}

function parseDateMs(x) {
  const v = x ? Date.parse(x) : NaN;
  return Number.isFinite(v) ? v : 0;
}

function sortNewestFirst(a, b) {
  const am = parseDateMs(a?.created_at || a?.createdAt);
  const bm = parseDateMs(b?.created_at || b?.createdAt);
  return bm - am;
}

function uniqById(items) {
  const seen = new Set();
  const out = [];
  for (const it of items || []) {
    const id = String(it?.id || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(it);
  }
  return out;
}

function mergeDraftItems(pending, inProgress) {
  return uniqById([...(pending || []), ...(inProgress || [])]).sort(sortNewestFirst);
}

export default function ProposalsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ default UI tab is "draft" (merged)
  const [status, setStatus] = useState("draft");

  const [search, setSearch] = useState("");
  const [proposals, setProposals] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [decisionBusy, setDecisionBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");

  const [wsStatus, setWsStatus] = useState({ state: "disconnected" });
  const wsClientRef = useRef(null);

  // keep legacy keys for TopBar compatibility (if it expects pending/in_progress)
  const [stats, setStats] = useState({
    pending: 0,
    in_progress: 0,
    approved: 0,
    published: 0,
    rejected: 0,
    // extra UI helper
    draft: 0,
  });

  const showToast = (msg) => {
    if (!msg) return;
    setToast(msg);
    window.setTimeout(() => setToast(""), 1300);
  };

  const refreshStats = async () => {
    try {
      const results = await Promise.allSettled(
        BACKEND_STATUSES.map(async (s) => {
          const items = await listProposals(s);
          return { status: s, items: normalizeList(items) };
        })
      );

      const next = {
        pending: 0,
        in_progress: 0,
        approved: 0,
        published: 0,
        rejected: 0,
        draft: 0,
      };

      for (const x of results) {
        if (x.status !== "fulfilled") continue;
        const { status: s, items } = x.value || {};
        if (!s) continue;
        next[s] = Array.isArray(items) ? items.length : 0;
      }

      // ✅ Draft tab count = pending + in_progress
      next.draft = (next.pending || 0) + (next.in_progress || 0);

      setStats(next);
    } catch {
      // ignore
    }
  };

  const fetchByUiStatus = async (uiStatus) => {
    const s = String(uiStatus || "draft").toLowerCase();

    if (s === "draft") {
      const [p1, p2] = await Promise.all([listProposals("pending"), listProposals("in_progress")]);
      const pending = normalizeList(p1);
      const inProgress = normalizeList(p2);
      return mergeDraftItems(pending, inProgress);
    }

    // passthrough
    const list = await listProposals(s);
    return normalizeList(list).sort(sortNewestFirst);
  };

  const refreshProposals = async (why = "", opts = {}) => {
    const desiredStatus = opts.status ?? status;
    const keepSelectedId = opts.keepSelectedId ?? selectedId;

    setErr("");
    try {
      const next = await fetchByUiStatus(desiredStatus);

      setProposals(next);

      // selection handling (stable)
      if (next.length === 0) {
        // keep selectedId as-is (user may switch tab)
      } else {
        const stillExists =
          keepSelectedId && next.some((p) => String(p.id) === String(keepSelectedId));
        if (stillExists) setSelectedId(String(keepSelectedId));
        else setSelectedId(String(next[0].id));
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
        const isProposalEvent = type === "proposal.created" || type === "proposal.updated";
        const isExecEvent =
          type === "execution.updated" || type === "job.updated" || type === "content.updated";

        if (isProposalEvent || isExecEvent) {
          refreshStats();
          refreshProposals(isProposalEvent && type === "proposal.created" ? "New proposal" : "", {
            status,
            keepSelectedId: selectedId,
          });

          const pid = payload?.proposalId || payload?.id || payload?.proposal_id;
          if (pid && String(pid) === String(selectedId)) {
            refreshProposals("", { status, keepSelectedId: selectedId });
          }
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

    // only makes sense if pending
    if (String(selected.status || "").toLowerCase() !== "pending") {
      showToast("This item is not pending.");
      return;
    }

    setDecisionBusy(true);
    setErr("");
    try {
      await decideProposal(selected.id, "approve", reason?.trim() || "");
      setReason("");

      // ✅ UX: keep Draft tab selected; item becomes in_progress (drafting) and remains in Draft list
      setStatus("draft");
      await refreshProposals("Approved ✅ → Drafting", {
        status: "draft",
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
              // pass counts for tab badges (optional)
              stats={stats}
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