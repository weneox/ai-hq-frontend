import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Globe, FileText, Loader2, ArrowRight, Check } from "lucide-react";

import instagramIcon from "../../../assets/setup-studio/brands/instagram.svg";
import messengerIcon from "../../../assets/setup-studio/brands/messenger.svg";
import telegramIcon from "../../../assets/setup-studio/brands/telegram.svg";
import tiktokIcon from "../../../assets/setup-studio/brands/tiktok.svg";
import whatsappIcon from "../../../assets/setup-studio/brands/whatsapp.svg";

const SOURCE_OPTIONS = [
  {
    key: "website",
    label: "Website",
    hint: "Use a domain or website link",
    placeholder: "yourbusiness.com",
    icon: Globe,
    theme: "website",
  },
  {
    key: "instagram",
    label: "Instagram",
    hint: "Use a handle or profile link",
    placeholder: "@yourbrand",
    iconSrc: instagramIcon,
    theme: "instagram",
  },
  {
    key: "tiktok",
    label: "TikTok",
    hint: "Use a handle or profile link",
    placeholder: "@yourbrand",
    iconSrc: tiktokIcon,
    theme: "tiktok",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    hint: "Use a number or wa.me link",
    placeholder: "+994 50 000 00 00",
    iconSrc: whatsappIcon,
    theme: "whatsapp",
  },
  {
    key: "messenger",
    label: "Messenger",
    hint: "Use a page or m.me link",
    placeholder: "m.me/yourbrand",
    iconSrc: messengerIcon,
    theme: "messenger",
  },
  {
    key: "telegram",
    label: "Telegram",
    hint: "Use a handle or t.me link",
    placeholder: "@yourbrand",
    iconSrc: telegramIcon,
    theme: "telegram",
  },
  {
    key: "note",
    label: "Short note",
    hint: "Anything important in one line",
    placeholder: "We get most leads from Instagram and WhatsApp.",
    icon: FileText,
    theme: "note",
    multiline: true,
  },
];

const URL_SOURCE_ORDER = ["website", "instagram", "tiktok", "whatsapp", "messenger", "telegram"];

function s(v) {
  return String(v ?? "").trim();
}

