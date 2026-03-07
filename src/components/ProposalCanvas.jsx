import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  CircleDot,
  CheckCircle2,
  Send,
  XCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import ProposalCard from "./proposals/ProposalCard.jsx";
import ProposalExpanded from "./proposals/ProposalExpanded.jsx";
import {
  captionFrom,
  stageOf,
  titleFrom,
} from "../features/proposals/proposal.selectors.js";

const STATUS_META = {
  draft: {
    label: "Draft",
    icon: CircleDot,
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
  },
  published: {
    label: "Published",
    icon: Send,
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
  },
};

function tabClass(active) {
  return active
    ? "border-white/[0.14] bg-white/[0.10] text-white shadow-[0_10px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.05)]"
    : "border-white/[0.06] bg-white/[0.03] text-white/56 hover:border-white/[0.10] hover:bg-white/[0.06] hover:text-white";
}

function wsLabel(state) {
  if (state === "connected") return "Live";
  if (state === "connecting") return "Connecting";
  if (state === "reconnecting") return "Reconnecting";
  if (state === "off") return "Polling";
  if (state === "error") return "Error";
  return "Offline";
}

export default function ProposalCanvas({
  proposals = [],
  stats,
  status,
  setStatus,
  search,
  setSearch,
  onApprove,
  onReject,
  onPublish,
  onRequestChanges,
  onRefresh,
  toast,
  wsStatus,
  busy = false,
}) {
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    const byStatus = proposals.filter((p) => stageOf(p) === status);

    return byStatus.filter((p) => {
      const t = String(titleFrom(p) || "").toLowerCase();
      const c = String(captionFrom(p) || "").toLowerCase();
      const id = String(p?.id || "").toLowerCase();
      const agent = String(
        p?.agent_key || p?.agentKey || p?.agent || ""
      ).toLowerCase();

      return !q || t.includes(q) || c.includes(q) || id.includes(q) || agent.includes(q);
    });
  }, [proposals, status, search]);

  useEffect(() => {
    if (!selected?.id) return;
    const fresh = proposals.find((p) => String(p?.id) === String(selected?.id));
    if (fresh) setSelected(fresh);
  }, [proposals, selected?.id]);

  const CurrentStatusIcon = STATUS_META[status]?.icon || CircleDot;
  const wsState = wsStatus?.state || "disconnected";
  const WsIcon = wsState === "connected" ? Wifi : WifiOff;

  const counts = {
    draft: stats?.draft ?? 0,
    approved: stats?.approved ?? 0,
    published: stats?.published ?? 0,
    rejected: stats?.rejected ?? 0,
  };

  const currentCount = counts?.[status] ?? 0;

  const tabs = [
    { key: "draft", label: "Draft", count: counts.draft },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "published", label: "Published", count: counts.published },
    { key: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div className="relative space-y-6">
      <section className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(6,10,20,0.92),rgba(4,8,18,0.82))] shadow-[0_24px_80px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(980px_circle_at_0%_0%,rgba(34,211,238,0.08),transparent_30%),radial-gradient(820px_circle_at_100%_0%,rgba(59,130,246,0.08),transparent_26%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="relative px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/36">
                Proposal Canvas
              </div>

              <div className="mt-3">
                <h2 className="text-[38px] font-semibold leading-[0.96] tracking-[-0.06em] text-white md:text-[52px]">
                  Proposals
                </h2>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-white/44">
                <span className="font-medium text-white/72">
                  Single-surface review flow
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-white/18 md:inline-block" />
                <span>Draft → Approve → Publish</span>
              </div>

              <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-white/50 md:text-[15px]">
                Detallar ayrıca panelə keçmədən eyni səthdə açılır. Review prosesi
                kontekstdən çıxmadan davam edir və bütün proposal əməliyyatları vahid
                səhnədə idarə olunur.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[12px] text-white/68">
                <CurrentStatusIcon className="h-4 w-4" />
                <span className="font-medium">{currentCount}</span>
                <span className="text-white/48">{STATUS_META[status]?.label}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[12px] text-white/60">
                <WsIcon className="h-4 w-4" />
                <span>{wsLabel(wsState)}</span>
              </div>

              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 text-[12px] font-medium text-white/68 transition hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {tabs.map((tab) => {
                  const active = status === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatus(tab.key)}
                      className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-[14px] font-medium transition ${tabClass(
                        active
                      )}`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums ${
                          active
                            ? "bg-white/[0.08] text-white"
                            : "bg-white/[0.04] text-white/48"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="group relative block w-full xl:w-[440px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34 transition group-focus-within:text-white/58" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search drafts, captions, agent, ID..."
                  className="h-12 w-full rounded-[22px] border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 text-[14px] text-white placeholder:text-white/24 outline-none transition focus:border-white/[0.14] focus:bg-white/[0.06]"
                />
              </label>
            </div>

            {toast ? (
              <div className="mt-3 rounded-[18px] border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[12px] font-medium text-white/62">
                {toast}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={`expanded-${selected?.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <ProposalExpanded
              item={selected}
              onClose={() => setSelected(null)}
              onApprove={onApprove}
              onReject={onReject}
              onPublish={onPublish}
              onRequestChanges={onRequestChanges}
              busy={busy}
            />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered
                .filter((p) => String(p?.id) !== String(selected?.id))
                .slice(0, 3)
                .map((item) => (
                  <ProposalCard
                    key={item?.id}
                    item={item}
                    isDimmed
                    onOpen={setSelected}
                  />
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {filtered.length === 0 ? (
              <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(7,12,22,0.76),rgba(5,9,18,0.60))] p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
                <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
                  No items
                </div>
                <div className="mt-2 text-[13px] leading-6 text-white/40">
                  Bu filter üçün uyğun proposal tapılmadı.
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {filtered.map((item) => (
                  <ProposalCard
                    key={item?.id}
                    item={item}
                    onOpen={setSelected}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}