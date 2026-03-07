import { Search } from "lucide-react";
import { ToneBadge, cn } from "./proposal-ui.jsx";

export default function ProposalToolbar({
  search,
  setSearch,
  status,
  setStatus,
  counts,
}) {
  const tabs = [
    { value: "draft", label: "Draft" },
    { value: "approved", label: "Approved" },
    { value: "published", label: "Published" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(7,12,22,0.78),rgba(5,9,18,0.62))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl md:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(640px_circle_at_0%_0%,rgba(34,211,238,0.06),transparent_30%),radial-gradient(540px_circle_at_100%_0%,rgba(99,102,241,0.08),transparent_32%)]" />

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/46">
                Proposal Canvas
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/90 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
            </div>

            <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.05em] text-white md:text-[24px]">
              Single-surface review flow
            </h2>

            <p className="mt-1 max-w-[760px] text-[13px] leading-6 text-white/44">
              Kart seçəndə detail ayrıca paneldə yox, elə həmin səhnənin içində yumşaq genişlənərək açılır.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToneBadge tone="neutral">AI HQ</ToneBadge>
            <ToneBadge tone="success">Live</ToneBadge>
            <ToneBadge tone="neutral">Total {counts?.all ?? 0}</ToneBadge>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
              const active = status === tab.value;
              const count = counts?.[tab.value] ?? 0;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatus(tab.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-medium transition",
                    active
                      ? "border-white/[0.12] bg-white/[0.09] text-white"
                      : "border-white/[0.06] bg-white/[0.03] text-white/56 hover:bg-white/[0.05] hover:text-white/84"
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="text-white/34">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full xl:max-w-[360px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drafts, captions, agent…"
              className="h-12 w-full rounded-[18px] border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 text-[13px] text-white outline-none placeholder:text-white/26 focus:border-cyan-300/20 focus:bg-white/[0.055]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}