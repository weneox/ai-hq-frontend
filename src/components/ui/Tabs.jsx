import { cx } from "../../lib/cx.js";

export function Tabs({ value, onChange, items, className }) {
  return (
    <div
      className={cx(
        "min-w-0 inline-flex w-full items-center rounded-2xl border p-1",
        "border-slate-200 bg-slate-50",
        "dark:border-slate-800 dark:bg-slate-950/30",
        className
      )}
    >
      <div className="min-w-0 flex w-full gap-1 overflow-x-auto scrollbar-none">
        {items.map((it) => {
          const active = it.value === value;

          return (
            <button
              key={it.value}
              type="button"
              onClick={() => onChange(it.value)}
              className={cx(
                "shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2",
                "ring-offset-white dark:ring-offset-slate-950",
                "active:translate-y-[1px]",
                active
                  ? cx(
                      "text-slate-900 dark:text-slate-50",
                      "bg-white dark:bg-slate-900",
                      "border border-slate-200/70 dark:border-slate-800/80",
                      "shadow-[0_6px_18px_rgba(15,23,42,0.06)]"
                    )
                  : cx(
                      "border border-transparent",
                      "text-slate-600 hover:text-slate-900 hover:bg-white/70",
                      "dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-900/60"
                    )
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