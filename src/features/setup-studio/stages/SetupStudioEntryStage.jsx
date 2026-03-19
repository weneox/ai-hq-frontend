import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";

import websiteIcon from "../../../assets/setup-studio/channels/weblink.webp";
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
    hint: "Domain or website link",
    placeholder: "yourbusiness.com",
    imageSrc: websiteIcon,
    theme: "website",
    recommended: true,
    priority: "primary",
  },
  {
    key: "instagram",
    label: "Instagram",
    hint: "Handle or profile link",
    placeholder: "@yourbrand",
    imageSrc: instagramIcon,
    theme: "instagram",
    priority: "primary",
  },
  {
    key: "facebook",
    label: "Facebook",
    hint: "Page link or page name",
    placeholder: "facebook.com/yourbrand",
    imageSrc: facebookIcon,
    theme: "facebook",
    priority: "primary",
  },
  {
    key: "googleMaps",
    label: "Google Maps",
    hint: "Listing link or business name",
    placeholder: "maps.app.goo.gl/... or your business name",
    imageSrc: googleMapsIcon,
    theme: "google-maps",
    priority: "primary",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    hint: "Company page link",
    placeholder: "linkedin.com/company/yourbrand",
    imageSrc: linkedinIcon,
    theme: "linkedin",
    priority: "primary",
  },
  {
    key: "github",
    label: "GitHub",
    hint: "Organization or profile link",
    placeholder: "github.com/yourbrand",
    imageSrc: githubIcon,
    theme: "github",
    priority: "secondary",
  },
  {
    key: "tiktok",
    label: "TikTok",
    hint: "Handle or profile link",
    placeholder: "@yourbrand",
    imageSrc: tiktokIcon,
    theme: "tiktok",
    priority: "secondary",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    hint: "Number or wa.me link",
    placeholder: "+994 50 000 00 00",
    imageSrc: whatsappIcon,
    theme: "whatsapp",
    priority: "secondary",
  },
  {
    key: "youtube",
    label: "YouTube",
    hint: "Channel or handle",
    placeholder: "@yourbrand",
    imageSrc: youtubeIcon,
    theme: "youtube",
    priority: "secondary",
  },
  {
    key: "note",
    label: "Short note",
    hint: "Extra business context",
    placeholder: "We mainly sell custom cakes and take most orders from Instagram and WhatsApp.",
    icon: FileText,
    theme: "note",
    multiline: true,
    priority: "secondary",
  },
];

