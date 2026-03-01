// src/components/ProposalDetail.jsx
import { useMemo, useState } from "react";
import Card from "./ui/Card.jsx";
import Badge from "./ui/Badge.jsx";
import Button from "./ui/Button.jsx";
import {
  parsePayload,
  titleOf,
  summaryOf,
  rowsForOverview,
  pretty,
  relTime,
  shortId,
  safeText,
} from "../lib/uiFormat.js";

function badgeTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return "warn";
  if (s === "approved") return "success";
  if (s === "rejected") return "danger";
  return "neutral";
}

function asDisplay(v) {
  if (v == null) return "";
  if (typeof v === "string") return safeText(v, 180);
  if (Array.isArray(v)) return safeText(v.join(", "), 180);
  if (typeof v === "object") return safeText(pretty(v), 180);
  return String(v);
}

export default function ProposalDetail({
  proposal,
  busy,
  reason,
  setReason,
  onApprove,
  onReject,
}) {
  const [showFull, setShowFull] = useState(false);

  const payload = useMemo(() => parsePayload(proposal), [proposal]);
  const title = useMemo(
    () => (proposal ? titleOf(proposal) : "Proposal"),
    [proposal]
  );
  const summary = useMemo(
    () => (proposal ? summaryOf(proposal) : ""),
    [proposal]
  );
  const rows = useMemo(() => rowsForOverview(payload), [payload]);

  if (!proposal) {
    return (
      <Card className="min-w-0 h-full flex flex-col justify-center items-center text-center">
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Select a proposal
        </div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-[420px]">
          Soldakı queue-dan bir proposal seç — burada qərar paneli açılacaq.
        </div>
      </Card>
    );
  }

  const agent = proposal.agent_key || proposal.agentKey || proposal.agent || "—";
  const created = relTime(proposal.created_at || proposal.createdAt);
  const status = proposal.status || "pending";

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(String(proposal.id));
    } catch {}
  };

  return (
    <Card className="min-w-0 p-0 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-start gap-2 min-w-0">
              <h2
                className={[
                  "text-base sm:text-lg font-semibold leading-snug min-w-0",
                  showFull ? "break-words" : "line-clamp-2 break-words",
                ].join(" ")}
                title={title}
              >
                {title}
              </h2>

              {String(title).length > 80 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFull((v) => !v)}
                  className="shrink-0"
                >
                  {showFull ? "Less" : "More"}
                </Button>
              ) : null}
            </div>

            {summary ? (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {summary}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Agent</span>
                {agent}
              </span>
              <span className="opacity-60">·</span>
              <span className="inline-flex items-center gap-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Created</span>
                {created}
              </span>
              <span className="opacity-60">·</span>
              <span className="inline-flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Ref</span>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 dark:border-slate-800 dark:bg-slate-900/60">
                  PR-{shortId(proposal.id).toUpperCase()}
                </span>
                <Button variant="outline" size="sm" onClick={copyId}>
                  Copy ID
                </Button>
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <Badge tone={badgeTone(status)}>{status}</Badge>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-4 min-w-0 overflow-auto">
        {/* Overview */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/30 min-w-0">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Overview
          </div>

          {rows.length === 0 ? (
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Payload-da CEO üçün seçilən sahələr yoxdur.
            </div>
          ) : (
            <div className="mt-3 grid gap-2 md:grid-cols-2 min-w-0">
              {rows.map((r) => (
                <div
                  key={r.k}
                  className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60 min-w-0"
                >
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {r.label}
                  </div>
                  <div className="mt-1 text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
                    {asDisplay(r.v)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decision */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/30 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Decision
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Reject üçün reason məcburidir
            </div>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={6}
            className="mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-2 text-sm outline-none transition-all duration-200
                       focus:border-indigo-300/80 focus:ring-2 focus:ring-indigo-500/25 focus:ring-offset-2 focus:ring-offset-white
                       dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500/50 dark:focus:ring-indigo-500/25 dark:focus:ring-offset-slate-950"
            placeholder="Qısa səbəb / qeyd…"
          />

          <div className="mt-3 flex flex-wrap gap-2 min-w-0">
            <Button variant="primary" disabled={busy} onClick={onApprove} className="flex-1 min-w-[160px]">
              Approve
            </Button>
            <Button variant="destructive" disabled={busy} onClick={onReject} className="flex-1 min-w-[160px]">
              Reject
            </Button>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Approve → backend n8n workflow-a event atır.
          </div>
        </div>

        {/* Advanced (Raw JSON hidden by default) */}
        <details className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/30 min-w-0">
          <summary className="cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-200">
            Advanced (Raw payload)
          </summary>

          <pre className="mt-3 max-h-[520px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-xs whitespace-pre-wrap break-words dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100">
            {pretty(payload)}
          </pre>
        </details>
      </div>
    </Card>
  );
}