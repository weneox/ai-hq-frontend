// src/pages/Proposals.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import ProposalList from "../components/ProposalList.jsx";
import ProposalDetail from "../components/ProposalDetail.jsx";

import { listProposals, decideProposal } from "../api/proposals.js";
import { createWsClient } from "../lib/ws.js";

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

  const selected = useMemo(
    () => proposals.find((x) => String(x.id) === String(selectedId)) || null,
    [proposals, selectedId]
  );

  const stats = useMemo(() => {
    let pending = 0,
      approved = 0,
      rejected = 0;
    for (const p of proposals) {
      const s = String(p.status || "").toLowerCase();
      if (s === "approved") approved++;
      else if (s === "rejected") rejected++;
      else pending++;
    }
    return { pending, approved, rejected };
  }, [proposals]);

  const refreshProposals = async (why = "") => {
    setErr("");
    try {
      const list = await listProposals(status);
      setProposals(list);
      if (!selectedId && list.length) setSelectedId(String(list[0].id));
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

  useEffect(() => {
    refreshProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const ws = createWsClient({
      onStatus: (s) => setWsStatus(s),
      onEvent: ({ type }) => {
        // UI-ya debug spam salmırıq — sadəcə refresh
        if (type === "proposal.created") refreshProposals("New proposal");
        else if (type === "proposal.updated") refreshProposals("Updated");
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

  useEffect(() => {
    const s = wsStatus?.state;
    if (s === "connected") return;
    const id = setInterval(() => refreshProposals(), 9000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsStatus?.state, status]);

  const onApprove = async () => {
    if (!selected) return;
    setDecisionBusy(true);
    setErr("");
    try {
      await decideProposal(selected.id, "approve", reason?.trim() || "");
      setReason("");
      await refreshProposals("Approved ✅");
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
      await refreshProposals("Rejected ❌");
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setDecisionBusy(false);
    }
  };

  return (
    <div className="min-w-0 flex flex-col gap-5">
      <TopBar
        wsStatus={wsStatus}
        onRefresh={() => refreshProposals("Refreshed")}
        stats={stats}
        toast={toast}
      />

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
        <div className="grid min-w-0 gap-5 items-stretch grid-cols-1 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
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

          <div className="min-w-0 min-h-0">
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
      )}
    </div>
  );
}