const PRIMARY_SOURCE_ORDER = [
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

  if (handle.includes("/")) {
    return `https://linkedin.com/${handle}`;
  }

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
  if (handle.startsWith("@")) return `https://youtube.com/${handle}`;

  if (
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

  if (key === "facebook") {
    return x.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }

  if (key === "googleMaps") {
    return s(raw);
  }

  if (key === "linkedin") {
    return x.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }

  if (key === "github") {
    return x.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }

  if (key === "whatsapp") {
    return s(raw);
  }

  return x;
}

function SourceMark({ item, className = "" }) {
  if (item.imageSrc) {
    return (
      <img
        src={item.imageSrc}
        alt=""
        aria-hidden="true"
        className={`setup-studio-source-mark ${className}`.trim()}
      />
    );
  }

  const Icon = item.icon;
  return <Icon className={`h-4 w-4 ${className}`.trim()} />;
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
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);

    const firstFilled =
      SOURCE_OPTIONS.find((item) => item.key !== "note" && s(initialValues[item.key]))?.key ||
      (s(initialValues.note) ? "note" : "website");

    setActiveKey(firstFilled);
    setSecondaryOpen(
      SOURCE_OPTIONS.some(
        (item) => item.priority === "secondary" && item.key !== "note" && s(initialValues[item.key])
      ) || s(initialValues.note)
    );
  }, [initialValues]);

  const normalizedMap = useMemo(
    () => ({
      website: normalizeWebsite(values.website),
      instagram: normalizeInstagram(values.instagram),
      facebook: normalizeFacebook(values.facebook),
      googleMaps: normalizeGoogleMaps(values.googleMaps),
      linkedin: normalizeLinkedIn(values.linkedin),
      github: normalizeGitHub(values.github),
      tiktok: normalizeTikTok(values.tiktok),
      whatsapp: normalizeWhatsApp(values.whatsapp),
      youtube: normalizeYouTube(values.youtube),
    }),
    [values]
  );

  const addedSourceList = useMemo(() => {
    return PRIMARY_SOURCE_ORDER.map((key) => {
      const item = SOURCE_OPTIONS.find((entry) => entry.key === key);
      const url = normalizedMap[key];

      if (!item || !url) return null;

      return {
        ...item,
        url,
        value: formatSourceValue(key, values[key]),
      };
    }).filter(Boolean);
  }, [normalizedMap, values]);

  const primarySource = addedSourceList[0] || null;
  const supportCount = Math.max(0, addedSourceList.length - (primarySource ? 1 : 0));
  const hasContextNote = !!s(values.note);

  const composedNote = useMemo(() => {
    const noteParts = [];
    const sourceLines = addedSourceList.map((item) => `${item.key}: ${item.url}`);

    if (s(values.note)) noteParts.push(s(values.note));
    if (sourceLines.length) noteParts.push(`[studio_sources]\n${sourceLines.join("\n")}`);

    return noteParts.join("\n\n").trim();
  }, [addedSourceList, values.note]);

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

  const activeSource =
    SOURCE_OPTIONS.find((item) => item.key === activeKey) || SOURCE_OPTIONS[0];

  const activeValue = values[activeKey] || "";

  const primaryOptions = SOURCE_OPTIONS.filter((item) => item.priority === "primary");
  const secondaryOptions = SOURCE_OPTIONS.filter((item) => item.priority === "secondary");

  return (
    <motion.form
      onSubmit={onScanBusiness}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="setup-studio-entry"
    >
      <section className="setup-studio-entry__intro">
        <div className="setup-studio-entry__eyebrow">Business setup</div>

        <h1 className="setup-studio-entry__title">Give us a starting point.</h1>

        <p className="setup-studio-entry__copy">
          Add the first real places that describe the business. We’ll use the first valid source as
          the primary one and pull the rest in as context.
        </p>

        <div className="setup-studio-entry__signal">
          <div className="setup-studio-entry__signal-core">Business profile</div>

          <div className="setup-studio-entry__signal-node setup-studio-entry__signal-node--website theme-website">
            <SourceMark item={SOURCE_OPTIONS[0]} />
          </div>

          <div className="setup-studio-entry__signal-node setup-studio-entry__signal-node--instagram theme-instagram">
            <SourceMark item={SOURCE_OPTIONS[1]} />
          </div>

          <div className="setup-studio-entry__signal-node setup-studio-entry__signal-node--maps theme-google-maps">
            <SourceMark item={SOURCE_OPTIONS[3]} />
          </div>

          <div className="setup-studio-entry__signal-node setup-studio-entry__signal-node--linkedin theme-linkedin">
            <SourceMark item={SOURCE_OPTIONS[4]} />
          </div>
        </div>
      </section>

      <section className="setup-studio-entry__workspace">
        <div className="setup-studio-entry__heading">
          <div className="setup-studio-entry__heading-kicker">Main sources</div>
          <div className="setup-studio-entry__heading-meta">Website is recommended, not required.</div>
        </div>

        <div className="setup-studio-entry__primary-grid">
          {primaryOptions.map((item) => {
            const isActive = activeKey === item.key;
            const isAdded = getStatus(item) === "added";

            return (
              <button
                key={item.key}
                type="button"
                className={[
                  "setup-studio-entry__source",
                  `theme-${item.theme}`,
                  item.key === "website" ? "is-main" : "",
                  isActive ? "is-active" : "",
                  isAdded ? "is-added" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveKey(item.key)}
              >
                <span className="setup-studio-entry__source-icon">
                  <SourceMark item={item} />
                </span>

                <span className="setup-studio-entry__source-copy">
                  <span className="setup-studio-entry__source-topline">
                    <span className="setup-studio-entry__source-title">{item.label}</span>
                    {item.recommended ? (
                      <span className="setup-studio-entry__source-badge">Recommended</span>
                    ) : null}
                  </span>

                  <span className="setup-studio-entry__source-hint">{item.hint}</span>
                </span>

                {isAdded ? (
                  <span className="setup-studio-entry__source-state">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="setup-studio-entry__secondary">
          <button
            type="button"
            className={`setup-studio-entry__secondary-toggle ${secondaryOpen ? "is-open" : ""}`}
            onClick={() => setSecondaryOpen((prev) => !prev)}
          >
            <span className="setup-studio-entry__secondary-toggle-left">
              <Plus className="h-4 w-4" />
              <span>Add another source</span>
            </span>

            {secondaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {secondaryOpen ? (
            <div className="setup-studio-entry__secondary-grid">
              {secondaryOptions.map((item) => {
                const isActive = activeKey === item.key;
                const isAdded = getStatus(item) === "added";

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={[
                      "setup-studio-entry__secondary-source",
                      `theme-${item.theme}`,
                      isActive ? "is-active" : "",
                      isAdded ? "is-added" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setActiveKey(item.key)}
                  >
                    <span className="setup-studio-entry__secondary-source-icon">
                      <SourceMark item={item} />
                    </span>

                    <span className="setup-studio-entry__secondary-source-label">{item.label}</span>

                    {isAdded ? (
                      <span className="setup-studio-entry__secondary-source-state">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className={`setup-studio-entry__composer theme-${activeSource.theme}`}>
          <div className="setup-studio-entry__composer-head">
            <div className="setup-studio-entry__composer-source">
              <span className="setup-studio-entry__composer-icon">
                <SourceMark item={activeSource} />
              </span>

              <div className="setup-studio-entry__composer-copy">
                <div className="setup-studio-entry__composer-title">{activeSource.label}</div>
                <div className="setup-studio-entry__composer-hint">{activeSource.hint}</div>
              </div>
            </div>
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
              value={activeValue}
              onChange={(e) => setValue(activeKey, e.target.value)}
              className="setup-studio-entry__input"
              placeholder={activeSource.placeholder}
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </div>

        <div className="setup-studio-entry__footer">
          <div className="setup-studio-entry__summary">
            <div className="setup-studio-entry__summary-kicker">Primary source</div>

            {primarySource ? (
              <div className="setup-studio-entry__summary-value">{primarySource.value}</div>
            ) : (
              <div className="setup-studio-entry__summary-value is-empty">
                Add one real source to continue
              </div>
            )}

            {primarySource ? (
              <div className="setup-studio-entry__summary-meta">
                {supportCount > 0
                  ? `${supportCount} supporting source${supportCount > 1 ? "s" : ""}`
                  : "No supporting sources yet"}
                {hasContextNote ? " · note added" : ""}
              </div>
            ) : null}
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
      </section>
    </motion.form>
  );
}