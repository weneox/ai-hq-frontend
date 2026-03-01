import { cx } from "../../lib/cx.js";

export default function Badge({ tone = "neutral", className, children }) {
  const base =
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 " +
    "text-[11px] font-medium tracking-[0.01em] " +
    "transition-all duration-200";

  const tones = {
    neutral:
      "border-slate-200/70 bg-slate-100/60 text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.05)] " +
      "dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-200",

    success:
      "border-emerald-200/70 bg-emerald-50/80 text-emerald-800 shadow-[0_1px_0_rgba(16,185,129,0.08)] " +
      "dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",

    warn:
      "border-amber-200/70 bg-amber-50/80 text-amber-900 shadow-[0_1px_0_rgba(245,158,11,0.08)] " +
      "dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",

    danger:
      "border-rose-200/70 bg-rose-50/80 text-rose-900 shadow-[0_1px_0_rgba(244,63,94,0.08)] " +
      "dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",

    info:
      "border-indigo-200/70 bg-indigo-50/80 text-indigo-900 shadow-[0_1px_0_rgba(99,102,241,0.08)] " +
      "dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200",
  };

  return (
    <span
      className={cx(
        base,
        tones[tone] || tones.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}