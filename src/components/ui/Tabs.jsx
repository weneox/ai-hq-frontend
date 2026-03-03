import { cx } from "../../lib/cx.js";

export function Tabs({ value, onChange, items, className }) {
  return (
    <div
      className={cx(
        "min-w-0 w-full",
        "rounded-xl border border-slate-200 bg-slate-50 p-1",
        "dark:border-slate-800 dark:bg-slate-950/30",
        className
      )}
    >
      {/* ✅ WRAP row (no hidden tabs) */}
      <div className="min-w-0 flex w-full flex-wrap gap-1">
        {items.map((it) => {
          const active = it.value === value;
          return (
            <button
              key={it.value}
              type="button"
              onClick={() => onChange(it.value)}
              className={cx(
                "rounded-lg px-3 py-1.5 text-xs font-semibold",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2",
                "ring-offset-white dark:ring-offset-slate-950",
                active
                  ? [
                      "bg-white text-slate-900",
                      "shadow-[0_1px_0_rgba(15,23,42,0.06)]",
                      "dark:bg-slate-900 dark:text-slate-50",
                      "border border-slate-200/70 dark:border-slate-800/80",
                    ].join(" ")
                  : [
                      "border border-transparent",
                      "text-slate-600 hover:text-slate-900 hover:bg-white/70",
                      "dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-900/60",
                    ].join(" ")
              )}
            >
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}