// src/components/ui/Tabs.jsx (ULTRA v3 — Premium Segmented Tabs)
// ✅ Clean segmented control, consistent with Card/Input
// ✅ Optional counts
import { cx } from "../../lib/cx.js";

function Count({ n, active }) {
  if (n == null) return null;
  return (
    <span
      className={cx(
        "ml-2 inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[11px] font-semibold",
        active
          ? "bg-slate-900/10 text-slate-800 dark:bg-white/12 dark:text-slate-100"
          : "bg-slate-200/60 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
      )}
    >
      {Number(n) || 0}
    </span>
  );
}

export function Tabs({ value, onChange, items = [], className }) {
  return (
    <div
      className={cx(
        "min-w-0 w-full rounded-2xl border border-slate-200 bg-white p-1.5",
        "shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_26px_rgba(15,23,42,0.06)]",
        "dark:border-slate-800 dark:bg-slate-950/55",
        "dark:shadow-[0_1px_0_rgba(255,255,255,0.06),0_18px_44px_rgba(0,0,0,0.60)]",
        className
      )}
      role="tablist"
      aria-label="Tabs"
    >
      <div className="min-w-0 flex w-full flex-wrap gap-1">
        {items.map((it) => {
          const active = String(it.value) === String(value);

          return (
            <button
              key={it.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => (onChange ? onChange(it.value) : null)}
              className={cx(
                "relative inline-flex items-center rounded-xl px-3 py-2 text-xs font-semibold",
                "transition-[box-shadow,background-color,border-color,color] duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/18",
                active
                  ? cx(
                      "text-slate-900 dark:text-white",
                      "border border-slate-200 dark:border-slate-700/70",
                      "bg-white dark:bg-slate-900/70",
                      "shadow-[0_1px_0_rgba(15,23,42,0.06),0_14px_34px_rgba(15,23,42,0.10)]"
                    )
                  : cx(
                      "border border-transparent",
                      "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                      "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/60"
                    )
              )}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-xl [mask-image:radial-gradient(420px_circle_at_50%_0%,black,transparent_60%)]"
                >
                  <span className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent dark:from-white/10" />
                </span>
              ) : null}

              <span className="relative z-10">{it.label}</span>
              <Count n={it.count} active={active} />
            </button>
          );
        })}
      </div>
    </div>
  );
}