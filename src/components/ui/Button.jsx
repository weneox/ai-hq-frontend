// src/components/ui/Button.jsx (ULTRA v1 — Enterprise Button System)
// ✅ 0dan yazıldı (old v3 silin)
// ✅ Serious SaaS buttons: no glow spam, no toy sheen
// ✅ Variants: primary | secondary | outline | ghost | destructive
// ✅ Sizes: sm | md | lg | icon
// ✅ Loading: stable width, good UX
// ✅ API: variant, size, isLoading, className

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

const sizes = {
  sm: "h-9 px-3.5 text-[13px] rounded-xl",
  md: "h-10 px-4 text-[13px] rounded-xl",
  lg: "h-11 px-5 text-[14px] rounded-2xl",
  icon: "h-10 w-10 p-0 rounded-xl",
};

const base = cx(
  "relative inline-flex items-center justify-center gap-2",
  "font-semibold whitespace-nowrap select-none",
  "leading-none tracking-[-0.01em]",
  "transition-[transform,background-color,border-color,box-shadow,color] duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/18",
  "focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-slate-950",
  "disabled:opacity-50 disabled:pointer-events-none",
  "active:translate-y-[1px]"
);

/**
 * Design rules:
 * - Primary is dark (serious). In dark mode it flips to light.
 * - Secondary/outline are neutral, no blur.
 * - No sheen overlays. No glow shadows.
 * - Shadows are small and real.
 */
const variants = {
  primary: cx(
    "bg-slate-900 text-white border border-slate-900",
    "hover:bg-slate-800 hover:border-slate-800",
    "shadow-[0_1px_0_rgba(15,23,42,0.10),0_10px_24px_rgba(15,23,42,0.14)]",
    "dark:bg-white dark:text-slate-950 dark:border-white",
    "dark:hover:bg-slate-100 dark:hover:border-slate-100",
    "dark:shadow-[0_1px_0_rgba(255,255,255,0.08),0_16px_44px_rgba(0,0,0,0.60)]"
  ),

  secondary: cx(
    "bg-slate-100 text-slate-900 border border-slate-200",
    "hover:bg-slate-200 hover:border-slate-300",
    "shadow-[0_1px_0_rgba(15,23,42,0.04)]",
    "dark:bg-white/5 dark:text-slate-100 dark:border-white/10",
    "dark:hover:bg-white/7 dark:hover:border-white/15"
  ),

  outline: cx(
    "bg-white text-slate-900 border border-slate-300",
    "hover:bg-slate-50 hover:border-slate-400",
    "shadow-[0_1px_0_rgba(15,23,42,0.04)]",
    "dark:bg-transparent dark:text-slate-100 dark:border-white/18",
    "dark:hover:bg-white/6 dark:hover:border-white/24"
  ),

  ghost: cx(
    "bg-transparent text-slate-700 border border-transparent",
    "hover:bg-slate-100 hover:text-slate-900",
    "dark:text-slate-200 dark:hover:bg-white/6 dark:hover:text-white",
    "shadow-none"
  ),

  destructive: cx(
    "bg-rose-600 text-white border border-rose-600",
    "hover:bg-rose-700 hover:border-rose-700",
    "shadow-[0_1px_0_rgba(15,23,42,0.10),0_10px_24px_rgba(225,29,72,0.18)]",
    "focus-visible:ring-rose-500/22"
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
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;

  return (
    <button
      className={cx(base, s, v, isLoading ? "cursor-wait" : "", className)}
      disabled={isDisabled}
      {...props}
    >
      {/* inner hairline for crispness (subtle) */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/5 dark:ring-white/10"
        aria-hidden="true"
      />

      {/* content */}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {/* keep layout stable: spinner uses same space */}
        {isLoading ? (
          <span className="inline-flex items-center justify-center">
            <Spinner />
          </span>
        ) : null}
        <span className={cx(isLoading ? "opacity-90" : "")}>{children}</span>
      </span>
    </button>
  );
}