import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProposalToolbar from "./proposals/ProposalToolbar.jsx";
import ProposalCard from "./proposals/ProposalCard.jsx";
import ProposalExpanded from "./proposals/ProposalExpanded.jsx";
import {
  captionFrom,
  stageOf,
  titleFrom,
} from "../features/proposals/proposal.selectors.js";

export default function ProposalCanvas({
  proposals = [],
  status,
  setStatus,
  search,
  setSearch,
  onApprove,
  onReject,
  onPublish,
  onRequestChanges,
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

  const counts = useMemo(() => {
    const all = Array.isArray(proposals) ? proposals.length : 0;

    return {
      all,
      draft: proposals.filter((p) => stageOf(p) === "draft").length,
      approved: proposals.filter((p) => stageOf(p) === "approved").length,
      published: proposals.filter((p) => stageOf(p) === "published").length,
      rejected: proposals.filter((p) => stageOf(p) === "rejected").length,
    };
  }, [proposals]);

  useEffect(() => {
    if (!selected?.id) return;
    const fresh = proposals.find((p) => String(p?.id) === String(selected?.id));
    if (fresh) setSelected(fresh);
  }, [proposals, selected?.id]);

  return (
    <div className="relative space-y-5">
      <ProposalToolbar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        counts={counts}
      />

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={`expanded-${selected?.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {filtered.length === 0 ? (
              <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(7,12,22,0.76),rgba(5,9,18,0.60))] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
                <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
                  No items
                </div>
                <div className="mt-2 text-[13px] leading-6 text-white/40">
                  Bu filter üçün uyğun draft tapılmadı.
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
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