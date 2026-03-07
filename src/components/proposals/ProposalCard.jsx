import { ChevronRight } from "lucide-react";
import {
  captionFrom,
  ctaFrom,
  formatFrom,
  rawStatusOf,
  relTime,
  stageLabel,
  stageOf,
  stageTone,
  tagsFrom,
  titleFrom,
  clip,
} from "../../features/proposals/proposal.selectors.js";
import { ToneBadge, cn } from "./proposal-ui.jsx";
import { motion } from "framer-motion";

export default function ProposalCard({ item, isDimmed, onOpen }) {
  const title = titleFrom(item);
  const caption = captionFrom(item);
  const tags = tagsFrom(item).slice(0, 3);
  const format = formatFrom(item);
  const cta = ctaFrom(item);
  const rawStatus = rawStatusOf(item);
  const stage = stageOf(item);
  const stageTxt = stageLabel(item);
  const agent = item?.agent_key || item?.agentKey || item?.agent || "agent";
  const when = relTime(item?.updated_at || item?.updatedAt || item?.created_at || item?.createdAt);

  return (
    <motion.button
      layoutId={`proposal-card-${item?.id}`}
      onClick={() => onOpen(item)}
      className={cn(
        "group relative overflow-hidden rounded-[28px] border p-5 text-left backdrop-blur-2xl transition duration-300",
        "border-white/[0.08] bg-[linear-gradient(180deg,rgba(7,12,22,0.82),rgba(5,9,18,0.64))]",
        "shadow-[0_22px_60px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.04)]",
        "hover:border-white/[0.12] hover:bg-[linear-gradient(180deg,rgba(8,14,24,0.86),rgba(6,10,20,0.68))]",
        isDimmed ? "scale-[0.985] opacity-30 blur-[1px]" : ""
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(320px_circle_at_0%_0%,rgba(34,211,238,0.06),transparent_34%),radial-gradient(280px_circle_at_100%_0%,rgba(99,102,241,0.08),transparent_36%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ToneBadge tone={stageTone(stage, rawStatus)}>
                {stage === "draft" ? "Draft" : stage}
              </ToneBadge>
              {format ? <ToneBadge tone="neutral">{format}</ToneBadge> : null}
            </div>

            <h3 className="mt-3 line-clamp-2 text-[18px] font-semibold leading-[1.15] tracking-[-0.04em] text-white">
              {title}
            </h3>
          </div>

          <div className="rounded-full border border-white/[0.08] bg-white/[0.04] p-2.5 text-white/46 transition group-hover:text-white/84">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-white/44">
          {clip(caption, 180) || "Draft content preview not available."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-white/36">
          <span className="font-medium text-white/54">{agent}</span>
          {when ? <span>· {when}</span> : null}
          {stageTxt ? <span>· {stageTxt}</span> : null}
          {cta ? <span>· CTA: {clip(cta, 22)}</span> : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.length ? (
            tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.06] bg-white/[0.035] px-2.5 py-1 text-[11px] text-white/60"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-white/28">No tags</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}