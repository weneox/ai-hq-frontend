import { useEffect, useMemo, useState } from "react";
import { Search, RefreshCcw } from "lucide-react";
import { cn } from "./proposal-ui.jsx";

const TABS = [
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
];

export default function ProposalToolbar({
  search,
  setSearch,
  status,
  setStatus,
  counts,
  wsStatus,
  onRefresh,
}) {
  const [refreshState, setRefreshState] = useState("idle");

  const live =
    wsStatus?.state === "connected" ||
    wsStatus?.state === "connecting" ||
    wsStatus?.state === "reconnecting";

  useEffect(() => {
    if (refreshState !== "done") return;
    const t = setTimeout(() => setRefreshState("idle"), 1600);
    return () => clearTimeout(t);
  }, [refreshState]);

  const handleRefresh = async () => {
    if (refreshState === "syncing") return;
    setRefreshState("syncing");
    try {
      await Promise.resolve(onRefresh?.());
      setRefreshState("done");
    } catch {
      setRefreshState("idle");
    }
  };

  const statusMeta = useMemo(() => {
    if (refreshState === "syncing") {
      return {
        title: "Syncing",
        subtitle: "Refreshing proposal state",
        dot: "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]",
        chip: "bg-cyan-400/[0.08] text-cyan-100 ring-cyan-300/16",
      };
    }

    if (refreshState === "done") {
      return {
        title: "Connected",
        subtitle: "State updated just now",
        dot: "bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]",
        chip: "bg-emerald-400/[0.08] text-emerald-100 ring-emerald-300/14",
      };
    }

    if (live) {
      return {
        title: "Connected",
        subtitle: "Live workspace link active",
        dot: "bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.82)]",
        chip: "bg-emerald-400/[0.08] text-emerald-100 ring-emerald-300/12",
      };
    }

    return {
      title: "Offline",
      subtitle: "Workspace link inactive",
      dot: "bg-white/28",
      chip: "bg-white/[0.04] text-white/74 ring-white/[0.06]",
    };
  }, [live, refreshState]);

  return (
    <section className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(180deg,rgba(3,9,20,0.96),rgba(2,7,17,0.84))] px-5 py-5 shadow-[0_28px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-2xl md:px-7 md:py-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_circle_at_0%_0%,rgba(34,211,238,0.06),transparent_34%),radial-gradient(860px_circle_at_100%_0%,rgba(59,130,246,0.06),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative flex flex-col gap-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.24fr)_460px] xl:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/48">
                Executive Proposal Surface
              </span>

              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/[0.07] px-3.5 py-1.5 text-[11px] font-medium text-cyan-100/88 ring-1 ring-inset ring-cyan-300/10">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.72)]" />
                Single-surface review
              </div>
            </div>

            <h2 className="mt-5 text-[38px] font-semibold tracking-[-0.085em] text-white md:text-[58px]">
              Proposals
            </h2>

            <p className="mt-4 max-w-[980px] text-[15px] leading-8 text-white/58 md:text-[16px]">
              Review, approve, and publish from one continuous executive surface
              with calmer hierarchy and cleaner controls.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <MetricCard label="Active queue" value={counts?.draft ?? 0} tone="cyan" />
            <MetricCard label="Approved" value={counts?.approved ?? 0} tone="emerald" />
            <MetricCard label="Published" value={counts?.published ?? 0} tone="amber" />
          </div>
        </div>

        <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.018))] p-3.5 ring-1 ring-inset ring-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {TABS.map((tab) => {
                const active = status === tab.value;
                const count = counts?.[tab.value] ?? 0;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatus(tab.value)}
                    className={cn(
                      "group inline-flex h-12 items-center gap-2.5 rounded-full px-5 text-[13px] font-medium transition-all duration-200",
                      active
                        ? "bg-white/[0.085] text-white ring-1 ring-inset ring-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_34px_rgba(0,0,0,0.18)]"
                        : "text-white/44 hover:bg-white/[0.04] hover:text-white/82"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full transition-all duration-200",
                        active
                          ? "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.72)]"
                          : "bg-white/18 group-hover:bg-white/28"
                      )}
                    />
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        "text-[12px]",
                        active
                          ? "text-white/72"
                          : "text-white/30 group-hover:text-white/46"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-end xl:w-auto">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "inline-flex h-12 min-w-[244px] items-center gap-3 rounded-full px-4 pr-5 ring-1 ring-inset transition-all duration-300",
                    statusMeta.chip
                  )}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      statusMeta.dot,
                      refreshState === "syncing" && "animate-pulse"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium leading-none">
                      {statusMeta.title}
                    </div>
                    <div className="mt-1 truncate text-[11px] leading-none text-white/58">
                      {statusMeta.subtitle}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-white/60 ring-1 ring-inset ring-white/[0.06] transition-all duration-200",
                    "hover:bg-white/[0.065] hover:text-white hover:ring-white/[0.1]",
                    refreshState === "syncing" &&
                      "bg-cyan-400/[0.08] text-cyan-100 ring-cyan-300/18 shadow-[0_0_24px_rgba(34,211,238,0.12)]",
                    refreshState === "done" &&
                      "bg-emerald-400/[0.08] text-emerald-100 ring-emerald-300/16"
                  )}
                  aria-label="Refresh proposals"
                >
                  <RefreshCcw
                    className={cn(
                      "h-4.5 w-4.5 transition-transform duration-700",
                      refreshState === "syncing" && "rotate-[180deg]"
                    )}
                  />
                </button>
              </div>

              <label className="relative block min-w-0 flex-1 lg:min-w-[360px] xl:min-w-[420px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/26" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search proposals, agent, caption, campaign..."
                  className="h-14 w-full rounded-full bg-white/[0.04] pl-11 pr-5 text-[14px] text-white outline-none ring-1 ring-inset ring-white/[0.06] placeholder:text-white/28 transition-all duration-200 focus:bg-white/[0.055] focus:ring-cyan-300/18 focus:shadow-[0_10px_34px_rgba(0,0,0,0.16)]"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, tone = "cyan" }) {
  const toneMap = {
    cyan: "bg-[linear-gradient(180deg,rgba(34,211,238,0.05),rgba(255,255,255,0.02))] ring-white/[0.08]",
    emerald: "bg-[linear-gradient(180deg,rgba(16,185,129,0.06),rgba(255,255,255,0.02))] ring-white/[0.08]",
    amber: "bg-[linear-gradient(180deg,rgba(245,158,11,0.06),rgba(255,255,255,0.02))] ring-white/[0.08]",
  };

  const dotTone = {
    cyan: "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.72)]",
    emerald: "bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.72)]",
    amber: "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.72)]",
  };

  return (
    <div
      className={cn(
        "rounded-[26px] p-5 ring-1 ring-inset shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        toneMap[tone]
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("h-2.5 w-2.5 rounded-full", dotTone[tone])} />
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/72">
          {label}
        </div>
      </div>

      <div className="mt-5 text-[44px] font-semibold leading-none tracking-[-0.07em] text-white">
        {value}
      </div>
    </div>
  );
}