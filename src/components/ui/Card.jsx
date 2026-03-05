// src/components/ui/Card.jsx (ULTRA v5 — Enterprise Surface System)
// ✅ Consistent radius + hairline + shadows
// ✅ Variants: surface | subtle | elevated | plain
// ✅ interactive: true => restrained lift
// ✅ tone ring minimal
import { cx } from "../../lib/cx.js";

export default function Card({
  className,
  children,
  variant = "surface",
  interactive = false,
  padded = "md",
  clip = false,
  tone = "neutral",
}) {
  const pad =
    padded === false
      ? "p-0"
      : padded === "sm"
      ? "p-3 md:p-3.5"
      : padded === "lg"
      ? "p-5 md:p-6"
      : "p-4 md:p-5";

  const base = cx(
    "relative min-w-0 rounded-2xl border",
    clip ? "overflow-hidden" : "overflow-visible",
    "transition-[transform,box-shadow,border-color,background-color] duration-200",
    "focus-within:outline-none",
    pad
  );

  const surface = cx(
    "bg-white border-slate-200",
    "shadow-[0_1px_0_rgba(15,23,42,0.04),0_14px_34px_rgba(15,23,42,0.08)]",
    "dark:bg-slate-950/60 dark:border-slate-800",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.06),0_22px_62px_rgba(0,0,0,0.62)]"
  );

  const subtle = cx(
    "bg-slate-50 border-slate-200",
    "shadow-[0_1px_0_rgba(15,23,42,0.03)]",
    "dark:bg-slate-950/35 dark:border-slate-800/80",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.05)]"
  );

  const elevated = cx(
    "bg-white border-slate-200",
    "shadow-[0_1px_0_rgba(15,23,42,0.06),0_30px_90px_rgba(15,23,42,0.16)]",
    "dark:bg-slate-950/70 dark:border-slate-800",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.07),0_40px_110px_rgba(0,0,0,0.78)]"
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

  const toneRing =
    tone === "info"
      ? "ring-1 ring-inset ring-indigo-500/18"
      : tone === "success"
      ? "ring-1 ring-inset ring-emerald-500/18"
      : tone === "warn"
      ? "ring-1 ring-inset ring-amber-500/20"
      : tone === "danger"
      ? "ring-1 ring-inset ring-rose-500/18"
      : "";

  const interactiveFx = interactive
    ? cx(
        "cursor-pointer",
        "hover:-translate-y-[1px]",
        "hover:border-slate-300 dark:hover:border-slate-700",
        "hover:shadow-[0_1px_0_rgba(15,23,42,0.06),0_20px_56px_rgba(15,23,42,0.12)]",
        "dark:hover:shadow-[0_1px_0_rgba(255,255,255,0.07),0_28px_78px_rgba(0,0,0,0.72)]"
      )
    : "";

  return (
    <div className={cx(base, v, toneRing, interactiveFx, className)}>
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