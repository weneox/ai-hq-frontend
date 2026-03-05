// src/components/ui/Input.jsx (ULTRA v4 — Enterprise Input)
// ✅ Crisp surface, consistent radius, premium focus, better dark mode
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

function Surface({ children, className, disabled }) {
  return (
    <div
      className={cx(
        "relative w-full min-w-0 rounded-2xl border",
        "border-slate-200 bg-white",
        "shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_26px_rgba(15,23,42,0.06)]",
        "transition-[border-color,box-shadow] duration-200",
        "focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/12",
        "dark:border-slate-800 dark:bg-slate-950/55",
        "dark:shadow-[0_1px_0_rgba(255,255,255,0.06),0_18px_44px_rgba(0,0,0,0.60)]",
        "dark:focus-within:border-indigo-500/55 dark:focus-within:ring-indigo-500/18",
        disabled ? "opacity-60" : "",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]" />
      <div className="relative">{children}</div>
    </div>
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
  const showClear =
    typeof onClear === "function" &&
    !disabled &&
    !readOnly &&
    String(value || "").length > 0;

  return (
    <div className="relative w-full min-w-0">
      <Surface className={className} disabled={disabled}>
        <div className="flex items-center gap-2 px-3 py-2">
          {leftIcon ? (
            <span className="shrink-0 text-slate-400 dark:text-slate-500">
              {leftIcon}
            </span>
          ) : null}

          <input
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            className={cx(
              "min-w-0 w-full bg-transparent text-sm text-slate-900 outline-none",
              "placeholder:text-slate-400",
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
                "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
                "dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/70",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
              )}
              aria-label="Clear"
              title="Clear"
            >
              <XIcon />
            </button>
          ) : null}

          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </Surface>
    </div>
  );
}

export default function Input({ className, ...props }) {
  return (
    <div className="relative w-full min-w-0">
      <Surface className={cx("px-0 py-0", className)} disabled={props.disabled}>
        <input
          className={cx(
            "w-full h-11 rounded-2xl px-4 text-sm",
            "bg-transparent text-slate-900 outline-none",
            "placeholder:text-slate-400",
            "dark:text-slate-100 dark:placeholder:text-slate-500",
            "disabled:cursor-not-allowed"
          )}
          {...props}
        />
      </Surface>
    </div>
  );
}