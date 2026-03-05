// src/components/ui/Badge.jsx (ULTRA v1 — Enterprise Chip System)
// ✅ 0dan yazıldı (old v3 silin)
// ✅ Serious SaaS chips (no toy pill vibe)
// ✅ Variants: solid | subtle | outline
// ✅ Sizes: sm | md
// ✅ Dot: optional (default true)
// ✅ API stays simple: tone, className, children (+ optional props)

import { cx } from "../../lib/cx.js";

function toneStyles(tone, variant) {
  const v = variant || "subtle";
  const t = tone || "neutral";

  // Neutral-first palette (professional)
  const map = {
    neutral: {
      solid:
        "bg-slate-900 text-white border-slate-900/10 dark:bg-slate-100 dark:text-slate-900 dark:border-white/10",
      subtle:
        "bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-200 dark:border-white/10",
      outline:
        "bg-transparent text-slate-700 border-slate-300 dark:text-slate-200 dark:border-white/15",
      dot: "bg-slate-400",
    },
    success: {
      solid:
        "bg-emerald-600 text-white border-emerald-600/10 dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-400/20",
      subtle:
        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-400/20",
      outline:
        "bg-transparent text-emerald-800 border-emerald-300 dark:text-emerald-200 dark:border-emerald-400/25",
      dot: "bg-emerald-500",
    },
    warn: {
      solid:
        "bg-amber-500 text-slate-950 border-amber-500/10 dark:bg-amber-400 dark:text-slate-950 dark:border-amber-300/20",
      subtle:
        "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/20",
      outline:
        "bg-transparent text-amber-900 border-amber-300 dark:text-amber-200 dark:border-amber-400/25",
      dot: "bg-amber-500",
    },
    danger: {
      solid:
        "bg-rose-600 text-white border-rose-600/10 dark:bg-rose-500 dark:text-slate-950 dark:border-rose-400/20",
      subtle:
        "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/20",
      outline:
        "bg-transparent text-rose-900 border-rose-300 dark:text-rose-200 dark:border-rose-400/25",
      dot: "bg-rose-500",
    },
    info: {
      solid:
        "bg-indigo-600 text-white border-indigo-600/10 dark:bg-indigo-500 dark:text-slate-950 dark:border-indigo-400/20",
      subtle:
        "bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-400/20",
      outline:
        "bg-transparent text-indigo-900 border-indigo-300 dark:text-indigo-200 dark:border-indigo-400/25",
      dot: "bg-indigo-500",
    },
  };

  const pack = map[t] || map.neutral;
  return { cls: pack[v] || pack.subtle, dot: pack.dot };
}

export default function Badge({
  tone = "neutral",
  variant = "subtle", // subtle | solid | outline
  size = "sm", // sm | md
  dot = true,
  className,
  children,
}) {
  const sizeCls =
    size === "md"
      ? "h-7 px-2.5 text-[12px]"
      : "h-6 px-2.25 text-[11px]";

  const { cls, dot: dotCls } = toneStyles(tone, variant);

  return (
    <span
      className={cx(
        // shape
        "inline-flex items-center gap-2 rounded-full border",
        // typography (NO Word vibe)
        "font-semibold leading-none tracking-[-0.01em]",
        // layout
        sizeCls,
        // surface
        cls,
        // subtle crispness
        "shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:shadow-none",
        "select-none whitespace-nowrap",
        className
      )}
    >
      {dot ? (
        <span
          className={cx(
            "h-1.5 w-1.5 rounded-full",
            dotCls,
            // quiet inner halo (premium)
            "shadow-[0_0_0_2px_rgba(255,255,255,0.65)] dark:shadow-[0_0_0_2px_rgba(2,6,23,0.65)]"
          )}
          aria-hidden="true"
        />
      ) : null}

      <span className="relative top-[0.5px]">{children}</span>
    </span>
  );
}