function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ToneBadge({ tone = "neutral", children }) {
  const map = {
    neutral: "border-white/[0.08] bg-white/[0.05] text-white/72",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200/90",
    warn: "border-amber-400/20 bg-amber-400/10 text-amber-200/90",
    danger: "border-rose-400/20 bg-rose-400/10 text-rose-200/90",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        map[tone] || map.neutral
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
      "border-white/[0.08] bg-white/[0.045] text-white/80 hover:bg-white/[0.07]",
    primary:
      "border-cyan-300/20 bg-cyan-300/12 text-cyan-100 hover:bg-cyan-300/18",
    danger:
      "border-rose-300/20 bg-rose-300/10 text-rose-100 hover:bg-rose-300/16",
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[16px] border px-3.5 py-2 text-[12px] font-medium transition duration-200",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
        variants[variant] || variants.default,
        disabled && "cursor-not-allowed opacity-45 hover:bg-inherit",
        className
      )}
    >
      {children}
    </button>
  );
}

export { cn, ToneBadge, GlassButton };