export default function SetupStudioProgressDots({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                item.done ? "bg-emerald-500" : item.active ? "bg-slate-950" : "bg-slate-300"
              }`}
            />
            <span
              className={`text-[11px] font-medium uppercase tracking-[0.24em] ${
                item.active ? "text-slate-700" : item.done ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {item.label}
            </span>
          </div>

          {item.key !== "ready" ? <div className="h-px w-6 bg-slate-300/80" /> : null}
        </div>
      ))}
    </div>
  );
}