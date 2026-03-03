// src/components/TopBar.jsx (PREMIUM FINAL)
import { RefreshCw, Radio, Copy } from "lucide-react";
import { getApiBase } from "../api/client.js";
import Badge from "./ui/Badge.jsx";
import Button from "./ui/Button.jsx";
import Card from "./ui/Card.jsx";

function wsTone(state) {
  switch (state) {
    case "connected":
      return "success";
    case "reconnecting":
    case "connecting":
      return "warn";
    case "disconnected":
    case "error":
      return "danger";
    case "off":
      return "neutral";
    default:
      return "neutral";
  }
}

function pulseColor(state) {
  switch (state) {
    case "connected":
      return "bg-emerald-400";
    case "connecting":
    case "reconnecting":
      return "bg-amber-400";
    case "error":
    case "disconnected":
      return "bg-rose-400";
    default:
      return "bg-slate-400";
  }
}
function pingColor(state) {
  switch (state) {
    case "connected":
      return "bg-emerald-400/35";
    case "connecting":
    case "reconnecting":
      return "bg-amber-400/35";
    case "error":
    case "disconnected":
      return "bg-rose-400/35";
    default:
      return "bg-slate-400/25";
  }
}

function StatPill({ label, value, tone }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
      <span className="opacity-75">{label}</span>
      <Badge tone={tone || "neutral"} className="px-2 py-0.5">
        {value ?? 0}
      </Badge>
    </span>
  );
}

export default function TopBar({ wsStatus, onRefresh, stats, toast }) {
  const api = getApiBase() || "";
  const state = wsStatus?.state || "disconnected";

  const copyApi = async () => {
    try {
      await navigator.clipboard.writeText(String(api || ""));
    } catch {}
  };

  return (
    <Card variant="glass" padded={false} className="overflow-hidden min-w-0">
      <div className="h-1 bg-gradient-to-r from-indigo-500/60 via-cyan-400/45 to-emerald-400/45 dark:from-indigo-400/45 dark:via-cyan-300/35 dark:to-emerald-300/35" />

      <div className="p-4 md:p-5 min-w-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            {/* Title row */}
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <div className="text-lg font-semibold tracking-tight">Proposals</div>

              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pingColor(state)}`} />
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${pulseColor(state)}`} />
                </span>
                <Radio className="h-3.5 w-3.5 opacity-80" />
                live
              </span>

              {toast ? (
                <Badge tone="info" className="shrink-0">
                  {toast}
                </Badge>
              ) : null}
            </div>

            {/* Meta row */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
              {api ? (
                <span className="inline-flex items-center gap-2 min-w-0 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
                  <span className="inline-block min-w-0 max-w-[72vw] sm:max-w-[520px] truncate" title={api}>
                    API: {api}
                  </span>
                  <button
                    type="button"
                    onClick={copyApi}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white/80 p-1 text-slate-700 transition-all hover:bg-white hover:shadow-sm active:translate-y-[1px]
                               dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-900/60"
                    aria-label="Copy API base"
                    title="Copy API base"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </span>
              ) : null}

              <Badge tone={wsTone(state)} className="shrink-0">
                WS: {state}
                {wsStatus?.delayMs ? ` · retry ${Math.round(wsStatus.delayMs)}ms` : ""}
              </Badge>

              {/* Stats as premium pills */}
              {stats ? (
                <div className="flex flex-wrap items-center gap-2">
                  <StatPill label="Pending" value={stats.pending} tone="warn" />
                  <StatPill label="Drafting" value={stats.in_progress ?? 0} tone="neutral" />
                  <StatPill label="Approved" value={stats.approved} tone="success" />
                  <StatPill label="Rejected" value={stats.rejected} tone="danger" />
                </div>
              ) : null}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:justify-end">
            <Button variant="outline" size="md" onClick={onRefresh} className="whitespace-nowrap">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}