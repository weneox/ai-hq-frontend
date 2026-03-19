import { Globe, Loader2, Sparkles } from "lucide-react";
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-entry-form"
    >
      <div className="setup-studio-entry-form__main">
        <label className="setup-studio-entry-form__label">Website URL</label>

        <div className="setup-studio-entry-form__input-wrap">
          <Globe className="setup-studio-entry-form__icon h-5 w-5" />
          <input
            value={discoveryForm.websiteUrl}
            onChange={(e) => onSetDiscoveryField("websiteUrl", e.target.value)}
            className="setup-studio-entry-form__input"
            placeholder="https://yourbusiness.com"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={importingWebsite}
            className="setup-studio-entry-form__submit"
          >
            {importingWebsite ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Start scan
              </>
            )}
          </button>
        </div>

        <div className="setup-studio-entry-form__meta">
          Imports homepage content, extracts identity, drafts knowledge, suggests services.
        </div>
      </div>

      <div className="setup-studio-entry-form__secondary">
        <label className="setup-studio-entry-form__label">Optional focus</label>
        <textarea
          value={discoveryForm.note}
          onChange={(e) => onSetDiscoveryField("note", e.target.value)}
          className="setup-studio-entry-form__note"
          placeholder="Məsələn: Instagram DM automation, lead qualification, AI sales workflow."
        />
      </div>

      {error ? <div className="setup-studio-entry-form__error">{error}</div> : null}
    </motion.form>
  );
}