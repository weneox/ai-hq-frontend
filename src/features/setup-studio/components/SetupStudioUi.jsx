export function TinyLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/82 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
      {children}
    </div>
  );
}

export function TinyChip({ children }) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-900/8 bg-white/80 px-3 py-1.5 text-xs text-slate-600">
      {children}
    </div>
  );
}

export function GhostButton({ children, icon: Icon, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-slate-950/10 bg-slate-950 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
          : "border-slate-900/10 bg-white/80 text-slate-700 hover:bg-white"
      }`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}