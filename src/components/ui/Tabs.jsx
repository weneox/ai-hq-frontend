// src/components/ui/Tabs.jsx (FINAL v2.0 — Premium Segmented Tabs)
// ✅ Premium active style (subtle glow, crisp border, micro highlight)
// ✅ Optional counts: items: [{value,label,count?}]
// ✅ Defensive: onChange optional
// ✅ Accessible roles + aria-selected

import { cx } from "../../lib/cx.js";

function CountPill({ n, active }) {
  if (n == null) return null;
  return (
    <span
      className={cx(
        "ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
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
        "min-w-0 w-full",
        "rounded-2xl border border-slate-200/80 bg-white/70 p-1.5 backdrop-blur",
        "shadow-[0_1px_0_rgba(15,23,42,0.04)]",
        "dark:border-slate-800/80 dark:bg-slate-950/25",
        className
      )}
      role="tablist"
      aria-label="Tabs"
    >
      {/* wrap so no hidden tabs */}
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
                "relative inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-semibold",
                "transition-[transform,box-shadow,background-color,border-color,color] duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/25 focus-visible:ring-offset-2",
                "ring-offset-white dark:ring-offset-slate-950",
                active
                  ? [
                      "text-slate-900 dark:text-white",
                      "border border-slate-200/80 dark:border-slate-700/70",
                      "bg-white dark:bg-slate-900/70",
                      "shadow-[0_1px_0_rgba(15,23,42,0.06),0_10px_30px_-22px_rgba(2,6,23,0.35)]",
                    ].join(" ")
                  : [
                      "border border-transparent",
                      "text-slate-600 hover:text-slate-900 hover:bg-white/70",
                      "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/50",
                    ].join(" ")
              )}
            >
              {/* micro highlight for active */}
              {active ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-xl [mask-image:radial-gradient(420px_circle_at_50%_0%,black,transparent_60%)]"
                >
                  <span className="absolute inset-0 bg-gradient-to-b from-white/70 to-transparent dark:from-white/10" />
                </span>
              ) : null}

              <span className="relative z-10">{it.label}</span>
              <CountPill n={it.count} active={active} />
            </button>
          );
        })}
      </div>
    </div>
  );
}