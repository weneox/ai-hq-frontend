// src/components/ui/Badge.jsx (ULTRA v2 — Enterprise Chip System)
// ✅ Clean, not toy-pill, consistent with Card/Input/Tabs
// ✅ Variants: solid | subtle | outline
// ✅ Sizes: sm | md
// ✅ Dot optional
import { cx } from "../../lib/cx.js";

const TONES = {
  neutral: {
    solid:
      "bg-slate-900 text-white border-slate-900/10 dark:bg-slate-100 dark:text-slate-900 dark:border-white/10",
    subtle:
      "bg-slate-100/70 text-slate-700 border-slate-200 dark:bg-white/6 dark:text-slate-200 dark:border-white/10",
    outline:
      "bg-transparent text-slate-700 border-slate-300 dark:text-slate-200 dark:border-white/14",
    dot: "bg-slate-400",
  },
  success: {
    solid:
      "bg-emerald-600 text-white border-emerald-600/15 dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-300/25",
    subtle:
      "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-400/20",
    outline:
      "bg-transparent text-emerald-900 border-emerald-300 dark:text-emerald-200 dark:border-emerald-400/25",
    dot: "bg-emerald-500",
  },
  warn: {
    solid:
      "bg-amber-500 text-slate-950 border-amber-500/15 dark:bg-amber-400 dark:text-slate-950 dark:border-amber-300/25",
    subtle:
      "bg-amber-50 text-amber-950 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/20",
    outline:
      "bg-transparent text-amber-950 border-amber-300 dark:text-amber-200 dark:border-amber-400/25",
    dot: "bg-amber-500",
  },
  danger: {
    solid:
      "bg-rose-600 text-white border-rose-600/15 dark:bg-rose-500 dark:text-slate-950 dark:border-rose-400/25",
    subtle:
      "bg-rose-50 text-rose-950 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/20",
    outline:
      "bg-transparent text-rose-950 border-rose-300 dark:text-rose-200 dark:border-rose-400/25",
    dot: "bg-rose-500",
  },
  info: {
    solid:
      "bg-indigo-600 text-white border-indigo-600/15 dark:bg-indigo-500 dark:text-slate-950 dark:border-indigo-400/25",
    subtle:
      "bg-indigo-50 text-indigo-950 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-400/20",
    outline:
      "bg-transparent text-indigo-950 border-indigo-300 dark:text-indigo-200 dark:border-indigo-400/25",
    dot: "bg-indigo-500",
  },
};

function pack(tone = "neutral") {
  return TONES[tone] || TONES.neutral;
}

export default function Badge({
  tone = "neutral",
  variant = "subtle",
  size = "sm",
  dot = false,
  className,
  children,
}) {
  const p = pack(tone);

  const sizeCls =
    size === "md"
      ? "h-7 px-2.5 text-[12px] rounded-xl"
      : "h-6 px-2.25 text-[11px] rounded-lg";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 border",
        "font-semibold leading-none tracking-[-0.01em]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]",
        "select-none whitespace-nowrap",
        "transition-[background-color,border-color,color] duration-200",
        sizeCls,
        p[variant] || p.subtle,
        className
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cx(
            "h-1.5 w-1.5 rounded-full",
            p.dot,
            "shadow-[0_0_0_2px_rgba(255,255,255,0.65)] dark:shadow-[0_0_0_2px_rgba(2,6,23,0.65)]"
          )}
        />
      ) : null}
      <span className="relative top-[0.25px]">{children}</span>
    </span>
  );
}