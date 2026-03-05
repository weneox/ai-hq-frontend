// src/components/TopBar.jsx (ELITE v5.1 — FLAT HEADER STRIP, NO CARD LOOK)
import { Copy, Link2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { getApiBase } from "../api/client.js";
import Button from "./ui/Button.jsx";

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function wsDot(state) {
  if (state === "connected") return "bg-emerald-500";
  if (state === "connecting" || state === "reconnecting") return "bg-amber-500";
  if (state === "disconnected" || state === "error") return "bg-rose-500";
  return "bg-slate-400";
}

export default function TopBar({ wsStatus, onRefresh, stats, toast, title = "Proposals" }) {
  const api = getApiBase() || "";
  const host = hostOf(api);
  const state = wsStatus?.state || "disconnected";
  const WsIcon = state === "connected" ? Wifi : WifiOff;

  const draft = stats?.draft ?? 0;
  const approved = stats?.approved ?? 0;
  const published = stats?.published ?? 0;
  const rejected = stats?.rejected ?? 0;

  const copyApi = async () => {
    try {
      await navigator.clipboard.writeText(String(api || ""));
    } catch {}
  };

  return (
    <div className="min-w-0">
      {/* flat strip */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* left */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-[18px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </div>

              <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                <span className={`h-2 w-2 rounded-full ${wsDot(state)}`} />
                <WsIcon className="h-4 w-4 opacity-80" />
                {state}
              </div>

              {toast ? (
                <div className="hidden md:block rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
                  {toast}
                </div>
              ) : null}
            </div>

            <div className="mt-1 text-[12px] font-medium text-slate-500 dark:text-slate-400">
              Draft → Approve → Publish
            </div>
          </div>

          {/* right */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end">
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Draft
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {draft}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Approved
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                {approved}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Published
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {published}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Rejected
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-rose-700 dark:text-rose-300">
                {rejected}
              </span>
            </div>

            <Button variant="outline" size="md" onClick={onRefresh} className="h-9 rounded-xl">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* api line */}
        {api ? (
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] dark:border-slate-800 dark:bg-slate-900/30">
            <Link2 className="h-4 w-4 opacity-80" />
            <div className="min-w-0 truncate font-semibold text-slate-900 dark:text-slate-100">
              {host ? `${host}` : "API"}
              <span className="mx-2 opacity-40">—</span>
              <span className="font-medium opacity-80">{api}</span>
            </div>
            <button
              type="button"
              onClick={copyApi}
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 active:translate-y-[1px]
                         dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900/60"
              aria-label="Copy API"
              title="Copy API"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}