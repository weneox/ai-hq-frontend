import { cx } from "../../lib/cx.js";

/**
 * Card — Premium Enterprise Surface System
 *
 * Variants:
 * - panel: default surface (lists, detail, inbox)
 * - elevated: stronger separation (detail / important)
 * - glass: translucent (topbar/header)
 * - soft: minimal border (secondary blocks)
 *
 * Props:
 * - padded: boolean | "sm" | "md" | "lg"
 * - clip: boolean (overflow hidden)
 * - interactive: boolean (hover / focus treatment)
 * - tone: "neutral" | "info" | "success" | "warn" | "danger" (subtle accent)
 */
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

  const toneRing =
    tone === "info"
      ? "ring-sky-500/10"
      : tone === "success"
      ? "ring-emerald-500/10"
      : tone === "warn"
      ? "ring-amber-500/10"
      : tone === "danger"
      ? "ring-rose-500/10"
      : "ring-indigo-500/8";

  const toneGlow =
    tone === "info"
      ? "from-sky-500/10 via-sky-400/5"
      : tone === "success"
      ? "from-emerald-500/10 via-emerald-400/5"
      : tone === "warn"
      ? "from-amber-500/12 via-amber-400/6"
      : tone === "danger"
      ? "from-rose-500/10 via-rose-400/5"
      : "from-indigo-500/10 via-sky-400/6";

  const base = cx(
    "relative min-w-0 rounded-2xl border",
    clip ? "overflow-hidden" : "overflow-visible",
    "transition-[transform,box-shadow,border-color,background-color] duration-200",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2",
    "focus-within:ring-offset-white dark:focus-within:ring-offset-slate-950",
    pad
  );

  const panel = cx(
    // clean surface
    "bg-white/92 border-slate-200/70",
    // deep but soft shadow (no glow spam)
    "shadow-[0_1px_0_rgba(15,23,42,0.06),0_18px_55px_-44px_rgba(2,6,23,0.35)]",
    // dark
    "dark:bg-slate-950/40 dark:border-slate-800/70",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_22px_70px_-54px_rgba(0,0,0,0.80)]"
  );

  const soft = cx(
    "bg-white/80 border-slate-200/55",
    "shadow-[0_1px_0_rgba(15,23,42,0.04),0_14px_45px_-42px_rgba(2,6,23,0.26)]",
    "dark:bg-slate-950/28 dark:border-slate-800/55",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_18px_60px_-54px_rgba(0,0,0,0.75)]"
  );

  const elevated = cx(
    "bg-white/96 border-slate-200/80",
    "shadow-[0_1px_0_rgba(15,23,42,0.08),0_26px_85px_-58px_rgba(2,6,23,0.48)]",
    "dark:bg-slate-950/52 dark:border-slate-800/80",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.06),0_30px_95px_-62px_rgba(0,0,0,0.92)]"
  );

  const glass = cx(
    "bg-white/70 border-slate-200/65 backdrop-blur-xl",
    "shadow-[0_1px_0_rgba(15,23,42,0.06),0_24px_82px_-60px_rgba(2,6,23,0.55)]",
    "dark:bg-slate-950/50 dark:border-slate-800/70",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_26px_90px_-64px_rgba(0,0,0,0.95)]"
  );

  const interactiveFx = interactive
    ? cx(
        "cursor-pointer",
        "hover:-translate-y-[1px]",
        "hover:border-slate-200/90 dark:hover:border-slate-700/80",
        "hover:shadow-[0_1px_0_rgba(15,23,42,0.06),0_34px_110px_-74px_rgba(2,6,23,0.60)]",
        "dark:hover:shadow-[0_1px_0_rgba(255,255,255,0.06),0_36px_120px_-78px_rgba(0,0,0,0.98)]",
        "focus-within:ring-indigo-500/18"
      )
    : "focus-within:ring-indigo-500/14";

  const v =
    variant === "glass"
      ? glass
      : variant === "elevated"
      ? elevated
      : variant === "soft"
      ? soft
      : panel;

  return (
    <div className={cx(base, v, interactiveFx, className)}>
      {/* Premium subtle top highlight (works in dark too) */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl">
        <div className="absolute inset-0 rounded-2xl [mask-image:radial-gradient(1200px_circle_at_50%_0%,black,transparent_55%)]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent dark:from-white/10" />
        </div>
      </div>

      {/* Tone accent — very subtle, no neon */}
      <div
        className={cx(
          "pointer-events-none absolute -inset-px rounded-2xl opacity-70",
          "bg-gradient-to-br",
          toneGlow,
          "to-transparent",
          "blur-[10px]"
        )}
        aria-hidden="true"
      />

      {/* Border crispness */}
      <div
        className={cx(
          "pointer-events-none absolute inset-0 rounded-2xl ring-1",
          toneRing,
          "ring-inset"
        )}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 min-w-0">{children}</div>
    </div>
  );
}