// src/components/ui/Card.jsx (FINAL v3.0 — Elite Surface System)
// ✅ Cleaner, sharper, higher-end “surface” feel
// ✅ Better dark-mode border logic (less grey mud)
// ✅ Hover physics refined (no glow spam)
// ✅ Variants: panel | soft | elevated | glass
// ✅ Props: variant, padded, clip, interactive, tone

import { cx } from "../../lib/cx.js";

export default function Card({
  className,
  children,
  variant = "panel",
  interactive = false,
  padded = "md",
  clip = false,
  tone = "neutral",
}) {
  const pad =
    padded === false
      ? "p-0"
      : padded === "sm"
      ? "p-3 md:p-4"
      : padded === "lg"
      ? "p-5 md:p-6"
      : "p-4 md:p-5";

  const base = cx(
    "relative min-w-0 rounded-[calc(var(--radius)+6px)] border",
    clip ? "overflow-hidden" : "overflow-visible",
    "transition-[transform,box-shadow,border-color,background-color] duration-200",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2",
    "focus-within:ring-offset-white dark:focus-within:ring-offset-slate-950",
    pad
  );

  // Surface variants (quiet, premium)
  const panel = cx(
    "bg-white border-slate-200/70",
    "shadow-elite-sm",
    "dark:bg-slate-950/40 dark:border-slate-800/70",
    "dark:shadow-elite-dark-sm"
  );

  const soft = cx(
    "bg-white/70 border-slate-200/55",
    "shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_36px_-44px_rgba(2,6,23,0.22)]",
    "dark:bg-slate-950/22 dark:border-slate-800/55",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_14px_44px_-50px_rgba(0,0,0,0.72)]"
  );

  const elevated = cx(
    "bg-white border-slate-200/80",
    "shadow-elite-md",
    "dark:bg-slate-950/60 dark:border-slate-800/80",
    "dark:shadow-elite-dark-md"
  );

  const glass = cx(
    "bg-white/62 border-slate-200/65 backdrop-blur-xl",
    "shadow-elite-lg",
    "dark:bg-slate-950/52 dark:border-slate-800/70",
    "dark:shadow-elite-dark-lg"
  );

  const v =
    variant === "glass"
      ? glass
      : variant === "elevated"
      ? elevated
      : variant === "soft"
      ? soft
      : panel;

  // Tone ring (very subtle)
  const ring =
    tone === "info"
      ? "ring-sky-500/14"
      : tone === "success"
      ? "ring-emerald-500/14"
      : tone === "warn"
      ? "ring-amber-500/16"
      : tone === "danger"
      ? "ring-rose-500/14"
      : "ring-indigo-500/12";

  // Minimal glow only for elevated/glass
  const glow =
    tone === "info"
      ? "from-sky-500/14 via-sky-400/6"
      : tone === "success"
      ? "from-emerald-500/14 via-emerald-400/6"
      : tone === "warn"
      ? "from-amber-500/16 via-amber-400/7"
      : tone === "danger"
      ? "from-rose-500/14 via-rose-400/6"
      : "from-indigo-500/14 via-sky-400/7";

  const allowGlow = variant === "elevated" || variant === "glass";

  // Interaction (subtle lift)
  const interactiveFx = interactive
    ? cx(
        "cursor-pointer",
        "hover:-translate-y-[1px]",
        "hover:border-slate-300/70 dark:hover:border-slate-700/70",
        "hover:shadow-[0_1px_0_rgba(15,23,42,0.06),0_42px_150px_-96px_rgba(2,6,23,0.60)]",
        "dark:hover:shadow-[0_1px_0_rgba(255,255,255,0.06),0_46px_160px_-100px_rgba(0,0,0,0.98)]",
        "focus-within:ring-indigo-500/18"
      )
    : "focus-within:ring-indigo-500/14";

  return (
    <div className={cx(base, v, interactiveFx, className)}>
      {/* crisp top hairline */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[calc(var(--radius)+6px)]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-[calc(var(--radius)+6px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]" />
      </div>

      {/* optional glow */}
      {allowGlow ? (
        <div
          className={cx(
            "pointer-events-none absolute -inset-px rounded-[calc(var(--radius)+6px)] opacity-55 blur-[16px]",
            "bg-gradient-to-br",
            glow,
            "to-transparent"
          )}
          aria-hidden="true"
        />
      ) : null}

      {/* inner tone ring */}
      <div
        className={cx(
          "pointer-events-none absolute inset-0 rounded-[calc(var(--radius)+6px)] ring-1 ring-inset",
          ring
        )}
        aria-hidden="true"
      />

      <div className="relative z-10 min-w-0">{children}</div>
    </div>
  );
}