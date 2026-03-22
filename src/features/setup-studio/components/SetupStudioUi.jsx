function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function TinyLabel({ children, className = "" }) {
  return (
    <div
      className={cx(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/88 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TinyChip({ children, className = "" }) {
  return (
    <div
      className={cx(
        "inline-flex items-center rounded-full border border-slate-200 bg-slate-50/88 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.03)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GhostButton({
  children,
  icon: Icon,
  onClick,
  active = false,
  disabled = false,
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex min-h-[46px] items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition",
        active
          ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] hover:bg-slate-800"
          : "border-slate-200 bg-white/88 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-950",
        disabled
          ? "cursor-not-allowed opacity-50 shadow-none hover:border-inherit hover:bg-inherit hover:text-inherit"
          : "",
        className
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span>{children}</span>
    </button>
  );
}