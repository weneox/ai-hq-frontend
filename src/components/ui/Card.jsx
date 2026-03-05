// src/components/ui/Card.jsx (ELITE v4.0 — Enterprise Surface System)
// ✅ Hard reset: NO glow spam, NO blur default, NO toy radius
// ✅ Real SaaS surfaces: surface | subtle | elevated | plain
// ✅ Tone ring is optional & minimal (only when tone != neutral)
// ✅ Hover is restrained (professional)
// ✅ Props: variant, padded, clip, interactive, tone

import { cx } from "../../lib/cx.js";

export default function Card({
  className,
  children,
  variant = "surface", // surface | subtle | elevated | plain
  interactive = false,
  padded = "md",
  clip = false,
  tone = "neutral", // neutral | info | success | warn | danger
}) {
  const pad =
    padded === false
      ? "p-0"
      : padded === "sm"
      ? "p-3 md:p-3.5"
      : padded === "lg"
      ? "p-5 md:p-6"
      : "p-4 md:p-5";

  // Enterprise radius (smaller than your old one)
  const base = cx(
    "relative min-w-0 rounded-2xl border",
    clip ? "overflow-hidden" : "overflow-visible",
    "transition-[transform,box-shadow,border-color,background-color] duration-200",
    "focus-within:outline-none",
    pad
  );

  // --- Variants (serious) ---
  // NOTE: no blur / no gradient / no glow
  const surface = cx(
    "bg-white border-slate-200",
    "shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_28px_rgba(15,23,42,0.06)]",
    "dark:bg-slate-950/60 dark:border-slate-800",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.06),0_18px_44px_rgba(0,0,0,0.55)]"
  );

  const subtle = cx(
    "bg-slate-50 border-slate-200",
    "shadow-[0_1px_0_rgba(15,23,42,0.03)]",
    "dark:bg-slate-950/35 dark:border-slate-800/80",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.05)]"
  );

  const elevated = cx(
    "bg-white border-slate-200",
    "shadow-[0_1px_0_rgba(15,23,42,0.06),0_26px_70px_rgba(15,23,42,0.14)]",
    "dark:bg-slate-950/70 dark:border-slate-800",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.07),0_34px_92px_rgba(0,0,0,0.75)]"
  );

  const plain = cx("bg-transparent border-transparent shadow-none");

  const v =
    variant === "plain"
      ? plain
      : variant === "elevated"
      ? elevated
      : variant === "subtle"
      ? subtle
      : surface;

  // --- Tone ring (minimal & only if not neutral) ---
  const toneRing =
    tone === "info"
      ? "ring-1 ring-inset ring-sky-500/22"
      : tone === "success"
      ? "ring-1 ring-inset ring-emerald-500/22"
      : tone === "warn"
      ? "ring-1 ring-inset ring-amber-500/24"
      : tone === "danger"
      ? "ring-1 ring-inset ring-rose-500/22"
      : "";

  // --- Interaction (restrained) ---
  const interactiveFx = interactive
    ? cx(
        "cursor-pointer",
        "hover:-translate-y-[1px]",
        "hover:border-slate-300 dark:hover:border-slate-700",
        "hover:shadow-[0_1px_0_rgba(15,23,42,0.06),0_18px_44px_rgba(15,23,42,0.10)]",
        "dark:hover:shadow-[0_1px_0_rgba(255,255,255,0.07),0_22px_62px_rgba(0,0,0,0.70)]"
      )
    : "";

  // Focus ring (clean, not loud)
  const focusRing = "focus-within:ring-2 focus-within:ring-indigo-500/18";

  return (
    <div className={cx(base, v, toneRing, focusRing, interactiveFx, className)}>
      {/* subtle top hairline only for real surfaces */}
      {variant !== "plain" ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.60)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
          aria-hidden="true"
        />
      ) : null}

      <div className="relative z-10 min-w-0">{children}</div>
    </div>
  );
}