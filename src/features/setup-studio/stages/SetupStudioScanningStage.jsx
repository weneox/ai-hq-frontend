import { motion } from "framer-motion";
import { Globe2, Loader2 } from "lucide-react";
import { truncateMiddle } from "../lib/setupStudioHelpers.js";

function s(v) {
  return String(v ?? "").trim();
}

export default function SetupStudioScanningStage({
  lastUrl,
  scanLines = [],
  scanLineIndex = 0,
}) {
  const safeLines =
    Array.isArray(scanLines) && scanLines.length
      ? scanLines
      : [
          "Reading the primary source",
          "Extracting business identity",
          "Collecting knowledge signals",
          "Preparing the first draft",
        ];

  const activeIndex = Math.max(0, Math.min(scanLineIndex, safeLines.length - 1));
  const clippedUrl = s(lastUrl) ? truncateMiddle(lastUrl, 58, 28) : "";

  return (
    <motion.section
      key="setup-studio-scanning"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[980px]"
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8">
        <div className="max-w-[720px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Analyzing
          </div>

          <h2 className="mt-5 text-[30px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[40px]">
            Building the first business draft.
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-slate-600">
            The system is reading the source, extracting business details, and
            preparing a draft you can review.
          </p>

          {clippedUrl ? (
            <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <Globe2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{clippedUrl}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-8 space-y-3">
          {safeLines.map((line, index) => {
            const active = index === activeIndex;
            const done = index < activeIndex;

            return (
              <div
                key={`${line}-${index}`}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-4 ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white"
                    : done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <div
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    active
                      ? "bg-white text-slate-950"
                      : done
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-500"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{line}</div>
                </div>

                <div className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                  {active ? "active" : done ? "done" : "queued"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}