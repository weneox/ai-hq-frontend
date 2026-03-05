// src/pages/Proposals.jsx (FINAL v3.2 — PREMIUM layout framing + stable scroll)
// ✅ Same logic as v3.1 (kept)
// ✅ Premium page container + subtle separators
// ✅ Right panel: sticky on desktop, internal scroll only, no crop/glitch
// ✅ Better empty states placeholders
// ✅ Keeps selection stable + WS/poll unchanged

import { useEffect, useMemo, useRef, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import ProposalList from "../components/ProposalList.jsx";
import ProposalDetail from "../components/ProposalDetail.jsx";

import {
  listProposals,
  requestDraftChanges,
  approveDraft,
  rejectDraft,
  publishDraft,
} from "../api/proposals.js";

import { createWsClient } from "../lib/ws.js";

const BACKEND_STATUSES = ["draft", "in_progress", "approved", "published", "rejected", "pending"]; // pending = legacy safety
const UI_TABS = ["draft", "approved", "published", "rejected"];

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
function mergeDraftItems(draft, inProgress, pendingMaybe) {
  return uniqById([...(draft || []), ...(inProgress || []), ...(pendingMaybe || [])]).sort(
    sortNewestFirst
  );
}

function EmptyBox({ title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/35">
      <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{title}</div>
      <div className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{desc}</div>
    </div>
  );
}

export default function ProposalsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ default UI tab
  const [status, setStatus] = useState("draft");

  const [search, setSearch] = useState("");
  const [proposals, setProposals] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const [wsStatus, setWsStatus] = useState({ state: "disconnected" });
  const wsClientRef = useRef(null);

  // keep backend counts + UI helper
  const [stats, setStats] = useState({
    draft: 0, // UI merged draft count
    in_progress: 0,
    approved: 0,
    published: 0,
    rejected: 0,
    pending: 0, // legacy backend count
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
        draft: 0,
        in_progress: 0,
        approved: 0,
        published: 0,
        rejected: 0,
        pending: 0,
      };

      for (const x of results) {
        if (x.status !== "fulfilled") continue;
        const { status: s, items } = x.value || {};
        if (!s) continue;
        next[s] = Array.isArray(items) ? items.length : 0;
      }

      // ✅ UI Draft count = backend draft + in_progress + pending
      next.draft = (next.draft || 0) + (next.in_progress || 0) + (next.pending || 0);

      setStats(next);
    } catch {
      // ignore
    }
  };

  const fetchByUiStatus = async (uiStatus) => {
    const s = String(uiStatus || "draft").toLowerCase();

    if (s === "draft") {
      const [a, b, c] = await Promise.all([
        listProposals("draft"),
        listProposals("in_progress"),
        listProposals("pending"), // legacy safety
      ]);
      return mergeDraftItems(normalizeList(a), normalizeList(b), normalizeList(c));
    }

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

      // stable selection
      if (next.length === 0) {
        // keep selectedId as-is (user may switch tab)
      } else {
        const stillExists =
          keepSelectedId && next.some((p) => String(p.id) === String(keepSelectedId));
        setSelectedId(stillExists ? String(keepSelectedId) : String(next[0].id));
      }

      if (why) showToast(why);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  // initial + tab change
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
        const isContentEvent = type === "content.updated";
        const isExecEvent = type === "execution.updated" || type === "job.updated";

        if (isProposalEvent || isContentEvent || isExecEvent) {
          refreshStats();
          refreshProposals(isProposalEvent && type === "proposal.created" ? "New item" : "", {
            status,
            keepSelectedId: selectedId,
          });

          const pid = payload?.proposalId || payload?.proposal_id || payload?.id;
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

  // Poll fallback
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

  // ---------- Draft actions (UI -> backend) ----------
  const onRequestChanges = async (proposalId, contentId, feedbackText) => {
    setBusy(true);
    setErr("");
    try {
      await requestDraftChanges(proposalId, contentId, feedbackText);
      await refreshProposals("Changes requested ✅", { status, keepSelectedId: proposalId });
      await refreshStats();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const onApproveDraft = async (proposalId, contentId) => {
    setBusy(true);
    setErr("");
    try {
      await approveDraft(proposalId, contentId);

      await refreshStats();

      if (status === "draft") {
        setStatus("approved");
        await refreshProposals("Draft approved ✅", {
          status: "approved",
          keepSelectedId: proposalId,
        });
      } else {
        await refreshProposals("Draft approved ✅", { status, keepSelectedId: proposalId });
      }
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const onRejectDraft = async (proposalId, contentId, reasonText) => {
    setBusy(true);
    setErr("");
    try {
      await rejectDraft(proposalId, contentId, reasonText);

      await refreshStats();

      setStatus("rejected");
      await refreshProposals("Rejected ❌", { status: "rejected", keepSelectedId: proposalId });
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const onPublish = async (proposalId, contentId) => {
    setBusy(true);
    setErr("");
    try {
      await publishDraft(proposalId, contentId);

      await refreshStats();
      await refreshProposals("Publish requested ✅", { status, keepSelectedId: proposalId });
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
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
        <div className="rounded-2xl border border-rose-200/70 bg-rose-50/80 p-4 text-sm text-rose-900 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {err}
        </div>
      ) : null}

      {loading ? (
        <EmptyBox title="Loading…" desc="Fetching proposals and drafts from backend." />
      ) : proposals.length === 0 ? (
        <EmptyBox
          title="No items yet"
          desc={
            status === "draft"
              ? "Drafts will appear here (including in_progress). Trigger a daily cron or create a new proposal."
              : "Nothing in this tab yet."
          }
        />
      ) : (
        <div className="grid min-w-0 min-h-0 gap-5 items-stretch grid-cols-1 xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
          {/* LEFT */}
          <div className="min-w-0 min-h-0">
            <ProposalList
              proposals={proposals}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              status={status}
              setStatus={(s) => {
                const next = UI_TABS.includes(String(s)) ? String(s) : "draft";
                setStatus(next);
              }}
              search={search}
              setSearch={setSearch}
              stats={stats}
            />
          </div>

          {/* RIGHT */}
          <div className="min-w-0 min-h-0">
            {/* Desktop: sticky panel; Mobile: normal flow */}
            <div className="xl:sticky xl:top-[calc(20px+84px)]">
              <div
                className={cx(
                  "min-w-0 min-h-0 overflow-hidden rounded-2xl",
                  "border border-slate-200/70 bg-white/70 backdrop-blur-xl",
                  "shadow-[0_12px_44px_-28px_rgba(2,6,23,0.35)]",
                  "dark:border-slate-800 dark:bg-slate-950/35"
                )}
                style={{
                  // on desktop keep it within viewport; header+gaps are already in Shell
                  maxHeight: "calc(100dvh - 160px)",
                }}
              >
                <div className="min-h-0 h-full overflow-auto">
                  <ProposalDetail
                    proposal={selected}
                    busy={busy}
                    draftBusy={busy}
                    onRequestChanges={onRequestChanges}
                    onApproveDraft={onApproveDraft}
                    onRejectDraft={onRejectDraft}
                    onPublish={onPublish}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}