import { motion } from "framer-motion";
import { Globe2, Loader2, Sparkles } from "lucide-react";
import { truncateMiddle } from "../lib/setupStudioHelpers.js";

function s(v) {
  return String(v ?? "").trim();
}

export default function SetupStudioScanningStage({
  lastUrl,
  scanLines = [],
  scanLineIndex = 0,
}) {
  const safeLines = Array.isArray(scanLines) && scanLines.length
    ? scanLines
    : [
        "Reading the primary source",
        "Extracting business identity",
        "Collecting knowledge signals",
        "Detecting service structure",
      ];

  const activeIndex = Math.max(0, Math.min(scanLineIndex, safeLines.length - 1));
  const activeLine = safeLines[activeIndex] || "Reading the primary source";
  const clippedUrl = s(lastUrl) ? truncateMiddle(lastUrl, 58, 28) : "";

  return (
    <motion.section
      key="setup-studio-scanning"
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_360px]"
    >
      <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
        <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-200/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative border-b border-slate-200/70 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-[760px]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Building draft
              </div>

              <h2 className="text-[28px] font-semibold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-[34px]">
                We’re shaping the first business draft now.
              </h2>

              <p className="mt-3 max-w-[680px] text-[14px] leading-7 text-slate-600 sm:text-[15px]">
                The system is reading the source, extracting the business identity,
                and preparing a reviewable draft before launch setup.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-[12px] font-semibold text-slate-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-slate-500" />
              Live extraction
            </div>
          </div>

          {clippedUrl ? (
            <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white/92 px-3 py-2 text-xs text-slate-600 shadow-sm">
              <Globe2 className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="truncate">{clippedUrl}</span>
            </div>
          ) : null}
        </div>

        <div className="relative px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-3">
            {safeLines.map((line, index) => {
              const isActive = index === activeIndex;
              const isDone = index < activeIndex;
              const isLast = index === safeLines.length - 1;

              return (
                <motion.div
                  key={line}
                  animate={{
                    opacity: isActive || isDone ? 1 : 0.46,
                    y: isActive ? -2 : 0,
                    scale: isActive ? 1.01 : 1,
                  }}
                  transition={{ duration: 0.24 }}
                  className={`relative overflow-hidden rounded-[22px] border px-4 py-4 sm:px-5 ${
                    isActive
                      ? "border-sky-200 bg-sky-50/78 shadow-[0_16px_34px_rgba(79,140,255,.10)]"
                      : isDone
                        ? "border-emerald-200 bg-emerald-50/70"
                        : "border-slate-200 bg-white/72"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex shrink-0 flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold ${
                          isActive
                            ? "bg-sky-600 text-white"
                            : isDone
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      {!isLast ? (
                        <div
                          className={`mt-2 h-10 w-px ${
                            isDone ? "bg-emerald-200" : "bg-slate-200"
                          }`}
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-[15px] font-semibold text-slate-900">
                          {line}
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                            isActive
                              ? "bg-white text-sky-700"
                              : isDone
                                ? "bg-white text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isActive ? "active" : isDone ? "done" : "queued"}
                        </span>
                      </div>

                      <div className="mt-1.5 text-sm leading-6 text-slate-600">
                        {isActive
                          ? "This step is running now."
                          : isDone
                            ? "Completed in the current pass."
                            : "Waiting for the current step to finish."}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/84 shadow-[0_20px_60px_rgba(15,23,42,.07)] backdrop-blur-xl">
          <div className="border-b border-slate-200/70 px-5 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Current pass
            </div>
          </div>

          <div className="space-y-4 px-5 py-5">
            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Active line
              </div>
              <div className="mt-2 text-[16px] font-semibold leading-7 text-slate-950">
                {activeLine}
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Next output
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">
                Identity draft, source evidence, and the first set of structured business signals.
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Mode
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">
                Guided first-pass extraction for a reviewable launch draft.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_44px_rgba(15,23,42,.05)] backdrop-blur">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            What happens next
          </div>
          <div className="mt-3 text-sm leading-7 text-slate-600">
            When this pass finishes, the studio shows the first draft so you can
            refine it before moving into launch setup.
          </div>
        </div>
      </div>
    </motion.section>
  );
}