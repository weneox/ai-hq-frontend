import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  FileText,
  Sparkles,
  Loader2,
  X,
  ArrowRight,
} from "lucide-react";

import instagramIcon from "../../../assets/setup-studio/brands/instagram.svg";
import messengerIcon from "../../../assets/setup-studio/brands/messenger.svg";
import telegramIcon from "../../../assets/setup-studio/brands/telegram.svg";
import tiktokIcon from "../../../assets/setup-studio/brands/tiktok.svg";
import whatsappIcon from "../../../assets/setup-studio/brands/whatsapp.svg";

const SOURCE_OPTIONS = [
  {
    key: "website",
    label: "Website",
    hint: "Domain or website link",
    placeholder: "yourbusiness.com",
    icon: Globe,
    theme: "website",
  },
  {
    key: "instagram",
    label: "Instagram",
    hint: "Handle or profile link",
    placeholder: "@yourbrand",
    iconSrc: instagramIcon,
    theme: "instagram",
  },
  {
    key: "tiktok",
    label: "TikTok",
    hint: "Handle or profile link",
    placeholder: "@yourbrand",
    iconSrc: tiktokIcon,
    theme: "tiktok",
  },
  {
    key: "messenger",
    label: "Messenger",
    hint: "Page or chat link",
    placeholder: "m.me/yourbrand",
    iconSrc: messengerIcon,
    theme: "messenger",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    hint: "Phone or wa.me link",
    placeholder: "+994 50 000 00 00",
    iconSrc: whatsappIcon,
    theme: "whatsapp",
  },
  {
    key: "telegram",
    label: "Telegram",
    hint: "Handle or t.me link",
    placeholder: "@yourbrand",
    iconSrc: telegramIcon,
    theme: "telegram",
  },
  {
    key: "note",
    label: "Note",
    hint: "Anything useful in one line",
    placeholder: "We book appointments mostly from Instagram and WhatsApp.",
    icon: FileText,
    theme: "note",
    multiline: true,
  },
];

