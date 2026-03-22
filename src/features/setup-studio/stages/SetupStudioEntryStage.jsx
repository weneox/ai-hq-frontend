import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Globe2,
  Link2,
  Loader2,
  MapPinned,
  Mic,
  PencilLine,
  Plus,
  Sparkles,
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
    priority: "primary",
    actionLabel: "Add",
    canStartScan: true,
    helper: "Use your main website as the first source.",
  },
  {
    key: "googleMaps",
    apiSourceType: "google_maps",
    label: "Google Maps",
    placeholder: "maps link or business name",
    imageSrc: googleMapsIcon,
    priority: "primary",
    actionLabel: "Add",
    canStartScan: true,
    helper: "Use a Maps link or business name to start.",
  },
  {
    key: "instagram",
    apiSourceType: "instagram",
    label: "Instagram",
    placeholder: "@yourbrand",
    imageSrc: instagramIcon,
    priority: "primary",
    actionLabel: "Connect",
    canStartScan: false,
    helper: "Attach as context for later.",
  },
  {
    key: "facebook",
    apiSourceType: "facebook",
    label: "Facebook",
    placeholder: "facebook.com/yourbrand",
    imageSrc: facebookIcon,
    priority: "primary",
    actionLabel: "Connect",
    canStartScan: false,
    helper: "Attach as context for later.",
  },
  {
    key: "linkedin",
    apiSourceType: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/company/yourbrand",
    imageSrc: linkedinIcon,
    priority: "primary",
    actionLabel: "Connect",
    canStartScan: false,
    helper: "Attach as context for later.",
  },
  {
    key: "tiktok",
    apiSourceType: "tiktok",
    label: "TikTok",
    placeholder: "@yourbrand",
    imageSrc: tiktokIcon,
    priority: "secondary",
    actionLabel: "Connect",
    canStartScan: false,
    helper: "Optional context source.",
  },
  {
    key: "youtube",
    apiSourceType: "youtube",
    label: "YouTube",
    placeholder: "@yourbrand",
    imageSrc: youtubeIcon,
    priority: "secondary",
    actionLabel: "Connect",
    canStartScan: false,
    helper: "Optional context source.",
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
    return { sourceType: "", url: "" };
  }

  const block = text.slice(idx + marker.length).trim();
  const out = { sourceType: "", url: "" };

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

function isBarrierWarning(value = "") {
  const x = s(value).toLowerCase();
  return [
    "http_403",
    "http_429",
    "fetch_failed",
    "non_html_response",
    "website_fetch_timeout",
    "website_entry_timeout",
  ].includes(x);
}

function humanizeWarning(value = "") {
  const x = s(value).toLowerCase();

  if (x === "http_403") return "This website blocked direct access.";
  if (x === "http_429") return "This website rate-limited the request.";
  if (x === "fetch_failed") return "The website could not be read.";
  if (x === "non_html_response") return "The source did not return a readable webpage.";
  if (x === "website_fetch_timeout") return "The website took too long to respond.";
  if (x === "website_entry_timeout") return "The first page took too long to load.";
  if (x === "sitemap_fetch_timeout") return "The sitemap took too long, but some analysis may still exist.";
  if (x === "some_pages_rejected_as_weak_or_placeholder") return "Weak or placeholder pages were ignored.";

  return s(value).replaceAll("_", " ");
}

function isBlockedLikeTitle(value = "") {
  const x = s(value).toLowerCase();
  return (
    !x ||
    x === "business identity" ||
    x === "http_403" ||
    x === "http_429" ||
    x === "fetch_failed" ||
    x === "non_html_response"
  );
}

