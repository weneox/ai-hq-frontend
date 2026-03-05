// src/components/ui/Badge.jsx (FINAL v2.0 — Premium Status Chip)
// ✅ cleaner, more enterprise, less "toy"
// ✅ subtle dot indicator
// ✅ keeps API: tone, className, children

import { cx } from "../../lib/cx.js";

function Dot({ tone }) {
  const dot =
    tone === "success"
      ? "bg-emerald-500/90"
      : tone === "warn"
      ? "bg-amber-500/90"
      : tone === "danger"
      ? "bg-rose-500/90"
      : tone === "info"
      ? "bg-indigo-500/90"
      : "bg-slate-400/80";

  return <span className={cx("h-1.5 w-1.5 rounded-full", dot)} aria-hidden="true" />;
}

export default function Badge({ tone = "neutral", className, children }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 " +
    "text-[11px] font-semibold tracking-[0.01em] " +
    "transition-all duration-200 " +
    "shadow-[0_1px_0_rgba(15,23,42,0.04)]";

  const tones = {
    neutral:
      "border-slate-200/70 bg-white/70 text-slate-700 " +
      "dark:border-slate-800/70 dark:bg-slate-950/25 dark:text-slate-200",

    success:
      "border-emerald-200/70 bg-emerald-50/70 text-emerald-800 " +
      "dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200",

    warn:
      "border-amber-200/70 bg-amber-50/75 text-amber-900 " +
      "dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200",

    danger:
      "border-rose-200/70 bg-rose-50/75 text-rose-900 " +
      "dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200",

    info:
      "border-indigo-200/70 bg-indigo-50/70 text-indigo-900 " +
      "dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-200",
  };

  return (
    <span className={cx(base, tones[tone] || tones.neutral, className)}>
      <Dot tone={tone} />
      <span className="leading-none">{children}</span>
    </span>
  );
}