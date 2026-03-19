import { Globe, Loader2, Sparkles, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SetupStudioEntryStage({
  discoveryForm,
  error,
  importingWebsite,
  onSetDiscoveryField,
  onScanBusiness,
}) {
  return (
    <motion.div
      key="setup-studio-entry"
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-entry"
    >
      <div className="setup-studio-entry__intro">
        <div className="setup-studio-entry__eyebrow">entry signal</div>
        <p className="setup-studio-entry__lead">
          URL daxil et. Studio əvvəl səthi oxuyacaq, sonra identity, knowledge və
          service istiqamətini özü qurmağa başlayacaq.
        </p>
      </div>

      <div className="setup-studio-entry__layout">
        <form onSubmit={onScanBusiness} className="setup-studio-entry__surface">
          <div className="setup-studio-entry__surface-glow" />
          <div className="setup-studio-entry__surface-grid" />

          <div className="setup-studio-entry__surface-top">
            <div className="setup-studio-entry__modes">
              <div className="setup-studio-entry__mode is-active">
                <Globe className="h-4 w-4" />
                <span>website</span>
              </div>
              <div className="setup-studio-entry__mode">
                <Sparkles className="h-4 w-4" />
                <span>notes</span>
              </div>
            </div>

            <div className="setup-studio-entry__surface-state">
              <span className="setup-studio-entry__surface-state-dot" />
              <span>{importingWebsite ? "reading source" : "awaiting source"}</span>
            </div>
          </div>

          <div className="setup-studio-entry__command-wrap">
            <div className="setup-studio-entry__command-label">surface</div>

            <div className="setup-studio-entry__command">
              <Globe className="setup-studio-entry__command-icon h-5 w-5" />
              <input
                value={discoveryForm.websiteUrl}
                onChange={(e) => onSetDiscoveryField("websiteUrl", e.target.value)}
                className="setup-studio-entry__command-input"
                placeholder="https://yourbusiness.com"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="setup-studio-entry__note-wrap">
            <div className="setup-studio-entry__note-label">optional direction</div>

            <textarea
              value={discoveryForm.note}
              onChange={(e) => onSetDiscoveryField("note", e.target.value)}
              className="setup-studio-entry__note"
              placeholder="Məsələn: əsas istiqamətimiz Instagram DM automation, lead qualification və AI-driven sales flow-dur."
            />
          </div>

          {error ? (
            <div className="setup-studio-entry__error">
              {error}
            </div>
          ) : null}

          <div className="setup-studio-entry__footer">
            <div className="setup-studio-entry__trace">
              <div className="setup-studio-entry__trace-line" />
              <div className="setup-studio-entry__trace-copy">
                Studio source-dan ilk business memory draftını quracaq.
              </div>
            </div>

            <button
              type="submit"
              disabled={importingWebsite}
              className="setup-studio-entry__submit"
            >
              {importingWebsite ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Start scan
                </>
              )}
            </button>
          </div>
        </form>

        <div className="setup-studio-entry__signals">
          <div className="setup-studio-entry__signals-label">first pass</div>

          <div className="setup-studio-entry__signal-list">
            <div className="setup-studio-entry__signal-item">
              <div className="setup-studio-entry__signal-name">identity</div>
              <div className="setup-studio-entry__signal-value">
                business name, language, positioning
              </div>
            </div>

            <div className="setup-studio-entry__signal-item">
              <div className="setup-studio-entry__signal-name">knowledge</div>
              <div className="setup-studio-entry__signal-value">
                reusable facts, proof points, source signals
              </div>
            </div>

            <div className="setup-studio-entry__signal-item">
              <div className="setup-studio-entry__signal-name">offer</div>
              <div className="setup-studio-entry__signal-value">
                service direction and first operational shape
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}