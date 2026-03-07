import { cn } from "./proposal-utils.js";

function ToneBadge({ tone = "neutral", children, className = "" }) {
  const map = {
    neutral: "border-white/[0.07] bg-white/[0.035] text-white/68",
    success: "border-emerald-400/18 bg-emerald-400/08 text-emerald-200/88",
    warn: "border-amber-400/18 bg-amber-400/08 text-amber-200/88",
    danger: "border-rose-400/18 bg-rose-400/08 text-rose-200/88",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        "transition-colors duration-200",
        map[tone] || map.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}

function GlassButton({
  children,
  className = "",
  variant = "default",
  disabled,
  ...props
}) {
  const variants = {
    default:
      "border-white/[0.08] bg-white/[0.04] text-white/80 hover:bg-white/[0.06]",
    primary:
      "border-cyan-300/18 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/14",
    danger:
      "border-rose-300/18 bg-rose-300/09 text-rose-100 hover:bg-rose-300/14",
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[16px] border px-3.5 py-2 text-[12px] font-medium",
        "transition-[background,border-color,color,transform] duration-200 ease-out",
        "shadow-[0_8px_22px_rgba(0,0,0,0.14)]",
        variants[variant] || variants.default,
        disabled && "cursor-not-allowed opacity-45 hover:bg-inherit",
        className
      )}
    >
      {children}
    </button>
  );
}

function SurfacePill({ children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/[0.055] bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/54",
        "transition-colors duration-200",
        className
      )}
    >
      {children}
    </span>
  );
}

export { ToneBadge, GlassButton, SurfacePill };