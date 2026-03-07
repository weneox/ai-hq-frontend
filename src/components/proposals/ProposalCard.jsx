import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  captionFrom,
  formatFrom,
  rawStatusOf,
  relTime,
  stageOf,
  stageTone,
  tagsFrom,
  titleFrom,
  clip,
} from "../../features/proposals/proposal.selectors.js";
import { ToneBadge, SurfacePill } from "./proposal-ui.jsx";
import { cn } from "./proposal-utils.js";

function accentByStage(stage) {
  if (stage === "approved") {
    return {
      glow: "bg-[radial-gradient(320px_circle_at_0%_0%,rgba(16,185,129,0.12),transparent_34%),radial-gradient(260px_circle_at_100%_0%,rgba(20,184,166,0.08),transparent_38%)]",
      orb: "from-emerald-300/80 via-emerald-400/45 to-transparent",
      rail: "bg-emerald-300/55",
      border: "group-hover:border-emerald-300/18",
    };
  }

  if (stage === "published") {
    return {
      glow: "bg-[radial-gradient(320px_circle_at_0%_0%,rgba(59,130,246,0.12),transparent_34%),radial-gradient(260px_circle_at_100%_0%,rgba(99,102,241,0.08),transparent_38%)]",
      orb: "from-sky-300/80 via-blue-400/45 to-transparent",
      rail: "bg-sky-300/55",
      border: "group-hover:border-sky-300/18",
    };
  }

  if (stage === "rejected") {
    return {
      glow: "bg-[radial-gradient(320px_circle_at_0%_0%,rgba(244,63,94,0.10),transparent_34%),radial-gradient(260px_circle_at_100%_0%,rgba(251,113,133,0.07),transparent_38%)]",
      orb: "from-rose-300/75 via-rose-400/42 to-transparent",
      rail: "bg-rose-300/55",
      border: "group-hover:border-rose-300/18",
    };
  }

  return {
    glow: "bg-[radial-gradient(340px_circle_at_0%_0%,rgba(34,211,238,0.11),transparent_34%),radial-gradient(280px_circle_at_100%_0%,rgba(99,102,241,0.09),transparent_38%)]",
    orb: "from-cyan-300/78 via-sky-400/45 to-transparent",
    rail: "bg-cyan-300/55",
    border: "group-hover:border-cyan-300/18",
  };
}

export default function ProposalCard({ item, isDimmed, onOpen }) {
  const title = titleFrom(item);
  const caption = captionFrom(item);
  const allTags = tagsFrom(item);
  const visibleTags = allTags.slice(0, 2);
  const extraTagCount = Math.max(0, allTags.length - visibleTags.length);
  const format = formatFrom(item);
  const rawStatus = rawStatusOf(item);
  const stage = stageOf(item);
  const when = relTime(
    item?.updated_at || item?.updatedAt || item?.created_at || item?.createdAt
  );

  const metaParts = [format, when, stage === "draft" ? "Draft" : stage]
    .filter(Boolean)
    .slice(0, 3);

  const accent = accentByStage(stage);

  return (
    <motion.button
      layoutId={`proposal-card-${item?.id}`}
      onClick={() => onOpen(item)}
      className={cn(
        "group relative overflow-hidden rounded-[34px] border p-0 text-left",
        "transform-gpu will-change-transform",
        "transition-[border-color,opacity,filter,box-shadow,transform] duration-200 ease-out",
        "border-white/[0.055]",
        "bg-[linear-gradient(180deg,rgba(5,10,20,0.94),rgba(4,8,16,0.90))]",
        "shadow-[0_18px_40px_rgba(0,0,0,0.24),0_2px_10px_rgba(0,0,0,0.18)]",
        accent.border,
        "hover:shadow-[0_26px_54px_rgba(0,0,0,0.30),0_10px_24px_rgba(0,0,0,0.20)]",
        isDimmed ? "scale-[0.992] opacity-35 blur-[0.5px]" : ""
      )}
      whileHover={{
        y: -5,
        scale: 1.006,
      }}
      whileTap={{ scale: 0.997 }}
      transition={{ type: "tween", duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={cn("pointer-events-none absolute inset-0 opacity-80", accent.glow)} />

      <div className="pointer-events-none absolute inset-0 rounded-[34px] ring-1 ring-inset ring-white/[0.025]" />

      <div className="relative flex h-full flex-col px-6 pb-6 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full bg-gradient-to-br shadow-[0_0_14px_rgba(56,189,248,0.28)]",
                  accent.orb
                )}
              />

              <div className="flex flex-wrap items-center gap-2">
                <ToneBadge tone={stageTone(stage, rawStatus)}>
                  {stage === "draft" ? "Draft" : stage}
                </ToneBadge>

                {format ? (
                  <ToneBadge tone="neutral" className="text-white/60">
                    {format}
                  </ToneBadge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.025] text-white/42 transition-all duration-200 ease-out group-hover:border-white/[0.09] group-hover:bg-white/[0.04] group-hover:text-white/78">
              <ChevronRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-[1px]" />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="max-w-[92%] line-clamp-2 text-[18px] font-semibold leading-[1.06] tracking-[-0.048em] text-white md:text-[18px]">
            {title}
          </h3>

          <p className="mt-4 max-w-[92%] line-clamp-3 text-[13px] leading-7 text-white/46 transition-colors duration-200 group-hover:text-white/56">
            {clip(caption, 150) || "Draft content preview not available."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/32">
          {metaParts.map((part, idx) => (
            <span key={`${part}-${idx}`} className="inline-flex items-center gap-2">
              {idx > 0 ? <span className="text-white/14">•</span> : null}
              <span className={idx === 0 ? "text-white/50" : ""}>{part}</span>
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {visibleTags.length ? (
              <>
                {visibleTags.map((tag) => (
                  <SurfacePill key={tag}>{tag}</SurfacePill>
                ))}

                {extraTagCount > 0 ? (
                  <SurfacePill className="text-white/32">+{extraTagCount}</SurfacePill>
                ) : null}
              </>
            ) : (
              <SurfacePill className="text-white/26">No tags</SurfacePill>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className={cn("h-1.5 w-8 rounded-full opacity-65", accent.rail)} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}