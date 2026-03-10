// src/components/ui/Button.jsx
// ULTRA v5 — Editorial Premium Button System
// ✅ calmer premium feel
// ✅ better fit for Settings / control surfaces
// ✅ variants: primary | secondary | outline | ghost | destructive
// ✅ sizes: sm | md | lg | icon
// ✅ className, loading, icons fully supported

import * as React from "react";
import { motion } from "framer-motion";
import { cx } from "../../lib/cx.js";

function Spinner({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cx("h-4 w-4 animate-spin", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="opacity-20"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}

const OUTER = {
  sm: "h-9 rounded-[14px]",
  md: "h-10 rounded-[16px]",
  lg: "h-11 rounded-[18px]",
  icon: "h-10 w-10 rounded-[16px]",
};

const INNER = {
  sm: "rounded-[13px]",
  md: "rounded-[15px]",
  lg: "rounded-[17px]",
  icon: "rounded-[15px]",
};

const PAD = {
  sm: "px-3.5",
  md: "px-4.5",
  lg: "px-5",
  icon: "px-0",
};

function frameClass(variant) {
  switch (variant) {
    case "primary":
      return "bg-[linear-gradient(180deg,rgba(125,211,252,0.34),rgba(59,130,246,0.10))]";
    case "destructive":
      return "bg-[linear-gradient(180deg,rgba(251,113,133,0.34),rgba(225,29,72,0.10))]";
    default:
      return "bg-transparent";
  }
}

function surfaceClass(variant) {
  switch (variant) {
    case "primary":
      return cx(
        "text-white border border-white/10",
        "bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.98))]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_16px_36px_rgba(15,23,42,0.22)]",
        "dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.98))]"
      );

    case "destructive":
      return cx(
        "text-white border border-white/10",
        "bg-[linear-gradient(180deg,rgba(127,29,29,0.86),rgba(69,10,10,0.98))]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_34px_rgba(127,29,29,0.22)]"
      );

    case "secondary":
      return cx(
        "text-slate-900 dark:text-white",
        "border border-slate-200/80 dark:border-white/10",
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_24px_rgba(15,23,42,0.07)]",
        "dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(2,6,23,0.80))]",
        "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_40px_rgba(0,0,0,0.42)]"
      );

    case "outline":
      return cx(
        "text-slate-800 dark:text-slate-100",
        "border border-slate-300/85 dark:border-white/12",
        "bg-white/70 backdrop-blur-md dark:bg-white/[0.03]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_8px_20px_rgba(15,23,42,0.05)]",
        "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_16px_34px_rgba(0,0,0,0.34)]"
      );

    case "ghost":
      return cx(
        "text-slate-700 dark:text-slate-200",
        "border border-transparent bg-transparent",
        "hover:bg-slate-900/[0.045] dark:hover:bg-white/[0.06]"
      );

    default:
      return "text-slate-900 bg-white border border-slate-200";
  }
}

const Button = React.forwardRef(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref
) {
  const isDisabled = Boolean(disabled || isLoading);
  const showFrame = variant === "primary" || variant === "destructive";

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      whileHover={isDisabled ? undefined : { y: -1.5 }}
      whileTap={isDisabled ? undefined : { scale: 0.985, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.9 }}
      className={cx(
        "group relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        "select-none whitespace-nowrap font-semibold tracking-[-0.01em]",
        "outline-none disabled:cursor-not-allowed disabled:opacity-60",
        "transition-[filter,box-shadow] duration-200",
        OUTER[size] || OUTER.md,
        className
      )}
      {...props}
    >
      {showFrame ? (
        <span
          aria-hidden="true"
          className={cx("absolute inset-0 p-px", OUTER[size] || OUTER.md)}
        >
          <span
            className={cx(
              "absolute inset-0",
              OUTER[size] || OUTER.md,
              frameClass(variant)
            )}
          />
        </span>
      ) : null}

      <span
        className={cx(
          "relative z-[1] inline-flex h-full w-full items-center justify-center",
          PAD[size] || PAD.md,
          INNER[size] || INNER.md,
          surfaceClass(variant)
        )}
      >
        {showFrame ? (
          <>
            <span
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-0 opacity-100",
                INNER[size] || INNER.md,
                "bg-[linear-gradient(180deg,rgba(255,255,255,0.07),transparent_42%)]"
              )}
            />
            <span
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                INNER[size] || INNER.md
              )}
            >
              <span className="absolute inset-0 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(255,255,255,0.12),transparent_58%)]" />
            </span>
          </>
        ) : null}

        <span
          className={cx(
            "relative z-[2] inline-flex items-center justify-center",
            size === "icon" ? "gap-0" : "gap-2"
          )}
        >
          {isLoading ? <Spinner className="opacity-90" /> : leftIcon ? leftIcon : null}
          {children ? <span>{children}</span> : null}
          {!isLoading && rightIcon ? rightIcon : null}
        </span>
      </span>
    </motion.button>
  );
});

export default Button;