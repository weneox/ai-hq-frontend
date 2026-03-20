import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Link2,
  Loader2,
  Plus,
} from "lucide-react";

import websiteIcon from "../../../assets/setup-studio/channels/weblink.webp";
import instagramIcon from "../../../assets/setup-studio/channels/instagram.svg";
import facebookIcon from "../../../assets/setup-studio/channels/facebook.svg";
import googleMapsIcon from "../../../assets/setup-studio/channels/google-maps.svg";
import linkedinIcon from "../../../assets/setup-studio/channels/linkedin.svg";
import tiktokIcon from "../../../assets/setup-studio/channels/tiktok.svg";
import youtubeIcon from "../../../assets/setup-studio/channels/youtube.svg";

const SOURCE_OPTIONS = [
  {
    key: "website",
    apiSourceType: "website",
    label: "Website",
    placeholder: "yourbusiness.com",
    imageSrc: websiteIcon,
    theme: "website",
    priority: "primary",
    actionLabel: "Add",
    canStartScan: true,
  },
  {
    key: "instagram",
    apiSourceType: "instagram",
    label: "Instagram",
    placeholder: "@yourbrand",
    imageSrc: instagramIcon,
    theme: "instagram",
    priority: "primary",
    actionLabel: "Connect",
    canStartScan: false,
  },
  {
    key: "facebook",
    apiSourceType: "facebook",
    label: "Facebook",
    placeholder: "facebook.com/yourbrand",
    imageSrc: facebookIcon,
    theme: "facebook",
    priority: "primary",
    actionLabel: "Connect",
    canStartScan: false,
  },
  {
    key: "googleMaps",
    apiSourceType: "google_maps",
    label: "Google Maps",
    placeholder: "maps link or business name",
    imageSrc: googleMapsIcon,
    theme: "google-maps",
    priority: "primary",
    actionLabel: "Add",
    canStartScan: true,
  },
  {
    key: "linkedin",
    apiSourceType: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/company/yourbrand",
    imageSrc: linkedinIcon,
    theme: "linkedin",
    priority: "primary",
    actionLabel: "Connect",
    canStartScan: false,
  },
  {
    key: "tiktok",
    apiSourceType: "tiktok",
    label: "TikTok",
    placeholder: "@yourbrand",
    imageSrc: tiktokIcon,
    theme: "tiktok",
    priority: "secondary",
    actionLabel: "Connect",
    canStartScan: false,
  },
  {
    key: "youtube",
    apiSourceType: "youtube",
    label: "YouTube",
    placeholder: "@yourbrand",
    imageSrc: youtubeIcon,
    theme: "youtube",
    priority: "secondary",
    actionLabel: "Connect",
    canStartScan: false,
  },
];

const SOURCE_KEYS = SOURCE_OPTIONS.map((item) => item.key);

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

