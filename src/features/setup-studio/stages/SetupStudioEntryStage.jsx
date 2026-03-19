import { Globe, Loader2, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SetupStudioEntryStage({
  discoveryForm,
  error,
  importingWebsite,
  onSetDiscoveryField,
  onScanBusiness,
}) {
  return (
    <motion.form
      onSubmit={onScanBusiness}
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-entry-minimal"
    >
      <div className="setup-studio-entry-minimal__field">
        <div className="setup-studio-entry-minimal__label">website</div>

        <div className="setup-studio-entry-minimal__input-shell">
          <Globe className="setup-studio-entry-minimal__icon h-5 w-5" />
          <input
            value={discoveryForm.websiteUrl}
            onChange={(e) => onSetDiscoveryField("websiteUrl", e.target.value)}
            className="setup-studio-entry-minimal__input"
            placeholder="https://yourbusiness.com"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="setup-studio-entry-minimal__field">
        <div className="setup-studio-entry-minimal__label">optional focus</div>

        <textarea
          value={discoveryForm.note}
          onChange={(e) => onSetDiscoveryField("note", e.target.value)}
          className="setup-studio-entry-minimal__note"
          placeholder="Məsələn: Instagram DM automation və lead qualification."
        />
      </div>

      {error ? <div className="setup-studio-entry-minimal__error">{error}</div> : null}

      <div className="setup-studio-entry-minimal__footer">
        <div className="setup-studio-entry-minimal__hint">
          Identity, knowledge və service direction scan-dan sonra çıxacaq.
        </div>

        <button
          type="submit"
          disabled={importingWebsite}
          className="setup-studio-entry-minimal__submit"
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
    </motion.form>
  );
}