function cleanHandle(v) {
  return s(v)
    .replace(/^@+/, "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
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
  const handle = cleanHandle(x).replace(/^tiktok\.com\//i, "").replace(/^@/, "");
  return `https://tiktok.com/@${handle}`;
}

function normalizeMessenger(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;

  const handle = cleanHandle(x)
    .replace(/^facebook\.com\//i, "")
    .replace(/^m\.me\//i, "")
    .replace(/^messenger\.com\//i, "");

  return `https://m.me/${handle}`;
}

function normalizeWhatsApp(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;
  const digits = x.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function normalizeTelegram(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;
  const handle = cleanHandle(x)
    .replace(/^t\.me\//i, "")
    .replace(/^telegram\.me\//i, "")
    .replace(/^@/, "");
  return `https://t.me/${handle}`;
}

function extractPlainNote(raw) {
  return s(raw).split("[studio_sources]")[0].trim();
}

function parseStudioSources(raw) {
  const out = {
    website: "",
    instagram: "",
    tiktok: "",
    whatsapp: "",
    messenger: "",
    telegram: "",
  };

  const text = s(raw);
  const marker = "[studio_sources]";
  const idx = text.indexOf(marker);

  if (idx === -1) return out;

  const block = text.slice(idx + marker.length).trim();
  if (!block) return out;

  for (const line of block.split(/\r?\n/)) {
    const [label, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const key = s(label).toLowerCase();

    if (!value) continue;
    if (key === "website") out.website = value;
    if (key === "instagram") out.instagram = value;
    if (key === "tiktok") out.tiktok = value;
    if (key === "whatsapp") out.whatsapp = value;
    if (key === "messenger") out.messenger = value;
    if (key === "telegram") out.telegram = value;
  }

  return out;
}

function seedSourcesFromPrimary(primary) {
  const url = s(primary).toLowerCase();

  if (!url) {
    return {
      website: "",
      instagram: "",
      tiktok: "",
      whatsapp: "",
      messenger: "",
      telegram: "",
    };
  }

  if (url.includes("instagram.com")) {
    return { website: "", instagram: primary, tiktok: "", whatsapp: "", messenger: "", telegram: "" };
  }

  if (url.includes("tiktok.com")) {
    return { website: "", instagram: "", tiktok: primary, whatsapp: "", messenger: "", telegram: "" };
  }

  if (url.includes("wa.me") || url.includes("whatsapp")) {
    return { website: "", instagram: "", tiktok: "", whatsapp: primary, messenger: "", telegram: "" };
  }

  if (url.includes("m.me") || url.includes("messenger.com") || url.includes("facebook.com")) {
    return { website: "", instagram: "", tiktok: "", whatsapp: "", messenger: primary, telegram: "" };
  }

  if (url.includes("t.me") || url.includes("telegram.me")) {
    return { website: "", instagram: "", tiktok: "", whatsapp: "", messenger: "", telegram: primary };
  }

  return {
    website: primary.replace(/^https?:\/\//i, ""),
    instagram: "",
    tiktok: "",
    whatsapp: "",
    messenger: "",
    telegram: "",
  };
}

function formatSourceValue(key, raw) {
  const x = s(raw);
  if (!x) return "";

  if (key === "website") {
    return x.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }

  if (key === "instagram") {
    const handle = cleanHandle(x).replace(/^instagram\.com\//i, "").replace(/^@/, "");
    return `@${handle}`;
  }

  if (key === "tiktok") {
    const handle = cleanHandle(x).replace(/^tiktok\.com\//i, "").replace(/^@/, "");
    return `@${handle}`;
  }

  if (key === "telegram") {
    const handle = cleanHandle(x).replace(/^t\.me\//i, "").replace(/^telegram\.me\//i, "").replace(/^@/, "");
    return `@${handle}`;
  }

  return x.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function SourceIcon({ item }) {
  if (item.iconSrc) {
    return (
      <span
        className="setup-studio-brand-icon"
        aria-hidden="true"
        style={{ "--brand-icon-url": `url(${item.iconSrc})` }}
      />
    );
  }

  const Icon = item.icon;
  return <Icon className="h-4 w-4" />;
}

export default function SetupStudioEntryStage({
  discoveryForm,
  error,
  importingWebsite,
  onSetDiscoveryField,
  onScanBusiness,
}) {
  const primarySeed = useMemo(
    () => seedSourcesFromPrimary(discoveryForm?.websiteUrl),
    [discoveryForm?.websiteUrl]
  );

  const noteSeed = useMemo(
    () => parseStudioSources(discoveryForm?.note),
    [discoveryForm?.note]
  );

  const initialValues = useMemo(
    () => ({
      website: noteSeed.website || primarySeed.website || "",
      instagram: noteSeed.instagram || primarySeed.instagram || "",
      tiktok: noteSeed.tiktok || primarySeed.tiktok || "",
      whatsapp: noteSeed.whatsapp || primarySeed.whatsapp || "",
      messenger: noteSeed.messenger || primarySeed.messenger || "",
      telegram: noteSeed.telegram || primarySeed.telegram || "",
      note: extractPlainNote(discoveryForm?.note),
    }),
    [
      noteSeed.website,
      noteSeed.instagram,
      noteSeed.tiktok,
      noteSeed.whatsapp,
      noteSeed.messenger,
      noteSeed.telegram,
      primarySeed.website,
      primarySeed.instagram,
      primarySeed.tiktok,
      primarySeed.whatsapp,
      primarySeed.messenger,
      primarySeed.telegram,
      discoveryForm?.note,
    ]
  );

  const [activeKey, setActiveKey] = useState("website");
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);

    const firstFilled =
      SOURCE_OPTIONS.find((item) => item.key !== "note" && s(initialValues[item.key]))?.key ||
      (s(initialValues.note) ? "note" : "website");

    setActiveKey(firstFilled);
  }, [initialValues]);

  const normalizedMap = useMemo(
    () => ({
      website: normalizeWebsite(values.website),
      instagram: normalizeInstagram(values.instagram),
      tiktok: normalizeTikTok(values.tiktok),
      whatsapp: normalizeWhatsApp(values.whatsapp),
      messenger: normalizeMessenger(values.messenger),
      telegram: normalizeTelegram(values.telegram),
    }),
    [values]
  );

  const linkSources = useMemo(() => {
    return URL_SOURCE_ORDER.map((key) => {
      const item = SOURCE_OPTIONS.find((entry) => entry.key === key);
      const url = normalizedMap[key];

      return url
        ? {
            ...item,
            url,
            value: formatSourceValue(key, values[key]),
          }
        : null;
    }).filter(Boolean);
  }, [normalizedMap, values]);

  const primarySource = linkSources[0] || null;

  const composedNote = useMemo(() => {
    const noteParts = [];
    const sourceLines = linkSources.map((item) => `${item.label}: ${item.url}`);

    if (s(values.note)) noteParts.push(s(values.note));
    if (sourceLines.length) noteParts.push(`[studio_sources]\n${sourceLines.join("\n")}`);

    return noteParts.join("\n\n").trim();
  }, [linkSources, values.note]);

  useEffect(() => {
    onSetDiscoveryField("websiteUrl", primarySource?.url || "");
    onSetDiscoveryField("note", composedNote);
  }, [primarySource?.url, composedNote, onSetDiscoveryField]);

  function setValue(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function getStatus(item) {
    if (item.key === "note") return s(values.note) ? "added" : "idle";
    return normalizedMap[item.key] ? "added" : "idle";
  }

  const activeSource = SOURCE_OPTIONS.find((item) => item.key === activeKey) || SOURCE_OPTIONS[0];
  const activeValue = values[activeKey] || "";

  return (
    <motion.form
      onSubmit={onScanBusiness}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-intake"
    >
      <section className="setup-studio-intake__intro">
        <div className="setup-studio-intake__eyebrow">First signal</div>

        <h1 className="setup-studio-intake__title">Start from one place.</h1>

        <p className="setup-studio-intake__copy">
          A domain, a handle, a number, or a short note. We’ll use the first valid source as the primary one.
        </p>

        <div className="setup-studio-intake__art">
          <div className="setup-studio-intake__art-card setup-studio-intake__art-card--back" />
          <div className="setup-studio-intake__art-card setup-studio-intake__art-card--mid" />
          <div className="setup-studio-intake__art-card setup-studio-intake__art-card--front">
            <div className="setup-studio-intake__art-badge theme-instagram">
              <span
                className="setup-studio-brand-icon"
                style={{ "--brand-icon-url": `url(${instagramIcon})` }}
                aria-hidden="true"
              />
            </div>
            <div className="setup-studio-intake__art-badge theme-whatsapp">
              <span
                className="setup-studio-brand-icon"
                style={{ "--brand-icon-url": `url(${whatsappIcon})` }}
                aria-hidden="true"
              />
            </div>
            <div className="setup-studio-intake__art-badge theme-website">
              <Globe className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>

      <section className="setup-studio-intake__panel">
        <div className="setup-studio-intake__list">
          {SOURCE_OPTIONS.map((item) => {
            const isActive = activeKey === item.key;
            const isAdded = getStatus(item) === "added";

            return (
              <button
                key={item.key}
                type="button"
                className={[
                  "setup-studio-intake__source",
                  `theme-${item.theme}`,
                  isActive ? "is-active" : "",
                  isAdded ? "is-added" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveKey(item.key)}
              >
                <span className="setup-studio-intake__source-icon">
                  <SourceIcon item={item} />
                </span>

                <span className="setup-studio-intake__source-copy">
                  <span className="setup-studio-intake__source-title">{item.label}</span>
                  <span className="setup-studio-intake__source-hint">{item.hint}</span>
                </span>

                {isAdded ? (
                  <span className="setup-studio-intake__source-state">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className={`setup-studio-intake__composer theme-${activeSource.theme}`}>
          <div className="setup-studio-intake__composer-head">
            <div className="setup-studio-intake__composer-source">
              <span className="setup-studio-intake__composer-icon">
                <SourceIcon item={activeSource} />
              </span>

              <div className="setup-studio-intake__composer-copy">
                <div className="setup-studio-intake__composer-title">{activeSource.label}</div>
                <div className="setup-studio-intake__composer-hint">{activeSource.hint}</div>
              </div>
            </div>
          </div>

          {activeSource.multiline ? (
            <textarea
              value={values.note}
              onChange={(e) => setValue("note", e.target.value)}
              className="setup-studio-intake__textarea"
              placeholder={activeSource.placeholder}
            />
          ) : (
            <input
              value={activeValue}
              onChange={(e) => setValue(activeKey, e.target.value)}
              className="setup-studio-intake__input"
              placeholder={activeSource.placeholder}
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </div>

        <div className="setup-studio-intake__footer">
          <div className="setup-studio-intake__summary">
            {primarySource ? (
              <>
                <div className="setup-studio-intake__summary-kicker">Primary source</div>
                <div className="setup-studio-intake__summary-value">{primarySource.value}</div>
              </>
            ) : (
              <>
                <div className="setup-studio-intake__summary-kicker">Primary source</div>
                <div className="setup-studio-intake__summary-value is-empty">
                  Add one valid source to continue
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={importingWebsite || !primarySource?.url}
            className="setup-studio-intake__submit"
          >
            {importingWebsite ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning
              </>
            ) : (
              <>
                Start discovery
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {error ? <div className="setup-studio-intake__error">{error}</div> : null}
      </section>
    </motion.form>
  );
}