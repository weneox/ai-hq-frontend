import * as React from "react";
import { motion } from "framer-motion";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...i) {
  return twMerge(clsx(i));
}

function Spinner({ className }) {
  return (
    <svg className={cn("h-4 w-4 animate-spin", className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2.2A5.8 5.8 0 006.2 12H4z" />
    </svg>
  );
}

const padMap = { sm: "px-3", md: "px-4", lg: "px-5", icon: "p-0" };

// NOTE: remove transition-[transform] to avoid “double transform” with framer-motion
const base = [
  "group relative inline-flex items-center justify-center",
  "select-none whitespace-nowrap",
  "font-semibold tracking-[-0.01em]",
  "outline-none",
  "disabled:opacity-55 disabled:cursor-not-allowed",
  "transition-[filter,box-shadow,border-color,background-color,color] duration-200",
  // use your global focus system (index.css) — so don’t add extra rings here
].join(" ");

const buttonCva = cva(base, {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-slate-900 dark:text-slate-100",
      outline: "text-slate-900 dark:text-slate-100",
      ghost: "text-slate-900 dark:text-slate-100",
      destructive: "text-white",
    },
    size: {
      sm: "h-9 text-sm rounded-[12px]",
      md: "h-10 text-sm rounded-[14px]",
      lg: "h-11 text-[15px] rounded-[16px]",
      icon: "h-10 w-10 rounded-[14px]",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

function frameClass(variant) {
  if (variant === "primary") {
    return "bg-[linear-gradient(135deg,rgba(99,102,241,.85),rgba(56,189,248,.55),rgba(167,139,250,.70))]";
  }
  if (variant === "destructive") {
    return "bg-[linear-gradient(135deg,rgba(244,63,94,.85),rgba(251,113,133,.55),rgba(251,146,60,.55))]";
  }
  return "bg-transparent";
}

function surfaceClass(variant) {
  switch (variant) {
    case "primary":
      return "bg-[linear-gradient(180deg,rgba(30,41,59,.78),rgba(2,6,23,.94))] border border-white/10";
    case "destructive":
      return "bg-[linear-gradient(180deg,rgba(127,29,29,.74),rgba(69,10,10,.94))] border border-white/10";
    case "secondary":
      return [
        "bg-white border border-slate-200",
        "shadow-[0_10px_26px_rgba(2,6,23,.10)]",
        "hover:shadow-[0_16px_40px_rgba(2,6,23,.14)]",
        "dark:bg-slate-900 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(0,0,0,.45)]",
      ].join(" ");
    case "outline":
      return [
        "bg-white/70 border border-slate-300 backdrop-blur-md",
        "shadow-[0_10px_22px_rgba(2,6,23,.08)]",
        "hover:border-slate-400 hover:bg-white/85",
        "dark:bg-slate-950/35 dark:border-white/12 dark:hover:border-white/18 dark:hover:bg-slate-950/45",
      ].join(" ");
    case "ghost":
      return "bg-transparent border border-transparent hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.06]";
    default:
      return "bg-white border border-slate-200";
  }
}

export default React.forwardRef(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...props
  },
  ref
) {
  const isDisabled = Boolean(disabled || isLoading);
  const showFrame = variant === "primary" || variant === "destructive";

  // smooth, not “donan”: lighter spring
  const hover = isDisabled ? undefined : { y: -1 };
  const tap = isDisabled ? undefined : { y: 0, scale: 0.985 };

  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={isDisabled}
      whileHover={hover}
      whileTap={tap}
      transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.9 }}
      className={cn(buttonCva({ variant, size }), className)}
      {...props}
    >
      {/* frame (only primary/destructive) */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 p-[1px] pointer-events-none",
          // match rounding with button size (so corners are never square)
          size === "sm" ? "rounded-[12px]" : size === "md" ? "rounded-[14px]" : size === "lg" ? "rounded-[16px]" : "rounded-[14px]",
          frameClass(variant),
          showFrame ? "opacity-100" : "opacity-0"
        )}
      />

      {/* surface */}
      <span
        className={cn(
          "relative z-[1] inline-flex h-full w-full items-center justify-center",
          size === "sm" ? "rounded-[11px]" : size === "md" ? "rounded-[13px]" : size === "lg" ? "rounded-[15px]" : "rounded-[13px]",
          padMap[size],
          surfaceClass(variant)
        )}
      >
        {/* subtle highlight sweep (primary/destructive only) */}
        {showFrame && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 overflow-hidden",
              size === "sm" ? "rounded-[11px]" : size === "md" ? "rounded-[13px]" : size === "lg" ? "rounded-[15px]" : "rounded-[13px]",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            )}
          >
            <span
              className={cn(
                "absolute -left-1/2 top-0 h-full w-[140%]",
                "bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.18),transparent)]",
                "translate-x-[-35%] group-hover:translate-x-[35%]",
                "transition-transform duration-700 ease-out"
              )}
            />
          </span>
        )}

        <span className="relative z-[2] inline-flex items-center gap-2">
          {isLoading ? <Spinner className="opacity-90" /> : leftIcon ? leftIcon : null}
          <span className={cn(isLoading ? "opacity-95" : "")}>{children}</span>
          {!isLoading && rightIcon ? rightIcon : null}
        </span>
      </span>
    </motion.button>
  );
});