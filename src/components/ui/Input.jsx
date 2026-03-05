// src/components/ui/Input.jsx (FINAL v2.0 — Premium Input + Group)
// ✅ Glass/enterprise look
// ✅ Optional leftIcon / right / onClear
// ✅ Works as plain <Input /> too

import { cx } from "../../lib/cx.js";

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={cx("h-4 w-4", className)} aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InputGroup({
  className,
  inputClassName,
  leftIcon,
  right,
  onClear,
  value,
  placeholder,
  disabled,
  readOnly,
  ...props
}) {
  const showClear = typeof onClear === "function" && !disabled && !readOnly && String(value || "").length > 0;

  return (
    <div
      className={cx(
        "w-full min-w-0",
        "rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur",
        "shadow-[0_1px_0_rgba(15,23,42,0.04)]",
        "transition-[border-color,box-shadow,background-color] duration-200",
        "focus-within:border-indigo-300/80 focus-within:ring-2 focus-within:ring-indigo-500/15",
        "dark:border-slate-800/80 dark:bg-slate-950/25",
        "dark:focus-within:border-indigo-500/40 dark:focus-within:ring-indigo-500/20",
        disabled ? "opacity-60" : "",
        className
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        {leftIcon ? (
          <span className="shrink-0 text-slate-400 dark:text-slate-500">{leftIcon}</span>
        ) : null}

        <input
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className={cx(
            "min-w-0 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400",
            "outline-none",
            "dark:text-slate-100 dark:placeholder:text-slate-500",
            inputClassName
          )}
          {...props}
        />

        {showClear ? (
          <button
            type="button"
            onClick={onClear}
            className={cx(
              "shrink-0 inline-flex items-center justify-center rounded-xl p-2",
              "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
              "dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/25"
            )}
            aria-label="Clear"
            title="Clear"
          >
            <XIcon />
          </button>
        ) : null}

        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}

export default function Input({ className, ...props }) {
  // Drop-in simple input (no icon). Looks premium by default.
  return (
    <input
      className={cx(
        "w-full h-11 rounded-2xl px-4 text-sm",
        "border border-slate-200/80 bg-white/70 backdrop-blur",
        "shadow-[0_1px_0_rgba(15,23,42,0.04)]",
        "transition-[border-color,box-shadow,background-color] duration-200",
        "outline-none",
        "focus:border-indigo-300/80 focus:ring-2 focus:ring-indigo-500/15",
        "placeholder:text-slate-400",
        "dark:border-slate-800/80 dark:bg-slate-950/25 dark:text-slate-100 dark:placeholder:text-slate-500",
        "dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/20",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}