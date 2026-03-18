import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { truncateMiddle } from "../lib/setupStudioHelpers.js";

export default function SetupStudioScanningStage({
  lastUrl,
  scanLines,
  scanLineIndex,
}) {
  return (
    <SetupStudioStageShell
      eyebrow="scanning"
      title={
        <>
          Scanning your website.
          <br />
          Extracting the first shape.
        </>
      }
      body="Bu hissə oxunmur, axır. Sistem səhifələri yoxlayır və ilk operational twin qatını hazırlayır."
    >
      <div className="mx-auto max-w-[760px]">
        {lastUrl ? (
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/80 px-4 py-2 text-sm text-slate-600">
            <Globe className="h-4 w-4" />
            {truncateMiddle(lastUrl, 34, 20)}
          </div>
        ) : null}

        <div className="space-y-4">
          {scanLines.map((line, index) => {
            const active = index === scanLineIndex;
            const passed = index < scanLineIndex;

            return (
              <motion.div
                key={line}
                animate={{
                  opacity: active || passed ? 1 : 0.42,
                  x: active ? 12 : 0,
                }}
                transition={{ duration: 0.28 }}
                className="flex items-center gap-4 border-b border-slate-900/8 pb-4"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    passed ? "bg-emerald-500" : active ? "bg-cyan-500" : "bg-slate-300"
                  }`}
                />
                <div
                  className={`text-2xl font-medium tracking-[-0.04em] ${
                    active || passed ? "text-slate-950" : "text-slate-400"
                  }`}
                >
                  {line}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SetupStudioStageShell>
  );
}