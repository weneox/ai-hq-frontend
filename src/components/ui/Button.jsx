import { cx } from "../../lib/cx.js";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold " +
  "transition-all duration-200 select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 " +
  "focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-slate-950 " +
  "disabled:opacity-50 disabled:pointer-events-none " +
  "active:translate-y-[1px]";

const variants = {
  primary:
    "bg-slate-900 text-white " +
    "hover:bg-slate-800 hover:shadow-sm " +
    "dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",

  secondary:
    "border border-slate-200 bg-white text-slate-900 " +
    "hover:bg-slate-50 hover:shadow-sm " +
    "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",

  outline:
    "border border-slate-200 bg-transparent text-slate-900 " +
    "hover:bg-slate-50 hover:shadow-sm " +
    "dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900/60",

  ghost:
    "bg-transparent text-slate-700 " +
    "hover:bg-slate-100 " +
    "dark:text-slate-200 dark:hover:bg-slate-800",

  destructive:
    "bg-rose-600 text-white " +
    "hover:bg-rose-700 hover:shadow-sm " +
    "focus-visible:ring-rose-500/30",
};

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

export default function Button({
  variant = "primary",
  size = "md",
  className,
  isLoading = false,
  disabled,
  children,
  ...props
}) {
  const sizeClass =
    size === "sm"
      ? "h-8 px-3 text-sm"
      : size === "lg"
      ? "h-11 px-5 text-base"
      : "h-10 px-4 text-sm";

  const isDisabled = Boolean(disabled || isLoading);

  return (
    <button
      className={cx(base, variants[variant] || variants.primary, sizeClass, className)}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? <Spinner /> : null}
      <span className={cx(isLoading ? "opacity-90" : "")}>{children}</span>
    </button>
  );
}