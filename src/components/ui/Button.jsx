// src/components/ui/Button.jsx (FINAL v3.0 — ELITE)
// ✅ Cleaner depth, premium highlight, better outline/ghost, safer disabled
// ✅ Press physics + subtle sheen (not glow spam)
// ✅ Keeps API: variant, size(sm/md/lg), isLoading

import { cx } from "../../lib/cx.js";

function Spinner({ className }) {
  return (
    <svg
      className={cx("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v2.2A5.8 5.8 0 006.2 12H4z"
      />
    </svg>
  );
}

const sizeMap = {
  sm: "h-9 px-3.5 text-[13px] rounded-xl",
  md: "h-10 px-4 text-[13px] rounded-2xl",
  lg: "h-11 px-5 text-[15px] rounded-2xl",
};

const base = cx(
  "relative inline-flex items-center justify-center gap-2",
  "font-semibold select-none whitespace-nowrap",
  "transition-[transform,box-shadow,background-color,border-color,color,filter] duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/25",
  "focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-slate-950",
  "disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none",
  "active:translate-y-[1px] active:scale-[0.99]"
);

// sheen overlay (premium)
const sheen =
  "before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] " +
  "before:bg-gradient-to-b before:from-white/50 before:to-transparent " +
  "before:[mask-image:radial-gradient(900px_circle_at_50%_0%,black,transparent_55%)] " +
  "before:pointer-events-none dark:before:from-white/12";

const variants = {
  primary: cx(
    "text-white",
    "bg-slate-900 hover:bg-slate-800",
    "shadow-[0_1px_0_rgba(15,23,42,0.10),0_22px_70px_-54px_rgba(2,6,23,0.55)]",
    "dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.07),0_26px_86px_-62px_rgba(0,0,0,0.95)]",
    sheen
  ),

  secondary: cx(
    "border border-slate-200/80 bg-white text-slate-900",
    "hover:bg-slate-50 hover:border-slate-300/80",
    "shadow-[0_1px_0_rgba(15,23,42,0.06),0_16px_44px_-48px_rgba(2,6,23,0.20)]",
    "dark:border-slate-800/80 dark:bg-slate-950/35 dark:text-slate-100",
    "dark:hover:bg-slate-950/55 dark:hover:border-slate-700/80",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_20px_62px_-54px_rgba(0,0,0,0.85)]",
    sheen
  ),

  outline: cx(
    "border border-slate-200/80 bg-white/60 text-slate-900 backdrop-blur",
    "hover:bg-white hover:border-slate-300/90",
    "shadow-[0_1px_0_rgba(15,23,42,0.05)]",
    "dark:border-slate-800/80 dark:bg-slate-950/25 dark:text-slate-100",
    "dark:hover:bg-slate-950/50 dark:hover:border-slate-700/90",
    sheen
  ),

  ghost: cx(
    "bg-transparent text-slate-700",
    "hover:bg-slate-100/85",
    "dark:text-slate-200 dark:hover:bg-slate-800/55",
    "shadow-none"
  ),

  destructive: cx(
    "text-white",
    "bg-rose-600 hover:bg-rose-700",
    "shadow-[0_1px_0_rgba(15,23,42,0.10),0_22px_70px_-54px_rgba(225,29,72,0.30)]",
    "focus-visible:ring-rose-500/25",
    sheen
  ),
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  isLoading = false,
  disabled,
  children,
  ...props
}) {
  const isDisabled = Boolean(disabled || isLoading);
  const s = sizeMap[size] || sizeMap.md;

  return (
    <button
      className={cx(
        base,
        s,
        variants[variant] || variants.primary,
        isLoading ? "cursor-wait" : "",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* loading dim */}
      <span className={cx("relative z-10 inline-flex items-center gap-2", isLoading ? "opacity-90" : "")}>
        {isLoading ? <Spinner /> : null}
        {children}
      </span>

      {/* subtle inner border for crispness */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/5 dark:ring-white/10"
        aria-hidden="true"
      />
    </button>
  );
}