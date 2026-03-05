import { useEffect, useMemo, useRef } from "react";
import ThreePageCard from "./ThreePageCard.jsx";

function cx(...a) {
  return a.filter(Boolean).join(" ");
}

export default function PagesSheet({ open, onClose, pages = [] }) {
  const backRef = useRef(null);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const tabItems = useMemo(() => pages.map((p) => p.label), [pages]);

  return (
    <div
      className={cx(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <div
        ref={backRef}
        onClick={onClose}
        className={cx(
          "absolute inset-0 bg-slate-950/35 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* top sheet */}
      <div
        className={cx(
          "absolute left-0 right-0 top-0",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "-translate-y-[110%]"
        )}
      >
        <div className="mx-auto max-w-[1200px] px-5 pt-5">
          <div className="rounded-[28px] border border-white/25 bg-white/80 shadow-[0_30px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            {/* header row inside sheet */}
            <div className="flex items-center justify-between gap-3 px-6 pt-6">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  Pages
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Drag to browse. Click a 3D card to open.
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {/* small tabs row (scrollable) */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto px-6 pb-2">
              {tabItems.map((t, i) => (
                <div
                  key={t + i}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {t}
                </div>
              ))}
            </div>

            {/* cards row */}
            <div className="px-6 pb-6">
              <div className="overflow-x-auto">
                <div className="flex gap-5 py-4">
                  {pages.map((p) => (
                    <ThreePageCard
                      key={p.key}
                      title={p.label}
                      subtitle={p.subtitle}
                      badge={p.badge}
                      theme={p.theme}
                      onClick={() => {
                        p.onOpen?.();
                        onClose?.();
                      }}
                    />
                  ))}
                  <div className="shrink-0 w-4" />
                </div>
              </div>
            </div>

            {/* bottom fade */}
            <div className="h-2 w-full rounded-b-[28px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}