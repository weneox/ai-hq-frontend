// src/components/TopBar.jsx
import { RefreshCw, Radio } from "lucide-react";
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

export default function TopBar({ wsStatus, onRefresh, stats, toast }) {
  const api = getApiBase() || "";
  const state = wsStatus?.state || "disconnected";

  return (
    <Card variant="glass" padded={false} className="overflow-hidden min-w-0">
      <div className="h-1 bg-gradient-to-r from-indigo-500/60 via-cyan-400/45 to-emerald-400/45 dark:from-indigo-400/45 dark:via-cyan-300/35 dark:to-emerald-300/35" />

      <div className="p-4 md:p-5 min-w-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <div className="text-lg font-semibold tracking-tight">
                Proposals
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/35" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
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

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
              {api ? (
                <Badge tone="neutral" className="min-w-0 max-w-full">
                  <span className="inline-block min-w-0 max-w-[72vw] sm:max-w-[520px] truncate">
                    API: {api}
                  </span>
                </Badge>
              ) : null}

              <Badge tone={wsTone(state)} className="shrink-0">
                WS: {state}
                {wsStatus?.delayMs ? ` · retry ${Math.round(wsStatus.delayMs)}ms` : ""}
              </Badge>

              {stats ? (
                <Badge tone="neutral" className="shrink-0">
                  Pending {stats.pending} · Approved {stats.approved} · Rejected {stats.rejected}
                </Badge>
              ) : null}
            </div>
          </div>

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