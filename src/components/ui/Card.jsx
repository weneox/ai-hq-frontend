// src/components/ui/Card.jsx (FINAL v2.1 — Premium Clean Surface System)
// ✅ Panels stay CLEAN (no glow spam) — fixes "messy" look
// ✅ Glow only on elevated/glass (subtle)
// ✅ Better borders in dark mode
// ✅ Same API: variant, padded, clip, interactive, tone

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
    "relative min-w-0 rounded-2xl border",
    clip ? "overflow-hidden" : "overflow-visible",
    "transition-[transform,box-shadow,border-color,background-color] duration-200",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2",
    "focus-within:ring-offset-white dark:focus-within:ring-offset-slate-950",
    pad
  );

  // --- Variants (CLEAN) ---
  const panel = cx(
    "bg-white border-slate-200/70",
    "shadow-[0_1px_0_rgba(15,23,42,0.05),0_16px_44px_-46px_rgba(2,6,23,0.28)]",
    "dark:bg-slate-950/35 dark:border-slate-800/70",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_18px_54px_-52px_rgba(0,0,0,0.78)]"
  );

  const soft = cx(
    "bg-white/70 border-slate-200/55",
    "shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_36px_-44px_rgba(2,6,23,0.22)]",
    "dark:bg-slate-950/22 dark:border-slate-800/55",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_14px_44px_-50px_rgba(0,0,0,0.72)]"
  );

  const elevated = cx(
    "bg-white border-slate-200/80",
    "shadow-[0_1px_0_rgba(15,23,42,0.08),0_28px_86px_-62px_rgba(2,6,23,0.52)]",
    "dark:bg-slate-950/55 dark:border-slate-800/80",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.06),0_30px_96px_-66px_rgba(0,0,0,0.92)]"
  );

  const glass = cx(
    "bg-white/65 border-slate-200/65 backdrop-blur-xl",
    "shadow-[0_1px_0_rgba(15,23,42,0.06),0_26px_84px_-62px_rgba(2,6,23,0.56)]",
    "dark:bg-slate-950/48 dark:border-slate-800/70",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_28px_92px_-66px_rgba(0,0,0,0.95)]"
  );

  const v =
    variant === "glass" ? glass : variant === "elevated" ? elevated : variant === "soft" ? soft : panel;

  // --- Tone (ONLY subtle ring; glow only on elevated/glass) ---
  const ring =
    tone === "info"
      ? "ring-sky-500/12"
      : tone === "success"
      ? "ring-emerald-500/12"
      : tone === "warn"
      ? "ring-amber-500/14"
      : tone === "danger"
      ? "ring-rose-500/12"
      : "ring-indigo-500/10";

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

  const interactiveFx = interactive
    ? cx(
        "cursor-pointer",
        "hover:-translate-y-[1px]",
        "hover:border-slate-300/70 dark:hover:border-slate-700/70",
        "hover:shadow-[0_1px_0_rgba(15,23,42,0.06),0_36px_120px_-78px_rgba(2,6,23,0.58)]",
        "dark:hover:shadow-[0_1px_0_rgba(255,255,255,0.06),0_38px_126px_-82px_rgba(0,0,0,0.98)]",
        "focus-within:ring-indigo-500/18"
      )
    : "focus-within:ring-indigo-500/14";

  return (
    <div className={cx(base, v, interactiveFx, className)}>
      {/* subtle top highlight ONLY for elevated/glass (prevents clutter) */}
      {allowGlow ? (
        <div className="pointer-events-none absolute inset-0 rounded-2xl">
          <div className="absolute inset-0 rounded-2xl [mask-image:radial-gradient(1100px_circle_at_50%_0%,black,transparent_58%)]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/55 to-transparent dark:from-white/10" />
          </div>
        </div>
      ) : null}

      {/* very subtle tone glow ONLY on elevated/glass */}
      {allowGlow ? (
        <div
          className={cx(
            "pointer-events-none absolute -inset-px rounded-2xl opacity-60",
            "bg-gradient-to-br",
            glow,
            "to-transparent",
            "blur-[14px]"
          )}
          aria-hidden="true"
        />
      ) : null}

      {/* crisp inner ring (safe for all variants) */}
      <div className={cx("pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset", ring)} aria-hidden="true" />

      <div className="relative z-10 min-w-0">{children}</div>
    </div>
  );
}