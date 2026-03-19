import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Globe, Sparkles, Loader2, Plus, X } from "lucide-react";

const SOURCE_OPTIONS = [
  { key: "website", label: "Website" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "note", label: "Note" },
];

function s(v) {
  return String(v ?? "").trim();
}

function cleanHandle(v) {
  return s(v).replace(/^@+/, "").replace(/^https?:\/\//i, "").replace(/^www\./i, "");
}

function normalizeWebsite(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;
  return `https://${x}`;
}

function normalizeInstagram(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;
  return `https://instagram.com/${cleanHandle(x).replace(/^instagram\.com\//i, "")}`;
}

function normalizeTikTok(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;
  const handle = cleanHandle(x).replace(/^tiktok\.com\//i, "");
  return `https://tiktok.com/${handle.startsWith("@") ? handle : `@${handle}`}`;
}

function normalizeFacebook(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;
  return `https://facebook.com/${cleanHandle(x).replace(/^facebook\.com\//i, "")}`;
}

function normalizeWhatsApp(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;
  const digits = x.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function extractPlainNote(raw) {
  return s(raw).split("[studio_sources]")[0].trim();
}

function seedSourcesFromPrimary(primary) {
  const url = s(primary).toLowerCase();

  if (!url) {
    return {
      website: "",
      instagram: "",
      tiktok: "",
      facebook: "",
      whatsapp: "",
    };
  }

  if (url.includes("instagram.com")) {
    return { website: "", instagram: primary, tiktok: "", facebook: "", whatsapp: "" };
  }

  if (url.includes("tiktok.com")) {
    return { website: "", instagram: "", tiktok: primary, facebook: "", whatsapp: "" };
  }

  if (url.includes("facebook.com")) {
    return { website: "", instagram: "", tiktok: "", facebook: primary, whatsapp: "" };
  }

  if (url.includes("wa.me") || url.includes("whatsapp")) {
    return { website: "", instagram: "", tiktok: "", facebook: "", whatsapp: primary };
  }

  return {
    website: primary.replace(/^https?:\/\//i, ""),
    instagram: "",
    tiktok: "",
    facebook: "",
    whatsapp: "",
  };
}

export default function SetupStudioEntryStage({
  discoveryForm,
  error,
  importingWebsite,
  onSetDiscoveryField,
  onScanBusiness,
}) {
  const seeded = useMemo(
    () => seedSourcesFromPrimary(discoveryForm?.websiteUrl),
    [discoveryForm?.websiteUrl]
  );

  const [enabled, setEnabled] = useState(["website", "note"]);
  const [values, setValues] = useState({
    website: seeded.website,
    instagram: seeded.instagram,
    tiktok: seeded.tiktok,
    facebook: seeded.facebook,
    whatsapp: seeded.whatsapp,
    note: extractPlainNote(discoveryForm?.note),
  });

  useEffect(() => {
    const nextEnabled = ["note"];

    if (s(values.website) || s(seeded.website)) nextEnabled.push("website");
    if (s(values.instagram) || s(seeded.instagram)) nextEnabled.push("instagram");
    if (s(values.tiktok) || s(seeded.tiktok)) nextEnabled.push("tiktok");
    if (s(values.facebook) || s(seeded.facebook)) nextEnabled.push("facebook");
    if (s(values.whatsapp) || s(seeded.whatsapp)) nextEnabled.push("whatsapp");

    if (!nextEnabled.includes("website") &&
        !nextEnabled.includes("instagram") &&
        !nextEnabled.includes("tiktok") &&
        !nextEnabled.includes("facebook") &&
        !nextEnabled.includes("whatsapp")) {
      nextEnabled.unshift("website");
    }

    setEnabled((prev) => {
      const uniq = Array.from(new Set([...prev, ...nextEnabled]));
      return uniq.filter((key) => key === "note" || nextEnabled.includes(key));
    });
  }, [seeded.website, seeded.instagram, seeded.tiktok, seeded.facebook, seeded.whatsapp]);

  const normalized = useMemo(() => {
    const website = normalizeWebsite(values.website);
    const instagram = normalizeInstagram(values.instagram);
    const tiktok = normalizeTikTok(values.tiktok);
    const facebook = normalizeFacebook(values.facebook);
    const whatsapp = normalizeWhatsApp(values.whatsapp);

    const sources = [
      { key: "website", label: "Website", url: website },
      { key: "instagram", label: "Instagram", url: instagram },
      { key: "tiktok", label: "TikTok", url: tiktok },
      { key: "facebook", label: "Facebook", url: facebook },
      { key: "whatsapp", label: "WhatsApp", url: whatsapp },
    ].filter((item) => item.url);

    const primaryUrl = sources[0]?.url || "";
    const sourceLines = sources.map((item) => `${item.label}: ${item.url}`);
    const noteParts = [];

    if (s(values.note)) noteParts.push(s(values.note));
    if (sourceLines.length) {
      noteParts.push(`[studio_sources]\n${sourceLines.join("\n")}`);
    }

    return {
      primaryUrl,
      composedNote: noteParts.join("\n\n").trim(),
    };
  }, [values]);

  useEffect(() => {
    onSetDiscoveryField("websiteUrl", normalized.primaryUrl);
    onSetDiscoveryField("note", normalized.composedNote);
  }, [normalized.primaryUrl, normalized.composedNote]);

  function toggleSource(key) {
    setEnabled((prev) => {
      if (prev.includes(key)) {
        if (key === "note") return prev;
        return prev.filter((item) => item !== key);
      }
      return [...prev, key];
    });
  }

  function removeSource(key) {
    setEnabled((prev) => prev.filter((item) => item !== key));
    setValues((prev) => ({ ...prev, [key]: "" }));
  }

  function setValue(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const visibleSources = SOURCE_OPTIONS.filter((item) => enabled.includes(item.key));

  return (
    <motion.form
      onSubmit={onScanBusiness}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-source-intake"
    >
      <div className="setup-studio-source-intake__toolbar">
        <div className="setup-studio-source-intake__toolbar-copy">
          Nə varsa onu əlavə et. İlk mövcud link primary source kimi götürüləcək.
        </div>

        <div className="setup-studio-source-intake__chips">
          {SOURCE_OPTIONS.map((item) => {
            const active = enabled.includes(item.key);

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleSource(item.key)}
                className={`setup-studio-source-intake__chip ${active ? "is-active" : ""}`}
              >
                <Plus className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="setup-studio-source-intake__list">
        {visibleSources.map((item) => {
          if (item.key === "note") {
            return (
              <div key={item.key} className="setup-studio-source-intake__row is-note">
                <div className="setup-studio-source-intake__label-wrap">
                  <div className="setup-studio-source-intake__label">Note</div>
                  <div className="setup-studio-source-intake__sub">
                    İstəyə görə qısa kontekst
                  </div>
                </div>

                <div className="setup-studio-source-intake__control">
                  <textarea
                    value={values.note}
                    onChange={(e) => setValue("note", e.target.value)}
                    className="setup-studio-source-intake__textarea"
                    placeholder="Məsələn: əsas istiqamətimiz Instagram DM automation və lead qualification-dır."
                  />
                </div>
              </div>
            );
          }

          const placeholders = {
            website: "yourbusiness.com",
            instagram: "instagram.com/yourbusiness",
            tiktok: "tiktok.com/@yourbusiness",
            facebook: "facebook.com/yourbusiness",
            whatsapp: "+994 50 000 00 00",
          };

          return (
            <div key={item.key} className="setup-studio-source-intake__row">
              <div className="setup-studio-source-intake__label-wrap">
                <div className="setup-studio-source-intake__label">{item.label}</div>
                <div className="setup-studio-source-intake__sub">
                  {item.key === "website" ? "Domain və ya link" : "Profil linki və ya handle"}
                </div>
              </div>

              <div className="setup-studio-source-intake__control">
                <input
                  value={values[item.key]}
                  onChange={(e) => setValue(item.key, e.target.value)}
                  className="setup-studio-source-intake__input"
                  placeholder={placeholders[item.key]}
                  autoComplete="off"
                  spellCheck={false}
                />

                <button
                  type="button"
                  className="setup-studio-source-intake__remove"
                  onClick={() => removeSource(item.key)}
                  aria-label={`${item.label} sil`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {error ? <div className="setup-studio-source-intake__error">{error}</div> : null}

      <div className="setup-studio-source-intake__footer">
        <div className="setup-studio-source-intake__footer-copy">
          Website yoxdursa sosial linklərlə başla. Sonra bunu tam multi-source crawler-a da çevirərik.
        </div>

        <button
          type="submit"
          disabled={importingWebsite || !normalized.primaryUrl}
          className="setup-studio-source-intake__submit"
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
    </motion.form>
  );
}