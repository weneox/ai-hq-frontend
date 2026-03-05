// src/components/ui/Badge.jsx (FINAL v3.0 — ELITE)
// ✅ Sharper chip, better dark-mode, no toy hover
// ✅ Subtle dot indicator
// ✅ Keeps API: tone, className, children

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
  const base = cx(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
    "text-[11px] font-semibold tracking-[0.02em] leading-none",
    "shadow-[0_1px_0_rgba(15,23,42,0.04)]",
    "select-none"
  );

  const tones = {
    neutral: cx(
      "border-slate-200/70 bg-white/70 text-slate-700",
      "dark:border-slate-800/70 dark:bg-slate-950/25 dark:text-slate-200"
    ),
    success: cx(
      "border-emerald-200/70 bg-emerald-50/70 text-emerald-900",
      "dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200"
    ),
    warn: cx(
      "border-amber-200/70 bg-amber-50/75 text-amber-950",
      "dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200"
    ),
    danger: cx(
      "border-rose-200/70 bg-rose-50/75 text-rose-950",
      "dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200"
    ),
    info: cx(
      "border-indigo-200/70 bg-indigo-50/70 text-indigo-950",
      "dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-200"
    ),
  };

  return (
    <span className={cx(base, tones[tone] || tones.neutral, className)}>
      <Dot tone={tone} />
      <span>{children}</span>
    </span>
  );
}