function hasMeaningfulText(value = "") {
  const x = s(value);
  if (!x) return false;
  if (/^(http_403|http_429|fetch_failed|non_html_response)$/i.test(x)) return false;
  if (x.length < 8) return false;
  return true;
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

function DetailRow({ label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white/88 px-4 py-3.5 shadow-[0_10px_24px_rgba(15,23,42,.03)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label || "Field"}
      </div>
      <div className="mt-1.5 break-words text-sm leading-6 text-slate-700">
        {value || "—"}
      </div>
    </div>
  );
}

const enterVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.988 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.34,
      delay: 0.04 + index * 0.04,
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
  const [briefNote, setBriefNote] = useState(plainNote);

  useEffect(() => {
    setDrafts(initialValues);
    setSources(initialValues);
    setSourceOrder(initialOrder);
    setBriefNote(plainNote);

    const firstFilled =
      initialOrder[0] ||
      SOURCE_OPTIONS.find((item) => s(initialValues[item.key]))?.key ||
      "website";

    setActiveKey(firstFilled);
    setSecondaryOpen(
      SOURCE_OPTIONS.some(
        (item) => item.priority === "secondary" && s(initialValues[item.key])
      )
    );
  }, [initialValues, initialOrder, plainNote]);

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

    if (briefNote) {
      parts.push(briefNote);
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
  }, [addedSources, briefNote, primaryScannableSource]);

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

  const barrierWarning = safeAnalysisWarnings.find(isBarrierWarning) || "";
  const barrierState = !!barrierWarning;

  const detailRows = useMemo(() => {
    if (!barrierState) return normalizedAnalysisRows;

    return normalizedAnalysisRows.filter((row) => {
      const label = s(row.label).toLowerCase();
      return !["website", "url", "language"].includes(label);
    });
  }, [normalizedAnalysisRows, barrierState]);

  const hasReviewableDraft = !!(
    !barrierState &&
    (
      detailRows.length > 0 ||
      n(analysisKnowledgeCount) > 0 ||
      n(analysisServiceCount) > 0 ||
      n(analysisSourceCount) > 0 ||
      n(analysisEventCount) > 0 ||
      hasMeaningfulText(analysisDescription) ||
      hasMeaningfulText(analysisMessage) ||
      !isBlockedLikeTitle(analysisTitle)
    )
  );

  const resultHeadline = barrierState
    ? "This source needs a different starting point."
    : !isBlockedLikeTitle(analysisTitle)
      ? analysisTitle
      : "Your first business draft is taking shape.";

  const resultSummary = barrierState
    ? humanizeWarning(barrierWarning)
    : truncateText(
        s(analysisMessage) || s(analysisDescription) || "Review the first pass, refine anything important, then continue into launch setup.",
        240
      );

  const strategyLabel = primaryScannableSource
    ? primaryScannableSource.key === "website"
      ? "Website will be scanned first. Other connected sources stay attached as context."
      : "Google Maps will be scanned first. Other connected sources stay attached as context."
    : "Add a Website or Google Maps source to start the first pass. Other sources can already be attached as context.";

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

  function sourceAccentClasses(itemKey, selected) {
    if (selected) {
      return "border-slate-300 bg-white shadow-[0_16px_34px_rgba(15,23,42,.06)] ring-1 ring-sky-200/70";
    }
    return "border-slate-200/80 bg-white/78 hover:border-slate-300 hover:bg-white";
  }

  const shouldShowResults = analysisLoading || hasAnalysis;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full flex-col gap-5"
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,.92fr)]">
        <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/78 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
          <div className="border-b border-slate-200/70 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                <Globe2 className="h-5 w-5" />
              </span>

              <div>
                <div className="text-[15px] font-semibold text-slate-950">
                  Choose a starting point
                </div>
                <div className="mt-1 max-w-[620px] text-sm leading-6 text-slate-600">
                  Add one source to begin, then attach anything else that helps the draft feel closer to the real business.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {primarySources.map((item, index) => (
                <motion.button
                  key={item.key}
                  type="button"
                  custom={index}
                  variants={enterVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => handlePickSource(item.key)}
                  className={`group min-h-[138px] rounded-[24px] border p-4 text-left transition-all duration-200 ${sourceAccentClasses(
                    item.key,
                    activeKey === item.key
                  )}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <SourceMark item={item} className="h-10 w-10 rounded-2xl object-contain" />

                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        isSourceAdded(item.key)
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : activeKey === item.key
                            ? "border-sky-200 bg-sky-50 text-sky-700"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {isSourceAdded(item.key) ? "Added" : item.canStartScan ? "Primary" : "Context"}
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="text-[16px] font-semibold text-slate-950">
                      {item.label}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-slate-500">
                      {isSourceAdded(item.key)
                        ? formatSourceValue(item.key, sources[item.key])
                        : item.helper}
                    </div>
                  </div>
                </motion.button>
              ))}

              <motion.button
                type="button"
                custom={primarySources.length}
                variants={enterVariants}
                initial="hidden"
                animate="visible"
                onClick={() => setSecondaryOpen((prev) => !prev)}
                className={`min-h-[138px] rounded-[24px] border p-4 text-left transition-all duration-200 ${
                  secondaryOpen
                    ? "border-slate-300 bg-white ring-1 ring-sky-200/70"
                    : "border-slate-200/80 bg-white/78 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                    <Plus className="h-5 w-5" />
                  </span>

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Optional
                  </span>
                </div>

                <div className="mt-5">
                  <div className="text-[16px] font-semibold text-slate-950">
                    More context
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">
                    Add TikTok or YouTube later as extra signal.
                  </div>
                </div>

                <ChevronDown
                  className={`mt-4 h-5 w-5 text-slate-400 transition ${
                    secondaryOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>
            </div>

            <AnimatePresence initial={false}>
              {secondaryOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2.5">
                    {secondarySources.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handlePickSource(item.key)}
                        className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                          activeKey === item.key
                            ? "border-slate-300 bg-white text-slate-950 ring-1 ring-sky-200/70"
                            : "border-slate-200 bg-white/86 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <SourceMark item={item} className="h-5 w-5 rounded-lg object-contain" />
                        <span>{item.label}</span>
                        {isSourceAdded(item.key) ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Sparkles className="h-4 w-4" />
                  Smart draft
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  The system should prepare the first draft, then let you confirm it.
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <PencilLine className="h-4 w-4" />
                  Assisted manual
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Add one source, then describe the business in a few lines if anything important is missing.
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Mic className="h-4 w-4" />
                  Voice later
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Voice intake can come later. For now, type a short brief and keep the first launch stable.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
          <div className="border-b border-slate-200/70 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <SourceMark item={activeSource} className="h-10 w-10 rounded-2xl object-contain" />
                  <div>
                    <div className="text-[15px] font-semibold text-slate-950">
                      Build the first draft
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Add a source, then give a short business brief if needed.
                    </div>
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <Link2 className="h-3.5 w-3.5" />
                {activeSource.label}
              </span>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Source handle or link
              </label>

              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_168px]">
                <input
                  value={activeDraft}
                  onChange={(e) => handleDraftChange(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={activeSource.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-[62px] rounded-[20px] border border-slate-200 bg-slate-50/75 px-5 text-[18px] font-semibold tracking-[-0.03em] text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-slate-300 focus:bg-white"
                />

                <button
                  type="button"
                  onClick={handleAddSource}
                  disabled={!s(activeDraft)}
                  className="inline-flex h-[62px] items-center justify-center gap-2 rounded-[20px] border border-slate-200 bg-slate-950 px-5 text-[15px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {!sources[activeKey] ? <Plus className="h-4.5 w-4.5" /> : null}
                  {getActionLabel()}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Optional business brief
              </label>

              <textarea
                value={briefNote}
                onChange={(e) => setBriefNote(e.target.value)}
                rows={5}
                placeholder="Describe the business in a few lines. What do you sell, who do you serve, what do customers ask most, and when should AI hand off to a human?"
                className="w-full resize-none rounded-[22px] border border-slate-200 bg-slate-50/75 px-4 py-4 text-[15px] leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
              />
            </div>

            {addedSources.length > 0 ? (
              <div>
                <div className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Connected sources
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <AnimatePresence initial={false}>
                    {addedSources.map((item) => {
                      const isPrimary =
                        s(item.apiSourceType) === s(primaryScannableSource?.apiSourceType) &&
                        s(item.url) === s(primaryScannableSource?.url);

                      return (
                        <motion.div
                          key={item.key}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className={`inline-flex max-w-full items-center gap-3 rounded-full border px-3 py-2 text-sm ${
                            isPrimary
                              ? "border-sky-200 bg-sky-50 text-sky-800"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          <SourceMark item={item} className="h-5 w-5 rounded-md object-contain" />
                          <span className="font-semibold">{item.label}</span>
                          <span className="truncate text-current/80">{item.value}</span>

                          {isPrimary ? (
                            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                              first scan
                            </span>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => handleRemoveSource(item.key)}
                            aria-label={`Remove ${item.label}`}
                            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-current/60 transition hover:bg-black/5 hover:text-current"
                          >
                            ×
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ) : null}

            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/72 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                First pass strategy
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">
                {strategyLabel}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canAnalyze}
              className="inline-flex h-[64px] w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#93c5fd_0%,#4f8cff_42%,#3b5fff_100%)] px-6 text-[16px] font-semibold text-white shadow-[0_18px_40px_rgba(79,140,255,.30)] transition hover:translate-y-[-1px] hover:shadow-[0_24px_46px_rgba(79,140,255,.36)] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
            >
              {importingWebsite ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Preparing draft
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
      </section>

      {shouldShowResults ? (
        <motion.section
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[30px] border border-white/70 bg-white/84 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl"
        >
          <div className="border-b border-slate-200/70 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[16px] font-semibold text-slate-950">
                  {analysisLoading ? "Building the first draft" : "First pass result"}
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-500">
                  {analysisLoading
                    ? "The source is being processed now. This area updates automatically when the first pass is ready."
                    : barrierState
                      ? "This source did not give enough readable signal. You can switch the source or continue more manually."
                      : "Review the business snapshot, refine the draft, then continue into launch setup."}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
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
                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      barrierState
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {humanizeWarning(safeAnalysisWarnings[0])}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            {analysisLoading ? (
              <div className="rounded-[24px] border border-sky-100 bg-sky-50/70 px-5 py-5">
                <div className="flex items-center gap-3 text-sm font-medium text-sky-900">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyze is running...
                </div>
                <div className="mt-3 text-sm leading-6 text-sky-800/80">
                  We’re reading the primary source and shaping the first reviewable draft.
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,.85fr)]">
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/65 p-5">
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Snapshot
                    </div>

                    <div className="space-y-3">
                      <div className="text-[26px] font-semibold tracking-[-0.04em] text-slate-950">
                        {resultHeadline}
                      </div>

                      <p className="max-w-[760px] text-sm leading-7 text-slate-600">
                        {resultSummary || "No summary is available yet."}
                      </p>

                      {analysisUrl ? (
                        <div className="inline-flex max-w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                          <span className="mr-1 font-medium text-slate-700">Source:</span>
                          <span className="truncate">{analysisUrl}</span>
                        </div>
                      ) : null}

                      {barrierState ? (
                        <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-amber-700">
                              <AlertTriangle className="h-5 w-5" />
                            </span>
                            <div>
                              <div className="text-sm font-semibold text-amber-900">
                                Limited access
                              </div>
                              <div className="mt-1 text-sm leading-6 text-amber-800/90">
                                This source should not be treated like a real business draft yet. Try another source, or continue with a more manual review path.
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-2 pt-1">
                        {hasReviewableDraft && typeof onOpenRefine === "function" ? (
                          <button
                            type="button"
                            onClick={onOpenRefine}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                          >
                            Refine draft
                          </button>
                        ) : null}

                        {!barrierState && typeof onOpenKnowledge === "function" && n(analysisKnowledgeCount) > 0 ? (
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
                            {barrierState ? "Continue manually" : "Continue flow"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/65 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Knowledge
                      </div>
                      <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                        {n(analysisKnowledgeCount)}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/65 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Services
                      </div>
                      <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                        {n(analysisServiceCount)}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/65 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Sources
                      </div>
                      <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                        {n(analysisSourceCount)}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/65 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Events
                      </div>
                      <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                        {n(analysisEventCount)}
                      </div>
                    </div>
                  </div>
                </div>

                {(firstReviewSource?.label ||
                  firstReviewSource?.url ||
                  firstReviewEvent?.message ||
                  firstReviewEvent?.title ||
                  safeAnalysisWarnings[0]) ? (
                  <div className="grid gap-4 xl:grid-cols-3">
                    {(firstReviewSource?.label || firstReviewSource?.url) ? (
                      <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/65 p-4">
                        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Evidence source
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                          {s(firstReviewSource.label || firstReviewSource.sourceType || "Source")}
                        </div>
                        {firstReviewSource.url ? (
                          <div className="mt-2 break-all text-sm leading-6 text-slate-500">
                            {truncateText(firstReviewSource.url, 180)}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {(firstReviewEvent?.message || firstReviewEvent?.title) ? (
                      <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/65 p-4">
                        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Latest event
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                          {s(firstReviewEvent.title || firstReviewEvent.type || "Event")}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-500">
                          {truncateText(
                            s(firstReviewEvent.message || firstReviewEvent.status || ""),
                            180
                          )}
                        </div>
                      </div>
                    ) : null}

                    {safeAnalysisWarnings[0] ? (
                      <div
                        className={`rounded-[24px] border p-4 ${
                          barrierState
                            ? "border-amber-200 bg-amber-50"
                            : "border-slate-200/80 bg-slate-50/65"
                        }`}
                      >
                        <div
                          className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            barrierState ? "text-amber-700" : "text-slate-400"
                          }`}
                        >
                          Warning
                        </div>
                        <div
                          className={`text-sm leading-6 ${
                            barrierState ? "text-amber-800" : "text-slate-600"
                          }`}
                        >
                          {humanizeWarning(safeAnalysisWarnings[0])}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/65 p-4 sm:p-5">
                  <div className="mb-3 text-sm font-semibold text-slate-900">
                    Structured details
                  </div>

                  {detailRows.length ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {detailRows.map((row, index) => (
                        <DetailRow
                          key={`${row.label}-${index}`}
                          label={row.label}
                          value={row.value}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-500">
                      {barrierState
                        ? "No reliable structured fields were available from this source yet."
                        : "Structured extracted fields are not available yet for this scan."}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.section>
      ) : null}

      {error ? (
        <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}
    </motion.form>
  );
}