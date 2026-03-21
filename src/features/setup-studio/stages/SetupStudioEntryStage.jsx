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

function arr(v) {
  return Array.isArray(v) ? v : [];
}

function obj(v) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

function n(v, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function truncateText(value = "", max = 180) {
  const x = s(value);
  if (!x) return "";
  if (x.length <= max) return x;
  return `${x.slice(0, max - 1)}…`;
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

function normalizeAnalysisRows(rows = []) {
  return arr(rows)
    .map((item) => {
      if (Array.isArray(item)) {
        return {
          label: s(item[0]),
          value: s(item[1]),
        };
      }

      const x = obj(item);
      return {
        label: s(x.label || x.key || x.title || x.name),
        value: s(x.value || x.text || x.description || x.content),
      };
    })
    .filter((item) => item.label || item.value);
}

function SourceMark({ item, className = "" }) {
  return (
    <img
      src={item.imageSrc}
      alt=""
      aria-hidden="true"
      className={className || "h-8 w-8 rounded-xl object-contain"}
    />
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label || "Field"}
      </div>
      <div className="mt-1.5 break-words text-sm leading-6 text-slate-700">
        {value || "—"}
      </div>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      delay: 0.05 + index * 0.04,
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

  hasAnalysis = false,
  analysisLoading = false,
  analysisSourceLabel = "",
  analysisUrl = "",
  analysisTitle = "",
  analysisDescription = "",
  analysisMessage = "",
  analysisWarnings = [],
  analysisProfileRows = [],
  analysisKnowledgeCount = 0,
  analysisServiceCount = 0,
  analysisSourceCount = 0,
  analysisEventCount = 0,
  analysisReviewStatusLabel = "",
  analysisReviewSources = [],
  analysisReviewEvents = [],
  onOpenRefine,
  onOpenKnowledge,
  onContinueFlow,
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

  const safeAnalysisWarnings = arr(analysisWarnings).filter(Boolean);
  const normalizedAnalysisRows = useMemo(
    () => normalizeAnalysisRows(analysisProfileRows),
    [analysisProfileRows]
  );
  const firstReviewSource = obj(arr(analysisReviewSources)[0]);
  const firstReviewEvent = obj(arr(analysisReviewEvents)[0]);

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

  const shouldShowResults = analysisLoading || hasAnalysis;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-[1520px] flex-col gap-5"
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center gap-3 pt-1 text-center">
        <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm sm:text-[12px]">
          Source setup
        </div>

        <h1 className="max-w-[1180px] text-[clamp(36px,5.6vw,72px)] font-semibold leading-[0.9] tracking-[-0.065em] text-slate-950">
          Connect what already exists
        </h1>

        <p className="max-w-[760px] text-[15px] leading-7 text-slate-500 sm:text-[17px] sm:leading-8">
          Start with your public business sources, then analyze everything we can find.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {primarySources.map((item, index) => (
          <motion.button
            key={item.key}
            type="button"
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`group relative min-h-[154px] rounded-[24px] border bg-white/80 p-4 text-left shadow-[0_14px_36px_rgba(15,23,42,.05)] backdrop-blur transition-all duration-200 ${
              activeKey === item.key
                ? "border-slate-300 ring-2 ring-blue-200/60"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => handlePickSource(item.key)}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <SourceMark item={item} className="h-9 w-9 rounded-xl object-contain" />
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${
                  isSourceAdded(item.key)
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {isSourceAdded(item.key) ? "Added" : "Select"}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-[17px] font-semibold text-slate-900">{item.label}</div>
              <div className="min-h-[20px] text-sm text-slate-500">
                {isSourceAdded(item.key)
                  ? formatSourceValue(item.key, sources[item.key])
                  : item.actionLabel}
              </div>
            </div>

            <div
              className={`mt-4 h-[3px] rounded-full transition-all ${
                activeKey === item.key ? "bg-blue-500" : "bg-transparent"
              }`}
            />
          </motion.button>
        ))}

        <motion.button
          type="button"
          custom={primarySources.length}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className={`group relative min-h-[154px] rounded-[24px] border border-slate-200 bg-white/80 p-4 text-left shadow-[0_14px_36px_rgba(15,23,42,.05)] backdrop-blur transition-all duration-200 hover:border-slate-300 ${
            secondaryOpen ? "ring-2 ring-blue-200/60" : ""
          }`}
          onClick={() => setSecondaryOpen((prev) => !prev)}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-2xl leading-none text-slate-900">
              +
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              Optional
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-[17px] font-semibold text-slate-900">More sources</div>
            <div className="text-sm text-slate-500">TikTok · YouTube</div>
          </div>

          <ChevronDown
            className={`absolute bottom-4 right-4 h-5 w-5 text-slate-400 transition ${
              secondaryOpen ? "rotate-180" : ""
            }`}
          />
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {secondaryOpen ? (
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {secondarySources.map((item, index) => (
              <motion.button
                key={item.key}
                type="button"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.26, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
                  activeKey === item.key
                    ? "border-slate-300 bg-white text-slate-900 ring-2 ring-blue-200/60"
                    : "border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300"
                }`}
                onClick={() => handlePickSource(item.key)}
              >
                <SourceMark item={item} className="h-6 w-6 rounded-lg object-contain" />
                <span>{item.label}</span>
                {isSourceAdded(item.key) ? <Check className="h-4 w-4 text-emerald-600" /> : null}
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        layout
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl"
      >
        <div className="border-b border-slate-200/80 px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <SourceMark item={activeSource} className="h-10 w-10 rounded-2xl object-contain" />
              <div>
                <div className="text-[15px] font-semibold text-slate-900">{activeSource.label}</div>
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 sm:text-[12px]">
                  {isSourceAdded(activeKey) ? "Connected" : "Ready to connect"}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <Link2 className="h-4 w-4" />
              Handle or link
            </div>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_170px]">
            <input
              value={activeDraft}
              onChange={(e) => handleDraftChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="h-[64px] rounded-[20px] border border-slate-200 bg-slate-50/80 px-5 text-[22px] font-semibold tracking-[-0.04em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-300 focus:bg-white sm:text-[24px]"
              placeholder={activeSource.placeholder}
              autoComplete="off"
              spellCheck={false}
            />

            <button
              type="button"
              className="inline-flex h-[64px] items-center justify-center gap-2 rounded-[20px] bg-slate-900 px-6 text-[16px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:text-[17px]"
              onClick={handleAddSource}
              disabled={!s(activeDraft)}
            >
              {!sources[activeKey] ? <Plus className="h-5 w-5" /> : null}
              <span>{getActionLabel()}</span>
            </button>
          </div>

          {addedSources.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              <AnimatePresence initial={false}>
                {addedSources.map((item) => (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex max-w-full items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <SourceMark item={item} className="h-5 w-5 rounded-md object-contain" />
                    <span className="font-semibold">{item.label}</span>
                    <span className="truncate text-slate-500">{item.value}</span>

                    <button
                      type="button"
                      className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                      onClick={() => handleRemoveSource(item.key)}
                      aria-label={`Remove ${item.label}`}
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : null}

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
            <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3.5">
              <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Scan strategy
              </div>
              <div className="text-sm leading-6 text-slate-600">{dockNote}</div>
            </div>

            <button
              type="submit"
              disabled={!canAnalyze}
              className="inline-flex h-[64px] items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#7bb2ff_0%,#4f8cff_45%,#4b79ff_100%)] px-6 text-[16px] font-semibold text-white shadow-[0_16px_40px_rgba(79,140,255,.28)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_44px_rgba(79,140,255,.34)] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none sm:text-[17px]"
            >
              {importingWebsite ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  Analyze business
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {shouldShowResults ? (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl"
        >
          <div className="border-b border-slate-200/80 px-4 py-4 sm:px-5 lg:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[15px] font-semibold text-slate-900">
                  {analysisLoading ? "Analyzing source" : "Analysis results"}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {analysisLoading
                    ? "We are reading the source and building the first business draft."
                    : "Everything found from the connected source is shown below."}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {analysisSourceLabel ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                    {analysisSourceLabel}
                  </span>
                ) : null}

                {analysisReviewStatusLabel ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                    {analysisReviewStatusLabel}
                  </span>
                ) : null}

                {safeAnalysisWarnings[0] ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                    {safeAnalysisWarnings[0]}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
            {analysisLoading ? (
              <div className="rounded-[24px] border border-blue-100 bg-blue-50/70 px-5 py-5">
                <div className="flex items-center gap-3 text-sm font-medium text-blue-900">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyze is running...
                </div>
                <div className="mt-3 text-sm leading-6 text-blue-800/80">
                  Source is being scanned now. Result cards will appear here automatically.
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,.85fr)_minmax(0,1fr)]">
                  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/60 p-4">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Snapshot
                    </div>

                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-slate-950">
                        {s(analysisTitle) || "Business identity"}
                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        {truncateText(s(analysisMessage) || s(analysisDescription), 260) ||
                          "No summary was returned yet."}
                      </p>

                      {analysisUrl ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                          <span className="font-medium text-slate-700">URL:</span>{" "}
                          <span className="break-all">{analysisUrl}</span>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          onClick={onOpenRefine}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                        >
                          Refine draft
                        </button>

                        {typeof onOpenKnowledge === "function" ? (
                          <button
                            type="button"
                            onClick={onOpenKnowledge}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                          >
                            Review knowledge
                          </button>
                        ) : null}

                        {typeof onContinueFlow === "function" ? (
                          <button
                            type="button"
                            onClick={onContinueFlow}
                            className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                          >
                            Continue flow
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/60 p-4">
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Extracted signals
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          Knowledge
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                          {n(analysisKnowledgeCount)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          Services
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                          {n(analysisServiceCount)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          Sources
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                          {n(analysisSourceCount)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          Events
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                          {n(analysisEventCount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/60 p-4">
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Evidence
                    </div>

                    <div className="space-y-2">
                      {firstReviewSource?.label || firstReviewSource?.url ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                          <div className="text-xs font-medium text-slate-700">
                            {s(firstReviewSource.label || firstReviewSource.sourceType || "Source")}
                          </div>
                          {firstReviewSource.url ? (
                            <div className="mt-1 break-all text-xs text-slate-500">
                              {truncateText(firstReviewSource.url, 140)}
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {firstReviewEvent?.message || firstReviewEvent?.title ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                          <div className="text-xs font-medium text-slate-700">
                            {s(firstReviewEvent.title || firstReviewEvent.type || "Latest event")}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {truncateText(
                              s(firstReviewEvent.message || firstReviewEvent.status || ""),
                              140
                            )}
                          </div>
                        </div>
                      ) : null}

                      {safeAnalysisWarnings[0] ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                          <div className="text-xs font-medium text-amber-800">Warning</div>
                          <div className="mt-1 text-xs text-amber-700">
                            {truncateText(safeAnalysisWarnings[0], 140)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
                  <div className="mb-3 text-sm font-semibold text-slate-900">
                    Extracted details
                  </div>

                  {normalizedAnalysisRows.length ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {normalizedAnalysisRows.map((row, index) => (
                        <ResultRow
                          key={`${row.label}-${index}`}
                          label={row.label}
                          value={row.value}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                      Structured extracted fields are not available yet for this scan.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}
    </motion.form>
  );
}