function normalizeTikTok(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;

  const handle = cleanHandle(x)
    .replace(/^tiktok\.com\//i, "")
    .replace(/^@/, "");

  return `https://tiktok.com/@${handle}`;
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
  if (key === "tiktok") return "tiktok";
  if (key === "youtube") return "youtube";

  return "";
}

function extractPlainNote(raw) {
  const text = s(raw);
  const primaryIdx = text.indexOf("[studio_primary]");
  const sourcesIdx = text.indexOf("[studio_sources]");

  let cutIndex = -1;
  if (primaryIdx >= 0 && sourcesIdx >= 0) cutIndex = Math.min(primaryIdx, sourcesIdx);
  else cutIndex = Math.max(primaryIdx, sourcesIdx);

  if (cutIndex === -1) return text.trim();
  return text.slice(0, cutIndex).trim();
}

function parseStudioSources(raw) {
  const out = {
    website: "",
    instagram: "",
    facebook: "",
    googleMaps: "",
    linkedin: "",
    tiktok: "",
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

function parseStudioPrimary(raw) {
  const text = s(raw);
  const marker = "[studio_primary]";
  const idx = text.indexOf(marker);

  if (idx === -1) {
    return {
      sourceType: "",
      url: "",
    };
  }

  const block = text.slice(idx + marker.length).trim();
  const out = {
    sourceType: "",
    url: "",
  };

  for (const line of block.split(/\r?\n/)) {
    const [label, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const key = s(label).toLowerCase();

    if (key === "sourcetype") out.sourceType = value;
    if (key === "url") out.url = value;
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
    tiktok: "",
    youtube: "",
  };

  if (!url) return blank;
  if (url.includes("instagram.com")) return { ...blank, instagram: source };
  if (url.includes("facebook.com") || url.includes("fb.com")) return { ...blank, facebook: source };
  if (url.includes("google.com/maps") || url.includes("maps.app.goo.gl") || url.includes("g.co/kgs")) {
    return { ...blank, googleMaps: source };
  }
  if (url.includes("linkedin.com")) return { ...blank, linkedin: source };
  if (url.includes("tiktok.com")) return { ...blank, tiktok: source };
  if (url.includes("youtube.com") || url.includes("youtu.be")) return { ...blank, youtube: source };

  return {
    ...blank,
    website: source.replace(/^https?:\/\//i, ""),
  };
}

function detectPrimaryKey(raw) {
  const url = s(raw).toLowerCase();
  if (!url) return "";

  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("facebook.com") || url.includes("fb.com")) return "facebook";
  if (url.includes("google.com/maps") || url.includes("maps.app.goo.gl") || url.includes("g.co/kgs")) {
    return "googleMaps";
  }
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";

  return "website";
}

function buildInitialSourceOrder(values, primaryUrl, primarySourceType = "") {
  const filled = SOURCE_KEYS.filter((key) => s(values[key]));
  if (!filled.length) return [];

  const normalizedPrimaryType = normalizeSourceKey(primarySourceType);
  const primaryKey = normalizedPrimaryType || detectPrimaryKey(primaryUrl);

  if (!primaryKey || !filled.includes(primaryKey)) return filled;

  return [primaryKey, ...filled.filter((key) => key !== primaryKey)];
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

  if (key === "googleMaps") {
    return x;
  }

  return x.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function SourceMark({ item, className = "" }) {
  return (
    <img
      src={item.imageSrc}
      alt=""
      aria-hidden="true"
      className={className || "setup-studio-intake__source-image"}
    />
  );
}

const cardVariants = {
  hidden: { opacity: 0, x: -26, y: 18, scale: 0.98, filter: "blur(8px)" },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.52,
      delay: 0.12 + index * 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

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

  const primaryMetaSeed = useMemo(
    () => parseStudioPrimary(discoveryForm?.note),
    [discoveryForm?.note]
  );

  const plainNote = useMemo(
    () => extractPlainNote(discoveryForm?.note),
    [discoveryForm?.note]
  );

  const initialValues = useMemo(
    () => ({
      website: noteSeed.website || primarySeed.website || "",
      instagram: noteSeed.instagram || primarySeed.instagram || "",
      facebook: noteSeed.facebook || primarySeed.facebook || "",
      googleMaps: noteSeed.googleMaps || primarySeed.googleMaps || "",
      linkedin: noteSeed.linkedin || primarySeed.linkedin || "",
      tiktok: noteSeed.tiktok || primarySeed.tiktok || "",
      youtube: noteSeed.youtube || primarySeed.youtube || "",
    }),
    [
      noteSeed.website,
      noteSeed.instagram,
      noteSeed.facebook,
      noteSeed.googleMaps,
      noteSeed.linkedin,
      noteSeed.tiktok,
      noteSeed.youtube,
      primarySeed.website,
      primarySeed.instagram,
      primarySeed.facebook,
      primarySeed.googleMaps,
      primarySeed.linkedin,
      primarySeed.tiktok,
      primarySeed.youtube,
    ]
  );

  const initialOrder = useMemo(
    () =>
      buildInitialSourceOrder(
        initialValues,
        primaryMetaSeed.url || discoveryForm?.websiteUrl,
        primaryMetaSeed.sourceType
      ),
    [initialValues, primaryMetaSeed.url, primaryMetaSeed.sourceType, discoveryForm?.websiteUrl]
  );

  const [activeKey, setActiveKey] = useState("website");
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [drafts, setDrafts] = useState(initialValues);
  const [sources, setSources] = useState(initialValues);
  const [sourceOrder, setSourceOrder] = useState(initialOrder);

  useEffect(() => {
    setDrafts(initialValues);
    setSources(initialValues);
    setSourceOrder(initialOrder);

    const firstFilled =
      initialOrder[0] ||
      SOURCE_OPTIONS.find((item) => s(initialValues[item.key]))?.key ||
      "website";

    setActiveKey(firstFilled);
    setSecondaryOpen(
      SOURCE_OPTIONS.some((item) => item.priority === "secondary" && s(initialValues[item.key]))
    );
  }, [initialValues, initialOrder]);

  const normalizedMap = useMemo(
    () => ({
      website: normalizeWebsite(sources.website),
      instagram: normalizeInstagram(sources.instagram),
      facebook: normalizeFacebook(sources.facebook),
      googleMaps: normalizeGoogleMaps(sources.googleMaps),
      linkedin: normalizeLinkedIn(sources.linkedin),
      tiktok: normalizeTikTok(sources.tiktok),
      youtube: normalizeYouTube(sources.youtube),
    }),
    [sources]
  );

  const addedSourceKeys = useMemo(() => {
    const ordered = [...sourceOrder, ...SOURCE_KEYS];
    return [...new Set(ordered)].filter((key) => s(normalizedMap[key]));
  }, [sourceOrder, normalizedMap]);

  const addedSources = useMemo(() => {
    return addedSourceKeys
      .map((key) => {
        const item = SOURCE_OPTIONS.find((entry) => entry.key === key);
        if (!item) return null;

        return {
          ...item,
          url: normalizedMap[key],
          value: formatSourceValue(key, sources[key]),
        };
      })
      .filter(Boolean);
  }, [addedSourceKeys, normalizedMap, sources]);

  const primaryScannableSource = useMemo(() => {
    return addedSources.find((item) => item.canStartScan) || null;
  }, [addedSources]);

  const canAnalyze = !!primaryScannableSource?.url && !importingWebsite;

  const primaryScanUrl = s(primaryScannableSource?.url);
  const primaryScanType = s(primaryScannableSource?.apiSourceType);

  const composedNote = useMemo(() => {
    const parts = [];
    const sourceLines = addedSources.map((item) => `${item.key}: ${item.url}`);

    if (plainNote) {
      parts.push(plainNote);
    }

    if (primaryScannableSource?.apiSourceType && primaryScannableSource?.url) {
      parts.push(
        [
          "[studio_primary]",
          `sourceType: ${primaryScannableSource.apiSourceType}`,
          `url: ${primaryScannableSource.url}`,
        ].join("\n")
      );
    }

    if (sourceLines.length) {
      parts.push(`[studio_sources]\n${sourceLines.join("\n")}`);
    }

    return parts.join("\n\n").trim();
  }, [addedSources, plainNote, primaryScannableSource]);

  useEffect(() => {
    const nextPrimaryUrl = primaryScanUrl;
    const nextNote = composedNote;
    const currentPrimaryUrl = s(discoveryForm?.websiteUrl);
    const currentNote = s(discoveryForm?.note);

    if (currentPrimaryUrl !== nextPrimaryUrl) {
      onSetDiscoveryField("websiteUrl", nextPrimaryUrl);
    }

    if (currentNote !== nextNote) {
      onSetDiscoveryField("note", nextNote);
    }
  }, [
    primaryScanUrl,
    composedNote,
    discoveryForm?.websiteUrl,
    discoveryForm?.note,
    onSetDiscoveryField,
  ]);

  const activeSource =
    SOURCE_OPTIONS.find((item) => item.key === activeKey) || SOURCE_OPTIONS[0];

  const activeDraft = drafts[activeKey] || "";
  const primarySources = SOURCE_OPTIONS.filter((item) => item.priority === "primary");
  const secondarySources = SOURCE_OPTIONS.filter((item) => item.priority === "secondary");

  function handlePickSource(key) {
    setActiveKey(key);
  }

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

    setSourceOrder((prev) => (prev.includes(activeKey) ? prev : [...prev, activeKey]));
  }

  function handleRemoveSource(key) {
    setSources((prev) => ({ ...prev, [key]: "" }));
    setDrafts((prev) => ({ ...prev, [key]: "" }));
    setSourceOrder((prev) => prev.filter((item) => item !== key));

    if (activeKey === key) {
      setActiveKey("website");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canAnalyze) return;

    onScanBusiness?.({
      sourceType: primaryScanType,
      url: primaryScanUrl,
      note: composedNote,
      sources: addedSources.map((item) => ({
        key: item.key,
        sourceType: item.apiSourceType,
        url: item.url,
        value: item.value,
      })),
      primarySource: primaryScannableSource,
    });
  }

  function handleInputKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSource();
    }
  }

  function getActionLabel() {
    if (sources[activeKey]) return "Update";
    return activeSource.actionLabel || "Add";
  }

  function isSourceAdded(key) {
    return !!s(sources[key]);
  }

  const dockNote = primaryScannableSource
    ? primaryScannableSource.key === "website"
      ? "Website will be used for the first scan. Other connected sources are attached as context."
      : "Google Maps will be used for the first scan. Other connected sources are attached as context."
    : "Add a Website or Google Maps source to start the first scan. Other sources can already be attached as context.";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-intake"
    >
      <div className="setup-studio-intake__hero">
        <div className="setup-studio-intake__eyebrow">Source setup</div>
        <h1 className="setup-studio-intake__title">Connect what already exists</h1>
        <p className="setup-studio-intake__subtitle">
          Start with your public business sources, then analyze everything we can find.
        </p>
      </div>

      <div className="setup-studio-intake__cards">
        {primarySources.map((item, index) => (
          <motion.button
            key={item.key}
            type="button"
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={[
              "setup-studio-intake__card",
              `theme-${item.theme}`,
              activeKey === item.key ? "is-active" : "",
              isSourceAdded(item.key) ? "is-added" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => handlePickSource(item.key)}
          >
            <div className="setup-studio-intake__card-top">
              <SourceMark item={item} />
              <span className={`setup-studio-intake__card-badge ${isSourceAdded(item.key) ? "is-live" : ""}`}>
                {isSourceAdded(item.key) ? "Added" : "Select"}
              </span>
            </div>

            <div className="setup-studio-intake__card-main">
              <div className="setup-studio-intake__card-label">{item.label}</div>
              <div className="setup-studio-intake__card-value">
                {isSourceAdded(item.key)
                  ? formatSourceValue(item.key, sources[item.key])
                  : item.actionLabel}
              </div>
            </div>
          </motion.button>
        ))}

        <motion.button
          type="button"
          custom={primarySources.length}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className={`setup-studio-intake__card setup-studio-intake__card--more ${secondaryOpen ? "is-open" : ""}`}
          onClick={() => setSecondaryOpen((prev) => !prev)}
        >
          <div className="setup-studio-intake__card-top">
            <div className="setup-studio-intake__more-mark">+</div>
            <span className="setup-studio-intake__card-badge">Optional</span>
          </div>

          <div className="setup-studio-intake__card-main">
            <div className="setup-studio-intake__card-label">More sources</div>
            <div className="setup-studio-intake__card-value">TikTok · YouTube</div>
          </div>

          <ChevronDown className={`setup-studio-intake__more-arrow ${secondaryOpen ? "is-open" : ""}`} />
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {secondaryOpen ? (
          <motion.div
            className="setup-studio-intake__secondary"
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {secondarySources.map((item, index) => (
              <motion.button
                key={item.key}
                type="button"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.32, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className={[
                  "setup-studio-intake__secondary-item",
                  `theme-${item.theme}`,
                  activeKey === item.key ? "is-active" : "",
                  isSourceAdded(item.key) ? "is-added" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handlePickSource(item.key)}
              >
                <SourceMark item={item} className="setup-studio-intake__secondary-image" />
                <span>{item.label}</span>
                {isSourceAdded(item.key) ? <Check className="setup-studio-intake__secondary-check" /> : null}
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className={`setup-studio-intake__dock theme-${activeSource.theme}`}
        layout
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="setup-studio-intake__dock-head">
          <div className="setup-studio-intake__dock-source">
            <SourceMark item={activeSource} className="setup-studio-intake__dock-image" />
            <div className="setup-studio-intake__dock-meta">
              <span className="setup-studio-intake__dock-label">{activeSource.label}</span>
              <span className="setup-studio-intake__dock-state">
                {isSourceAdded(activeKey) ? "Connected" : "Ready to connect"}
              </span>
            </div>
          </div>

          <div className="setup-studio-intake__dock-hint">
            <Link2 className="h-4 w-4" />
            <span>Handle or link</span>
          </div>
        </div>

        <div className="setup-studio-intake__dock-input-row">
          <input
            value={activeDraft}
            onChange={(e) => handleDraftChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="setup-studio-intake__input"
            placeholder={activeSource.placeholder}
            autoComplete="off"
            spellCheck={false}
          />

          <button
            type="button"
            className="setup-studio-intake__add"
            onClick={handleAddSource}
            disabled={!s(activeDraft)}
          >
            {!sources[activeKey] ? <Plus className="h-4 w-4" /> : null}
            <span>{getActionLabel()}</span>
          </button>
        </div>

        <div className="setup-studio-intake__dock-footer">
          <div className="setup-studio-intake__selected">
            <AnimatePresence initial={false}>
              {addedSources.map((item) => (
                <motion.div
                  key={item.key}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className={`setup-studio-intake__selected-item theme-${item.theme}`}
                >
                  <SourceMark item={item} className="setup-studio-intake__selected-image" />
                  <span className="setup-studio-intake__selected-name">{item.label}</span>
                  <span className="setup-studio-intake__selected-value">{item.value}</span>

                  <button
                    type="button"
                    className="setup-studio-intake__selected-remove"
                    onClick={() => handleRemoveSource(item.key)}
                    aria-label={`Remove ${item.label}`}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={!canAnalyze}
            className="setup-studio-intake__submit"
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

        <div className="setup-studio-intake__dock-note">{dockNote}</div>
      </motion.div>

      {error ? <div className="setup-studio-intake__error">{error}</div> : null}
    </motion.form>
  );
}