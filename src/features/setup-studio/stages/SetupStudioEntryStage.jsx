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
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-entry-line"
    >
      <div className="setup-studio-entry-line__group">
        <div className="setup-studio-entry-line__label">website</div>

        <div className="setup-studio-entry-line__row">
          <Globe className="setup-studio-entry-line__icon h-5 w-5" />
          <input
            value={discoveryForm.websiteUrl}
            onChange={(e) => onSetDiscoveryField("websiteUrl", e.target.value)}
            className="setup-studio-entry-line__input"
            placeholder="https://yourbusiness.com"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="setup-studio-entry-line__group is-secondary">
        <div className="setup-studio-entry-line__label">optional focus</div>

        <div className="setup-studio-entry-line__row is-secondary">
          <textarea
            value={discoveryForm.note}
            onChange={(e) => onSetDiscoveryField("note", e.target.value)}
            className="setup-studio-entry-line__note"
            placeholder="Instagram DM automation və lead qualification."
          />
        </div>
      </div>

      {error ? <div className="setup-studio-entry-line__error">{error}</div> : null}

      <div className="setup-studio-entry-line__actions">
        <button
          type="submit"
          disabled={importingWebsite}
          className="setup-studio-entry-line__submit"
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