function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function TinyLabel({ children, className = "" }) {
  return (
    <div
      className={cx(
        "inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/78 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 backdrop-blur-[10px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TinyChip({
  children,
  tone = "default",
  className = "",
}) {
  const toneClass =
    tone === "warn"
      ? "border-amber-200/80 bg-amber-50/90 text-amber-800"
      : tone === "success"
        ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-700"
        : "border-white/70 bg-white/74 text-slate-600";

  return (
    <div
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-medium backdrop-blur-[10px]",
        toneClass,
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
          ? "bg-slate-950 text-white shadow-[0_16px_34px_-22px_rgba(15,23,42,.65)] hover:bg-slate-800"
          : "border border-white/75 bg-white/78 text-slate-700 backdrop-blur-[10px] hover:border-slate-200 hover:bg-white hover:text-slate-950",
        disabled ? "cursor-not-allowed opacity-50" : "",
        className
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span>{children}</span>
    </button>
  );
}

export function MetricCard({
  label,
  value,
  detail = "",
  className = "",
}) {
  return (
    <div
      className={cx(
        "rounded-[26px] border border-white/72 bg-white/78 px-4 py-5 text-left shadow-[0_18px_40px_-34px_rgba(15,23,42,.42)] backdrop-blur-[12px]",
        className
      )}
    >
      <div className="text-[28px] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[32px]">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      {detail ? (
        <div className="mt-2 text-sm leading-6 text-slate-500">{detail}</div>
      ) : null}
    </div>
  );
}

export function StagePanel({
  children,
  className = "",
  tone = "default",
}) {
  const toneClass =
    tone === "subtle"
      ? "bg-[rgba(255,255,255,0.58)]"
      : "bg-[rgba(255,255,255,0.74)]";

  return (
    <div
      className={cx(
        "rounded-[30px] border border-white/72 px-5 py-5 shadow-[0_20px_44px_-34px_rgba(15,23,42,.34)] backdrop-blur-[14px] sm:px-6 sm:py-6",
        toneClass,
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  label,
  title,
  body = "",
  action = null,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {label ? (
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </div>
        ) : null}
        {title ? (
          <div className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-950">
            {title}
          </div>
        ) : null}
        {body ? (
          <div className="mt-2 max-w-[720px] text-sm leading-6 text-slate-500">
            {body}
          </div>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export default {
  TinyLabel,
  TinyChip,
  GhostButton,
  MetricCard,
  StagePanel,
  SectionHeading,
};
