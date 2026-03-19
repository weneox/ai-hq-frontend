import { motion } from "framer-motion";
import { Globe, Sparkles } from "lucide-react";
import { truncateMiddle } from "../lib/setupStudioHelpers.js";

export default function SetupStudioScanningStage({
  lastUrl,
  scanLines,
  scanLineIndex,
}) {
  return (
    <motion.div
      key="setup-studio-scanning"
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-scan"
    >
      <div className="setup-studio-scan__intro">
        <div className="setup-studio-scan__eyebrow">reading source</div>
        <div className="setup-studio-scan__headline">
          The surface is being translated into structure.
        </div>
        <p className="setup-studio-scan__copy">
          Burada sistem sadəcə yükləmir. Business siqnalları ayırır, ilk identity
          skeletini çıxarır və operational memory qatını formalaşdırır.
        </p>
      </div>

      <div className="setup-studio-scan__layout">
        <div className="setup-studio-scan__panel">
          <div className="setup-studio-scan__panel-glow" />
          <div className="setup-studio-scan__panel-grid" />

          <div className="setup-studio-scan__top">
            <div className="setup-studio-scan__state">
              <span className="setup-studio-scan__state-dot" />
              <span>live pass running</span>
            </div>

            <div className="setup-studio-scan__badge">
              <Sparkles className="h-4 w-4" />
              <span>shape extraction</span>
            </div>
          </div>

          {lastUrl ? (
            <div className="setup-studio-scan__url">
              <Globe className="h-4 w-4" />
              <span>{truncateMiddle(lastUrl, 42, 22)}</span>
            </div>
          ) : null}

          <div className="setup-studio-scan__steps">
            {scanLines.map((line, index) => {
              const active = index === scanLineIndex;
              const passed = index < scanLineIndex;

              return (
                <motion.div
                  key={line}
                  animate={{
                    opacity: active || passed ? 1 : 0.36,
                    y: active ? -2 : 0,
                    scale: active ? 1.01 : 1,
                  }}
                  transition={{ duration: 0.28 }}
                  className={[
                    "setup-studio-scan__step",
                    active ? "is-active" : "",
                    passed ? "is-passed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="setup-studio-scan__step-rail">
                    <span className="setup-studio-scan__step-dot" />
                    <span className="setup-studio-scan__step-line" />
                  </div>

                  <div className="setup-studio-scan__step-body">
                    <div className="setup-studio-scan__step-index">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="setup-studio-scan__step-text">{line}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="setup-studio-scan__side">
          <div className="setup-studio-scan__side-label">current pass</div>

          <div className="setup-studio-scan__side-stack">
            <div className="setup-studio-scan__side-card">
              <div className="setup-studio-scan__side-name">active line</div>
              <div className="setup-studio-scan__side-value">
                {scanLines[scanLineIndex] || "Reading source"}
              </div>
            </div>

            <div className="setup-studio-scan__side-card">
              <div className="setup-studio-scan__side-name">next output</div>
              <div className="setup-studio-scan__side-value">
                identity draft and knowledge candidates
              </div>
            </div>

            <div className="setup-studio-scan__side-card">
              <div className="setup-studio-scan__side-name">mode</div>
              <div className="setup-studio-scan__side-value">continuous extraction</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}