const URL_SOURCE_ORDER = ["website", "instagram", "tiktok", "messenger", "whatsapp", "telegram"];

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
  const handle = cleanHandle(x).replace(/^t\.me\//i, "").replace(/^telegram\.me\//i, "").replace(/^@/, "");
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
    messenger: "",
    whatsapp: "",
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
    if (key === "messenger") out.messenger = value;
    if (key === "whatsapp") out.whatsapp = value;
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
      messenger: "",
      whatsapp: "",
      telegram: "",
    };
  }

  if (url.includes("instagram.com")) {
    return { website: "", instagram: primary, tiktok: "", messenger: "", whatsapp: "", telegram: "" };
  }

  if (url.includes("tiktok.com")) {
    return { website: "", instagram: "", tiktok: primary, messenger: "", whatsapp: "", telegram: "" };
  }

  if (url.includes("m.me") || url.includes("facebook.com") || url.includes("messenger.com")) {
    return { website: "", instagram: "", tiktok: "", messenger: primary, whatsapp: "", telegram: "" };
  }

  if (url.includes("wa.me") || url.includes("whatsapp")) {
    return { website: "", instagram: "", tiktok: "", messenger: "", whatsapp: primary, telegram: "" };
  }

  if (url.includes("t.me") || url.includes("telegram.me")) {
    return { website: "", instagram: "", tiktok: "", messenger: "", whatsapp: "", telegram: primary };
  }

  return {
    website: primary.replace(/^https?:\/\//i, ""),
    instagram: "",
    tiktok: "",
    messenger: "",
    whatsapp: "",
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

  if (key === "messenger") {
    return x.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }

  if (key === "whatsapp") {
    return x;
  }

  if (key === "telegram") {
    const handle = cleanHandle(x).replace(/^t\.me\//i, "").replace(/^telegram\.me\//i, "").replace(/^@/, "");
    return `@${handle}`;
  }

  return x;
}

function SourceIcon({ item }) {
  if (item.iconSrc) {
    return <img src={item.iconSrc} alt="" aria-hidden="true" className="setup-studio-entry__icon-image" />;
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
      messenger: noteSeed.messenger || primarySeed.messenger || "",
      whatsapp: noteSeed.whatsapp || primarySeed.whatsapp || "",
      telegram: noteSeed.telegram || primarySeed.telegram || "",
      note: extractPlainNote(discoveryForm?.note),
    }),
    [
      noteSeed.website,
      noteSeed.instagram,
      noteSeed.tiktok,
      noteSeed.messenger,
      noteSeed.whatsapp,
      noteSeed.telegram,
      primarySeed.website,
      primarySeed.instagram,
      primarySeed.tiktok,
      primarySeed.messenger,
      primarySeed.whatsapp,
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
      messenger: normalizeMessenger(values.messenger),
      whatsapp: normalizeWhatsApp(values.whatsapp),
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

  function clearValue(key) {
    setValues((prev) => ({ ...prev, [key]: "" }));
  }

  const activeSource = SOURCE_OPTIONS.find((item) => item.key === activeKey) || SOURCE_OPTIONS[0];
  const activeHasValue = !!s(values[activeKey]);

  const signalNodes = SOURCE_OPTIONS.filter((item) => item.key !== "note").map((item, index) => {
    const angle = -90 + index * 60;
    const hasValue = !!normalizedMap[item.key];
    const isActive = activeKey === item.key;

    return {
      ...item,
      angle,
      hasValue,
      isActive,
    };
  });

  return (
    <motion.form
      onSubmit={onScanBusiness}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-entry"
    >
      <section className="setup-studio-entry__hero">
        <div className="setup-studio-entry__eyebrow">first signal</div>
        <h1 className="setup-studio-entry__title">Bring what already exists.</h1>
        <p className="setup-studio-entry__subtitle">
          A domain, a handle, a number, or a note.
        </p>
      </section>

      <section className="setup-studio-entry__theatre" aria-hidden="true">
        <div className="setup-studio-entry__core">
          <div className="setup-studio-entry__core-halo setup-studio-entry__core-halo--outer" />
          <div className="setup-studio-entry__core-halo setup-studio-entry__core-halo--mid" />
          <div className="setup-studio-entry__core-shell">
            <div className="setup-studio-entry__core-shell-inner">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          {signalNodes.map((item) => (
            <motion.button
              key={item.key}
              type="button"
              className={[
                "setup-studio-entry__orbit-node",
                `theme-${item.theme}`,
                item.isActive ? "is-active" : "",
                item.hasValue ? "has-value" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) rotate(${item.angle}deg) translateY(-180px) rotate(${-item.angle}deg)`,
              }}
              onClick={() => setActiveKey(item.key)}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="setup-studio-entry__orbit-icon">
                <SourceIcon item={item} />
              </span>
              <span className="setup-studio-entry__orbit-label">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="setup-studio-entry__composer">
        <div className="setup-studio-entry__source-rail">
          {SOURCE_OPTIONS.map((item) => {
            const isActive = activeKey === item.key;
            const hasValue = item.key === "note" ? !!s(values.note) : !!normalizedMap[item.key];

            return (
              <button
                key={item.key}
                type="button"
                className={[
                  "setup-studio-entry__source-pill",
                  `theme-${item.theme}`,
                  isActive ? "is-active" : "",
                  hasValue ? "has-value" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveKey(item.key)}
              >
                <span className="setup-studio-entry__source-pill-icon">
                  <SourceIcon item={item} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className={`setup-studio-entry__dock theme-${activeSource.theme}`}>
          <div className="setup-studio-entry__dock-head">
            <div className="setup-studio-entry__dock-source">
              <span className="setup-studio-entry__dock-icon">
                <SourceIcon item={activeSource} />
              </span>

              <div className="setup-studio-entry__dock-copy">
                <div className="setup-studio-entry__dock-title">{activeSource.label}</div>
                <div className="setup-studio-entry__dock-hint">{activeSource.hint}</div>
              </div>
            </div>

            {activeHasValue ? (
              <button
                type="button"
                className="setup-studio-entry__dock-clear"
                onClick={() => clearValue(activeKey)}
                aria-label={`${activeSource.label} remove`}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {activeSource.multiline ? (
            <textarea
              value={values.note}
              onChange={(e) => setValue("note", e.target.value)}
              className="setup-studio-entry__textarea"
              placeholder={activeSource.placeholder}
            />
          ) : (
            <input
              value={values[activeKey]}
              onChange={(e) => setValue(activeKey, e.target.value)}
              className="setup-studio-entry__input"
              placeholder={activeSource.placeholder}
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </div>

        <div className="setup-studio-entry__signals">
          {primarySource ? (
            <motion.button
              type="button"
              className={`setup-studio-entry__signal setup-studio-entry__signal--primary theme-${primarySource.theme}`}
              onClick={() => setActiveKey(primarySource.key)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="setup-studio-entry__signal-icon">
                <SourceIcon item={primarySource} />
              </span>

              <span className="setup-studio-entry__signal-copy">
                <span className="setup-studio-entry__signal-kicker">Primary signal</span>
                <span className="setup-studio-entry__signal-value">{primarySource.value}</span>
              </span>
            </motion.button>
          ) : null}

          {linkSources
            .filter((item) => item.key !== primarySource?.key)
            .map((item) => (
              <motion.button
                key={item.key}
                type="button"
                className={`setup-studio-entry__signal theme-${item.theme}`}
                onClick={() => setActiveKey(item.key)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="setup-studio-entry__signal-icon">
                  <SourceIcon item={item} />
                </span>
                <span className="setup-studio-entry__signal-copy">
                  <span className="setup-studio-entry__signal-kicker">{item.label}</span>
                  <span className="setup-studio-entry__signal-value">{item.value}</span>
                </span>
              </motion.button>
            ))}

          {s(values.note) ? (
            <motion.button
              type="button"
              className="setup-studio-entry__signal setup-studio-entry__signal--note theme-note"
              onClick={() => setActiveKey("note")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="setup-studio-entry__signal-icon">
                <FileText className="h-4 w-4" />
              </span>
              <span className="setup-studio-entry__signal-copy">
                <span className="setup-studio-entry__signal-kicker">Context note</span>
                <span className="setup-studio-entry__signal-value">
                  {values.note.length > 88 ? `${values.note.slice(0, 88)}...` : values.note}
                </span>
              </span>
            </motion.button>
          ) : null}
        </div>

        {error ? <div className="setup-studio-entry__error">{error}</div> : null}

        <div className="setup-studio-entry__footer">
          <button
            type="submit"
            disabled={importingWebsite || !primarySource?.url}
            className="setup-studio-entry__submit"
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
      </section>
    </motion.form>
  );
}