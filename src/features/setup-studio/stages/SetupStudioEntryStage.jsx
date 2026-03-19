import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Globe,
  Loader2,
  MoreHorizontal,
  Plus,
  X,
} from "lucide-react";

import instagramIcon from "../../../assets/setup-studio/channels/instagram.svg";
import facebookIcon from "../../../assets/setup-studio/channels/facebook.svg";
import googleMapsIcon from "../../../assets/setup-studio/channels/google-maps.svg";
import linkedinIcon from "../../../assets/setup-studio/channels/linkedin.svg";
import githubIcon from "../../../assets/setup-studio/channels/github.svg";
import tiktokIcon from "../../../assets/setup-studio/channels/tiktok.svg";
import whatsappIcon from "../../../assets/setup-studio/channels/whatsapp.svg";
import youtubeIcon from "../../../assets/setup-studio/channels/youtube.svg";

const SOURCE_OPTIONS = [
  {
    key: "website",
    label: "Website",
    placeholder: "yourbusiness.com",
    imageType: "globe",
    theme: "website",
    priority: "primary",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "@yourbrand",
    imageSrc: instagramIcon,
    theme: "instagram",
    priority: "primary",
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "facebook.com/yourbrand",
    imageSrc: facebookIcon,
    theme: "facebook",
    priority: "primary",
  },
  {
    key: "googleMaps",
    label: "Google Maps",
    placeholder: "maps link or business name",
    imageSrc: googleMapsIcon,
    theme: "google-maps",
    priority: "primary",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/company/yourbrand",
    imageSrc: linkedinIcon,
    theme: "linkedin",
    priority: "primary",
  },
  {
    key: "github",
    label: "GitHub",
    placeholder: "github.com/yourbrand",
    imageSrc: githubIcon,
    theme: "github",
    priority: "secondary",
  },
  {
    key: "tiktok",
    label: "TikTok",
    placeholder: "@yourbrand",
    imageSrc: tiktokIcon,
    theme: "tiktok",
    priority: "secondary",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    placeholder: "+994 50 000 00 00",
    imageSrc: whatsappIcon,
    theme: "whatsapp",
    priority: "secondary",
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "@yourbrand",
    imageSrc: youtubeIcon,
    theme: "youtube",
    priority: "secondary",
  },
  {
    key: "note",
    label: "Short note",
    placeholder: "We mainly get orders from Instagram and WhatsApp.",
    icon: FileText,
    theme: "note",
    multiline: true,
    priority: "secondary",
  },
];

const PRIMARY_ORDER = [
  "website",
  "instagram",
  "facebook",
  "googleMaps",
  "linkedin",
  "github",
  "tiktok",
  "whatsapp",
  "youtube",
];

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

