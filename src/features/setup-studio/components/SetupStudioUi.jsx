function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function TinyLabel({ children, className = "" }) {
  return (
    <div
      className={cx(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500",
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
        "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600",
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
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition",
        active
          ? "bg-slate-950 text-white hover:bg-slate-800"
          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950",
        disabled ? "cursor-not-allowed opacity-50" : "",
        className
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span>{children}</span>
    </button>
  );
}