function normalizeFacebook(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;

  const handle = cleanHandle(x)
    .replace(/^facebook\.com\//i, "")
    .replace(/^fb\.com\//i, "");

  return `https://facebook.com/${handle}`;
}

function normalizeGoogleMaps(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;

  if (
    /maps\.app\.goo\.gl/i.test(x) ||
    /google\.[a-z.]+\/maps/i.test(x) ||
    /g\.co\/kgs/i.test(x)
  ) {
    return `https://${x.replace(/^https?:\/\//i, "")}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(x)}`;
}

function normalizeLinkedIn(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;

  const handle = cleanHandle(x).replace(/^linkedin\.com\//i, "");
  if (handle.includes("/")) return `https://linkedin.com/${handle}`;

  return `https://linkedin.com/company/${handle}`;
}

function normalizeGitHub(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;
  return `https://github.com/${cleanHandle(x).replace(/^github\.com\//i, "")}`;
}

function normalizeTikTok(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;

  const handle = cleanHandle(x)
    .replace(/^tiktok\.com\//i, "")
    .replace(/^@/, "");

  return `https://tiktok.com/@${handle}`;
}

function normalizeWhatsApp(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;

  const digits = x.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function normalizeYouTube(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;

  const handle = cleanHandle(x).replace(/^youtube\.com\//i, "");
  if (
    handle.startsWith("@") ||
    handle.startsWith("channel/") ||
    handle.startsWith("c/") ||
    handle.startsWith("user/")
  ) {
    return `https://youtube.com/${handle}`;
  }

  return `https://youtube.com/@${handle.replace(/^@/, "")}`;
}

function normalizeSourceKey(raw) {
  const key = s(raw).toLowerCase().replace(/[\s_-]+/g, "");

  if (key === "website") return "website";
  if (key === "instagram") return "instagram";
  if (key === "facebook") return "facebook";
  if (key === "googlemaps" || key === "maps") return "googleMaps";
  if (key === "linkedin") return "linkedin";
  if (key === "github") return "github";
  if (key === "tiktok") return "tiktok";
  if (key === "whatsapp") return "whatsapp";
  if (key === "youtube") return "youtube";

  return "";
}

function extractPlainNote(raw) {
  return s(raw).split("[studio_sources]")[0].trim();
}

function parseStudioSources(raw) {
  const out = {
    website: "",
    instagram: "",
    facebook: "",
    googleMaps: "",
    linkedin: "",
    github: "",
    tiktok: "",
    whatsapp: "",
    youtube: "",
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
    const key = normalizeSourceKey(label);

    if (!key || !value) continue;
    out[key] = value;
  }

  return out;
}

function seedSourcesFromPrimary(primary) {
  const source = s(primary);
  const url = source.toLowerCase();

  const blank = {
    website: "",
    instagram: "",
    facebook: "",
    googleMaps: "",
    linkedin: "",
    github: "",
    tiktok: "",
    whatsapp: "",
    youtube: "",
  };

  if (!url) return blank;
  if (url.includes("instagram.com")) return { ...blank, instagram: source };
  if (url.includes("facebook.com") || url.includes("fb.com")) return { ...blank, facebook: source };
  if (url.includes("google.com/maps") || url.includes("maps.app.goo.gl") || url.includes("g.co/kgs")) {
    return { ...blank, googleMaps: source };
  }
  if (url.includes("linkedin.com")) return { ...blank, linkedin: source };
  if (url.includes("github.com")) return { ...blank, github: source };
  if (url.includes("tiktok.com")) return { ...blank, tiktok: source };
  if (url.includes("wa.me") || url.includes("whatsapp")) return { ...blank, whatsapp: source };
  if (url.includes("youtube.com") || url.includes("youtu.be")) return { ...blank, youtube: source };

  return {
    ...blank,
    website: source.replace(/^https?:\/\//i, ""),
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

  if (key === "youtube") {
    const handle = cleanHandle(x)
      .replace(/^youtube\.com\//i, "")
      .replace(/^@/, "")
      .replace(/^c\//i, "")
      .replace(/^user\//i, "")
      .replace(/^channel\//i, "");

    return `@${handle}`;
  }

  if (key === "googleMaps" || key === "whatsapp") {
    return x;
  }

  return x.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function SourceMark({ item }) {
  if (item.imageType === "globe") {
    return <Globe className="setup-studio-entry__mark-icon" strokeWidth={1.9} />;
  }

  if (item.imageSrc) {
    return <img src={item.imageSrc} alt="" aria-hidden="true" className="setup-studio-entry__mark-image" />;
  }

  const Icon = item.icon;
  return <Icon className="setup-studio-entry__mark-icon" strokeWidth={1.9} />;
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
      facebook: noteSeed.facebook || primarySeed.facebook || "",
      googleMaps: noteSeed.googleMaps || primarySeed.googleMaps || "",
      linkedin: noteSeed.linkedin || primarySeed.linkedin || "",
      github: noteSeed.github || primarySeed.github || "",
      tiktok: noteSeed.tiktok || primarySeed.tiktok || "",
      whatsapp: noteSeed.whatsapp || primarySeed.whatsapp || "",
      youtube: noteSeed.youtube || primarySeed.youtube || "",
      note: extractPlainNote(discoveryForm?.note),
    }),
    [
      noteSeed.website,
      noteSeed.instagram,
      noteSeed.facebook,
      noteSeed.googleMaps,
      noteSeed.linkedin,
      noteSeed.github,
      noteSeed.tiktok,
      noteSeed.whatsapp,
      noteSeed.youtube,
      primarySeed.website,
      primarySeed.instagram,
      primarySeed.facebook,
      primarySeed.googleMaps,
      primarySeed.linkedin,
      primarySeed.github,
      primarySeed.tiktok,
      primarySeed.whatsapp,
      primarySeed.youtube,
      discoveryForm?.note,
    ]
  );

  const [activeKey, setActiveKey] = useState("website");
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [drafts, setDrafts] = useState(initialValues);
  const [sources, setSources] = useState(initialValues);

  useEffect(() => {
    setDrafts(initialValues);
    setSources(initialValues);

    const firstFilled =
      SOURCE_OPTIONS.find((item) => item.key !== "note" && s(initialValues[item.key]))?.key ||
      (s(initialValues.note) ? "note" : "website");

    setActiveKey(firstFilled);
    setSecondaryOpen(
      SOURCE_OPTIONS.some((item) => item.priority === "secondary" && s(initialValues[item.key]))
    );
  }, [initialValues]);

  const normalizedMap = useMemo(
    () => ({
      website: normalizeWebsite(sources.website),
      instagram: normalizeInstagram(sources.instagram),
      facebook: normalizeFacebook(sources.facebook),
      googleMaps: normalizeGoogleMaps(sources.googleMaps),
      linkedin: normalizeLinkedIn(sources.linkedin),
      github: normalizeGitHub(sources.github),
      tiktok: normalizeTikTok(sources.tiktok),
      whatsapp: normalizeWhatsApp(sources.whatsapp),
      youtube: normalizeYouTube(sources.youtube),
    }),
    [sources]
  );

  const addedSources = useMemo(() => {
    return PRIMARY_ORDER.map((key) => {
      const item = SOURCE_OPTIONS.find((entry) => entry.key === key);
      const url = normalizedMap[key];

      if (!item || !url) return null;

      return {
        ...item,
        url,
        value: formatSourceValue(key, sources[key]),
      };
    }).filter(Boolean);
  }, [normalizedMap, sources]);

  const primarySource = addedSources[0] || null;

  const chips = useMemo(() => {
    const out = addedSources.map((item) => ({
      key: item.key,
      label: item.label,
      value: item.value,
      imageSrc: item.imageSrc,
      imageType: item.imageType,
      theme: item.theme,
    }));

    if (s(sources.note)) {
      out.push({
        key: "note",
        label: "Note",
        value: s(sources.note).slice(0, 72),
        icon: FileText,
        theme: "note",
      });
    }

    return out;
  }, [addedSources, sources.note]);

  const composedNote = useMemo(() => {
    const noteParts = [];
    const sourceLines = addedSources.map((item) => `${item.key}: ${item.url}`);

    if (s(sources.note)) noteParts.push(s(sources.note));
    if (sourceLines.length) noteParts.push(`[studio_sources]\n${sourceLines.join("\n")}`);

    return noteParts.join("\n\n").trim();
  }, [addedSources, sources.note]);

  useEffect(() => {
    onSetDiscoveryField("websiteUrl", primarySource?.url || "");
    onSetDiscoveryField("note", composedNote);
  }, [primarySource?.url, composedNote, onSetDiscoveryField]);

  const activeSource =
    SOURCE_OPTIONS.find((item) => item.key === activeKey) || SOURCE_OPTIONS[0];

  const activeDraft = drafts[activeKey] || "";
  const primaryPills = SOURCE_OPTIONS.filter((item) => item.priority === "primary");
  const secondaryPills = SOURCE_OPTIONS.filter((item) => item.priority === "secondary");

  function handleDraftChange(value) {
    setDrafts((prev) => ({ ...prev, [activeKey]: value }));
  }

  function handleAddSource() {
    const value = s(drafts[activeKey]);
    if (!value) return;

    setSources((prev) => ({
      ...prev,
      [activeKey]: value,
    }));
  }

  function handleRemoveSource(key) {
    setSources((prev) => ({ ...prev, [key]: "" }));
    setDrafts((prev) => ({ ...prev, [key]: "" }));

    if (activeKey === key) {
      setActiveKey("website");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!primarySource?.url || importingWebsite) return;
    onScanBusiness?.(e);
  }

  function handleInputKeyDown(e) {
    if (activeSource.multiline) return;
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSource();
    }
  }

  function getButtonLabel() {
    if (activeSource.key === "note") return "Add";
    return sources[activeKey] ? "Update" : "Add";
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-entry"
    >
      <div className="setup-studio-entry__hero">
        <h1 className="setup-studio-entry__title">Add your business sources.</h1>

        <p className="setup-studio-entry__subtitle">
          Mention places where your business already exists. We’ll use the first valid source as the
          main one and build the rest in as context.
        </p>
      </div>

      <div className="setup-studio-entry__pill-rail">
        {primaryPills.map((item) => (
          <button
            key={item.key}
            type="button"
            className={[
              "setup-studio-entry__pill",
              `theme-${item.theme}`,
              activeKey === item.key ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setActiveKey(item.key)}
          >
            <span className="setup-studio-entry__pill-mark">
              <SourceMark item={item} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}

        <button
          type="button"
          className={`setup-studio-entry__pill setup-studio-entry__pill--more ${secondaryOpen ? "is-open" : ""}`}
          onClick={() => setSecondaryOpen((prev) => !prev)}
          aria-label="More sources"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {secondaryOpen ? (
        <div className="setup-studio-entry__secondary-rail">
          {secondaryPills.map((item) => (
            <button
              key={item.key}
              type="button"
              className={[
                "setup-studio-entry__secondary-pill",
                `theme-${item.theme}`,
                activeKey === item.key ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActiveKey(item.key)}
            >
              <span className="setup-studio-entry__pill-mark">
                <SourceMark item={item} />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className={`setup-studio-entry__composer theme-${activeSource.theme}`}>
        <div className="setup-studio-entry__composer-main">
          <div className="setup-studio-entry__composer-left">
            <span className="setup-studio-entry__composer-mark">
              <SourceMark item={activeSource} />
            </span>

            {activeSource.multiline ? (
              <textarea
                value={activeDraft}
                onChange={(e) => handleDraftChange(e.target.value)}
                className="setup-studio-entry__textarea"
                placeholder={activeSource.placeholder}
              />
            ) : (
              <input
                value={activeDraft}
                onChange={(e) => handleDraftChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="setup-studio-entry__input"
                placeholder={activeSource.placeholder}
                autoComplete="off"
                spellCheck={false}
              />
            )}
          </div>

          <button
            type="button"
            className="setup-studio-entry__add"
            onClick={handleAddSource}
            disabled={!s(activeDraft)}
          >
            {!sources[activeKey] ? <Plus className="h-4 w-4" /> : null}
            <span>{getButtonLabel()}</span>
          </button>
        </div>
      </div>

      <div className="setup-studio-entry__chips">
        {chips.map((chip) => (
          <div key={chip.key} className={`setup-studio-entry__chip theme-${chip.theme}`}>
            <span className="setup-studio-entry__chip-mark">
              {chip.imageType === "globe" ? (
                <Globe className="setup-studio-entry__chip-icon" strokeWidth={1.9} />
              ) : chip.imageSrc ? (
                <img
                  src={chip.imageSrc}
                  alt=""
                  aria-hidden="true"
                  className="setup-studio-entry__chip-logo"
                />
              ) : (
                <FileText className="setup-studio-entry__chip-icon" strokeWidth={1.9} />
              )}
            </span>

            <span className="setup-studio-entry__chip-text">
              <strong>{chip.label}</strong>
              <span>{chip.value}</span>
            </span>

            <button
              type="button"
              className="setup-studio-entry__chip-remove"
              onClick={() => handleRemoveSource(chip.key)}
              aria-label={`Remove ${chip.label}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="setup-studio-entry__bottom">
        <div className="setup-studio-entry__primary">
          {primarySource ? (
            <>
              <span className="setup-studio-entry__primary-label">Primary source:</span>
              <span className="setup-studio-entry__primary-value">{primarySource.label}</span>
            </>
          ) : (
            <span className="setup-studio-entry__primary-empty">Add one source to continue</span>
          )}
        </div>

        <button
          type="submit"
          disabled={importingWebsite || !primarySource?.url}
          className="setup-studio-entry__submit"
        >
          {importingWebsite ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing
            </>
          ) : (
            <>
              Analyze business
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {error ? <div className="setup-studio-entry__error">{error}</div> : null}
    </motion.form>
  );
}