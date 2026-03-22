import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Ellipsis,
  Globe2,
  Link2,
  Loader2,
  PencilLine,
  X,
} from "lucide-react";

import websiteIcon from "../../../assets/setup-studio/channels/weblink.webp";
import instagramIcon from "../../../assets/setup-studio/channels/instagram.svg";
import linkedinIcon from "../../../assets/setup-studio/channels/linkedin.svg";

const SOURCE_OPTIONS = [
  {
    key: "website",
    apiSourceType: "website",
    label: "Website",
    placeholder: "yourbusiness.com",
    imageSrc: websiteIcon,
    helper: "Main source for the first draft.",
    canStartScan: true,
  },
  {
    key: "instagram",
    apiSourceType: "instagram",
    label: "Instagram",
    placeholder: "@yourbrand",
    imageSrc: instagramIcon,
    helper: "Optional brand context.",
    canStartScan: false,
  },
  {
    key: "linkedin",
    apiSourceType: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/company/yourbrand",
    imageSrc: linkedinIcon,
    helper: "Optional company context.",
    canStartScan: false,
  },
];

function s(v) {
  return String(v ?? "").trim();
}

function arr(v) {
  return Array.isArray(v) ? v : [];
}

function n(v, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function obj(v) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
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

function normalizeLinkedIn(v) {
  const x = s(v);
  if (!x) return "";
  if (/^https?:\/\//i.test(x)) return x;

  const handle = cleanHandle(x).replace(/^linkedin\.com\//i, "");
  if (handle.includes("/")) return `https://linkedin.com/${handle}`;
  return `https://linkedin.com/company/${handle}`;
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

  if (key === "linkedin") {
    return x.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }

  return x;
}

function normalizeSourceMap(raw = {}) {
  return {
    website: normalizeWebsite(raw.website),
    instagram: normalizeInstagram(raw.instagram),
    linkedin: normalizeLinkedIn(raw.linkedin),
  };
}

function parseStudioSources(raw) {
  const out = {
    website: "",
    instagram: "",
    linkedin: "",
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
    const key = s(label).toLowerCase().replace(/[\s_-]+/g, "");

    if (key === "website") out.website = value;
    if (key === "instagram") out.instagram = value;
    if (key === "linkedin") out.linkedin = value;
  }

  return out;
}

function parseManualBlock(raw) {
  const text = s(raw);
  const marker = "[manual_business]";
  const idx = text.indexOf(marker);

  if (idx === -1) {
    return { name: "", brief: "" };
  }

  const block = text.slice(idx + marker.length).trim();
  const out = { name: "", brief: "" };

  for (const line of block.split(/\r?\n/)) {
    const [label, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const key = s(label).toLowerCase();

    if (key === "name") out.name = value;
    if (key === "brief") out.brief = value;
  }

  return out;
}

function extractPlainNote(raw) {
  const text = s(raw);
  const sourceIdx = text.indexOf("[studio_sources]");
  const manualIdx = text.indexOf("[manual_business]");

  let cutIndex = -1;
  if (sourceIdx >= 0 && manualIdx >= 0) cutIndex = Math.min(sourceIdx, manualIdx);
  else cutIndex = Math.max(sourceIdx, manualIdx);

  if (cutIndex === -1) return text.trim();
  return text.slice(0, cutIndex).trim();
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

  return s(value).replaceAll("_", " ");
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

function hasMeaningfulText(value = "") {
  const x = s(value);
  if (!x) return false;
  if (/^(http_403|http_429|fetch_failed|non_html_response)$/i.test(x)) return false;
  if (x.length < 8) return false;
  return true;
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

function SourceMark({ item, size = "h-11 w-11" }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-[16px] ${size}`}>
      <img
        src={item.imageSrc}
        alt=""
        aria-hidden="true"
        className="h-full w-full rounded-[16px] object-contain"
      />
    </span>
  );
}

function SwirlCore({ tint = "blue", active = false }) {
  const ring =
    tint === "violet"
      ? "border-violet-200/70 bg-[radial-gradient(circle_at_center,rgba(196,181,253,.2),transparent_60%)]"
      : "border-sky-200/70 bg-[radial-gradient(circle_at_center,rgba(125,211,252,.18),transparent_60%)]";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[34px]">
      <motion.div
        animate={{ rotate: active ? 360 : 0 }}
        transition={{
          duration: active ? 10 : 0,
          ease: "linear",
          repeat: active ? Infinity : 0,
        }}
        className="absolute left-1/2 top-[64%] h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2"
      >
        <div className={`absolute inset-0 rounded-full border ${ring} blur-[1px]`} />
        <div className={`absolute inset-[18px] rounded-full border ${ring} opacity-80`} />
        <div className={`absolute inset-[38px] rounded-full border ${ring} opacity-60`} />
        <div className="absolute inset-[62px] rounded-full border border-white/40 opacity-60" />
      </motion.div>

      <motion.div
        animate={{ rotate: active ? -360 : 0 }}
        transition={{
          duration: active ? 14 : 0,
          ease: "linear",
          repeat: active ? Infinity : 0,
        }}
        className="absolute left-1/2 top-[64%] h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="absolute inset-[20px] rounded-full border border-white/20" />
        <div className="absolute inset-[42px] rounded-full border border-white/15" />
      </motion.div>

      <div className="absolute inset-x-8 bottom-8 h-24 rounded-full bg-white/10 blur-3xl" />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-[20px] border border-white/70 bg-white/74 px-4 py-3.5 shadow-[0_10px_30px_rgba(15,23,42,.05)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label || "Field"}
      </div>
      <div className="mt-1.5 break-words text-sm leading-6 text-slate-700">
        {value || "—"}
      </div>
    </div>
  );
}

function SourceChoiceChip({
  item,
  selected,
  added,
  onClick,
  delay = 0,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.34, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`group inline-flex items-center gap-3 rounded-full border px-4 py-3 text-left transition-all duration-200 ${
        selected
          ? "border-slate-900 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,.2)]"
          : "border-white/70 bg-white/74 text-slate-700 hover:border-slate-300 hover:bg-white"
      }`}
    >
      <SourceMark item={item} size="h-8 w-8" />
      <span className="text-sm font-semibold">{item.label}</span>
      {added ? (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
            selected ? "bg-white/14 text-white/90" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          added
        </span>
      ) : null}
    </motion.button>
  );
}

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
  onOpenRefine,
  onOpenKnowledge,
  onContinueFlow,
}) {
  const savedSources = useMemo(
    () => parseStudioSources(discoveryForm?.note),
    [discoveryForm?.note]
  );

  const savedManual = useMemo(
    () => parseManualBlock(discoveryForm?.note),
    [discoveryForm?.note]
  );

  const savedPlainNote = useMemo(
    () => extractPlainNote(discoveryForm?.note),
    [discoveryForm?.note]
  );

  const [activeMode, setActiveMode] = useState(null); // null | source | manual
  const [hoveredMode, setHoveredMode] = useState(null);
  const [selectedSourceKey, setSelectedSourceKey] = useState("website");

  const [sourceDrafts, setSourceDrafts] = useState({
    website: savedSources.website || s(discoveryForm?.websiteUrl).replace(/^https?:\/\//i, ""),
    instagram: savedSources.instagram || "",
    linkedin: savedSources.linkedin || "",
  });

  const [sources, setSources] = useState({
    website: savedSources.website || s(discoveryForm?.websiteUrl).replace(/^https?:\/\//i, ""),
    instagram: savedSources.instagram || "",
    linkedin: savedSources.linkedin || "",
  });

  const [manualName, setManualName] = useState(savedManual.name || "");
  const [manualBrief, setManualBrief] = useState(savedManual.brief || savedPlainNote || "");

  useEffect(() => {
    const nextSources = {
      website: savedSources.website || s(discoveryForm?.websiteUrl).replace(/^https?:\/\//i, ""),
      instagram: savedSources.instagram || "",
      linkedin: savedSources.linkedin || "",
    };

    setSourceDrafts(nextSources);
    setSources(nextSources);
    setManualName(savedManual.name || "");
    setManualBrief(savedManual.brief || savedPlainNote || "");
  }, [
    savedSources.website,
    savedSources.instagram,
    savedSources.linkedin,
    savedManual.name,
    savedManual.brief,
    savedPlainNote,
    discoveryForm?.websiteUrl,
  ]);

  const normalizedSources = useMemo(() => normalizeSourceMap(sources), [sources]);

  const addedSources = useMemo(() => {
    return SOURCE_OPTIONS.filter((item) => s(normalizedSources[item.key])).map((item) => ({
      ...item,
      url: normalizedSources[item.key],
      value: formatSourceValue(item.key, sources[item.key]),
    }));
  }, [normalizedSources, sources]);

  const websiteSource = useMemo(
    () => addedSources.find((item) => item.key === "website") || null,
    [addedSources]
  );

  const canAnalyze = !!websiteSource?.url && !importingWebsite;
  const shouldShowResults = analysisLoading || hasAnalysis;

  const composedNote = useMemo(() => {
    const parts = [];

    if (manualName || manualBrief) {
      parts.push(
        [
          "[manual_business]",
          `name: ${manualName}`,
          `brief: ${manualBrief}`,
        ].join("\n")
      );
    }

    const lines = [];
    if (normalizedSources.website) lines.push(`website: ${normalizedSources.website}`);
    if (normalizedSources.instagram) lines.push(`instagram: ${normalizedSources.instagram}`);
    if (normalizedSources.linkedin) lines.push(`linkedin: ${normalizedSources.linkedin}`);

    if (lines.length) {
      parts.push(`[studio_sources]\n${lines.join("\n")}`);
    }

    return parts.join("\n\n").trim();
  }, [
    manualName,
    manualBrief,
    normalizedSources.website,
    normalizedSources.instagram,
    normalizedSources.linkedin,
  ]);

  useEffect(() => {
    const nextPrimaryUrl = s(normalizedSources.website);
    const currentPrimaryUrl = s(discoveryForm?.websiteUrl);
    const currentNote = s(discoveryForm?.note);

    if (currentPrimaryUrl !== nextPrimaryUrl) {
      onSetDiscoveryField("websiteUrl", nextPrimaryUrl);
    }

    if (currentNote !== composedNote) {
      onSetDiscoveryField("note", composedNote);
    }
  }, [
    normalizedSources.website,
    composedNote,
    discoveryForm?.websiteUrl,
    discoveryForm?.note,
    onSetDiscoveryField,
  ]);

  const safeAnalysisWarnings = arr(analysisWarnings).filter(Boolean);
  const barrierWarning = safeAnalysisWarnings.find(isBarrierWarning) || "";
  const barrierState = !!barrierWarning;
  const detailRows = useMemo(
    () => normalizeAnalysisRows(analysisProfileRows),
    [analysisProfileRows]
  );

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
      hasMeaningfulText(analysisTitle)
    )
  );

  function handleDraftChange(key, value) {
    setSourceDrafts((prev) => ({ ...prev, [key]: value }));
  }

  function handleAddSource() {
    const value = s(sourceDrafts[selectedSourceKey]);
    if (!value) return;

    setSources((prev) => ({
      ...prev,
      [selectedSourceKey]: value,
    }));
  }

  function handleRemoveSource(key) {
    setSources((prev) => ({
      ...prev,
      [key]: "",
    }));

    setSourceDrafts((prev) => ({
      ...prev,
      [key]: "",
    }));

    if (selectedSourceKey === key) {
      setSelectedSourceKey("website");
    }
  }

  function handleAnalyze(e) {
    e?.preventDefault?.();
    if (!canAnalyze) return;

    onScanBusiness?.({
      sourceType: "website",
      url: websiteSource.url,
      note: composedNote,
      sources: addedSources.map((item) => ({
        key: item.key,
        sourceType: item.apiSourceType,
        url: item.url,
        value: item.value,
      })),
      primarySource: websiteSource,
    });
  }

  function handleManualContinue() {
    if (!manualName && !manualBrief) return;
    onContinueFlow?.();
  }

  function cardVisible(mode) {
    if (!activeMode) return true;
    return activeMode === mode;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,.70),rgba(255,255,255,.50))] px-5 py-6 shadow-[0_30px_90px_rgba(15,23,42,.08)] backdrop-blur-xl sm:px-7 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[940px] text-center">
          <div className="inline-flex items-center rounded-full border border-white/80 bg-white/65 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,.05)]">
            AI Setup Studio
          </div>

          <h2 className="mt-6 text-[40px] font-semibold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[52px]">
            Let’s shape your business draft
          </h2>

          <p className="mx-auto mt-4 max-w-[720px] text-[16px] leading-8 text-slate-500 sm:text-[18px]">
            Start from real sources or describe the business manually.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-[1240px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <div
              className={`grid gap-5 ${
                activeMode ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"
              }`}
            >
              {cardVisible("source") ? (
                <motion.div
                  key="source-card"
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, scale: 0.9, filter: "blur(16px)" }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  onHoverStart={() => setHoveredMode("source")}
                  onHoverEnd={() => setHoveredMode(null)}
                  className={`relative overflow-hidden rounded-[34px] border border-white/80 bg-[linear-gradient(135deg,rgba(229,248,255,.95),rgba(247,248,255,.82))] shadow-[0_28px_80px_rgba(71,123,255,.12)] ${
                    activeMode === "source" ? "min-h-[620px]" : "min-h-[430px]"
                  }`}
                >
                  <SwirlCore tint="blue" active={hoveredMode === "source" || activeMode === "source"} />

                  <div className="relative z-[2] flex h-full flex-col p-6 sm:p-7 lg:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[34px] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[42px]">
                          Add your business sources
                        </div>
                        <div className="mt-3 max-w-[520px] text-[16px] leading-8 text-slate-600">
                          Start with what already exists. Website first, then brand context.
                        </div>
                      </div>

                      {activeMode === "source" ? (
                        <button
                          type="button"
                          onClick={() => setActiveMode(null)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/72 text-slate-600 transition hover:bg-white"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      ) : null}
                    </div>

                    {!activeMode ? (
                      <>
                        <div className="mt-auto flex items-center gap-3 pt-10">
                          <motion.div
                            initial={false}
                            animate={{
                              opacity: hoveredMode === "source" ? 1 : 0.78,
                              y: hoveredMode === "source" ? 0 : 8,
                            }}
                            className="flex flex-wrap gap-2"
                          >
                            {SOURCE_OPTIONS.map((item, index) => (
                              <motion.div
                                key={item.key}
                                animate={{
                                  y: hoveredMode === "source" ? [0, -4, 0] : 0,
                                  opacity: hoveredMode === "source" ? 1 : 0.82,
                                }}
                                transition={{
                                  duration: 2.4,
                                  delay: index * 0.12,
                                  repeat: hoveredMode === "source" ? Infinity : 0,
                                  ease: "easeInOut",
                                }}
                                className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-2 shadow-[0_12px_28px_rgba(15,23,42,.05)]"
                              >
                                <SourceMark item={item} size="h-7 w-7" />
                                <span className="text-[13px] font-medium text-slate-700">
                                  {item.label}
                                </span>
                              </motion.div>
                            ))}

                            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-3 py-2 text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,.05)]">
                              <Ellipsis className="h-4 w-4" />
                            </div>
                          </motion.div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveMode("source")}
                          className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-slate-900 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,.22)] transition hover:translate-y-[-1px] hover:bg-slate-900"
                        >
                          Open sources
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.34, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)]"
                      >
                        <div className="space-y-4">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Source set
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <SourceChoiceChip
                              item={SOURCE_OPTIONS[0]}
                              selected={selectedSourceKey === "website"}
                              added={!!s(sources.website)}
                              onClick={() => setSelectedSourceKey("website")}
                              delay={0.04}
                            />

                            <SourceChoiceChip
                              item={SOURCE_OPTIONS[1]}
                              selected={selectedSourceKey === "instagram"}
                              added={!!s(sources.instagram)}
                              onClick={() => setSelectedSourceKey("instagram")}
                              delay={0.1}
                            />

                            <SourceChoiceChip
                              item={SOURCE_OPTIONS[2]}
                              selected={selectedSourceKey === "linkedin"}
                              added={!!s(sources.linkedin)}
                              onClick={() => setSelectedSourceKey("linkedin")}
                              delay={0.16}
                            />

                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.34, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                              className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/68 px-4 py-3 text-slate-500"
                            >
                              <Ellipsis className="h-4 w-4" />
                            </motion.div>
                          </div>

                          <div className="rounded-[28px] border border-white/75 bg-white/68 p-5 shadow-[0_18px_46px_rgba(15,23,42,.06)]">
                            <div className="flex items-center gap-3">
                              <SourceMark
                                item={
                                  SOURCE_OPTIONS.find((item) => item.key === selectedSourceKey) ||
                                  SOURCE_OPTIONS[0]
                                }
                                size="h-10 w-10"
                              />
                              <div>
                                <div className="text-[18px] font-semibold text-slate-950">
                                  {
                                    SOURCE_OPTIONS.find((item) => item.key === selectedSourceKey)
                                      ?.label
                                  }
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                  {
                                    SOURCE_OPTIONS.find((item) => item.key === selectedSourceKey)
                                      ?.helper
                                  }
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px]">
                              <div className="relative">
                                <Link2 className="pointer-events-none absolute left-5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                <input
                                  value={sourceDrafts[selectedSourceKey]}
                                  onChange={(e) => handleDraftChange(selectedSourceKey, e.target.value)}
                                  placeholder={
                                    SOURCE_OPTIONS.find((item) => item.key === selectedSourceKey)
                                      ?.placeholder
                                  }
                                  autoComplete="off"
                                  spellCheck={false}
                                  className="h-[64px] w-full rounded-[22px] border border-white/80 bg-white/88 pl-14 pr-5 text-[17px] font-medium tracking-[-0.03em] text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-slate-300"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={handleAddSource}
                                disabled={!s(sourceDrafts[selectedSourceKey])}
                                className="inline-flex h-[64px] items-center justify-center rounded-[22px] border border-slate-950 bg-slate-950 px-5 text-[15px] font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
                              >
                                {s(sources[selectedSourceKey]) ? "Update" : "Add"}
                              </button>
                            </div>

                            {addedSources.length ? (
                              <div className="mt-5 flex flex-wrap gap-2.5">
                                {addedSources.map((item) => (
                                  <div
                                    key={item.key}
                                    className={`inline-flex max-w-full items-center gap-3 rounded-full border px-3 py-2 text-sm shadow-[0_10px_24px_rgba(15,23,42,.04)] ${
                                      item.key === "website"
                                        ? "border-sky-200 bg-sky-50 text-sky-800"
                                        : "border-white/80 bg-white/86 text-slate-700"
                                    }`}
                                  >
                                    <SourceMark item={item} size="h-5 w-5" />
                                    <span className="font-semibold">{item.label}</span>
                                    <span className="truncate text-current/80">{item.value}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSource(item.key)}
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-current/60 transition hover:bg-black/5"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42))] p-5 shadow-[0_18px_46px_rgba(15,23,42,.05)]">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                              First pass
                            </div>

                            <div className="mt-4 text-[28px] font-semibold leading-[1.08] tracking-[-0.05em] text-slate-950">
                              Build from website, enrich with brand context.
                            </div>

                            <div className="mt-4 max-w-[480px] text-[15px] leading-7 text-slate-600">
                              Instagram and LinkedIn can already be attached, but the first real draft is created from your website.
                            </div>
                          </div>

                          <div className="mt-8">
                            <button
                              type="button"
                              onClick={handleAnalyze}
                              disabled={!canAnalyze}
                              className="inline-flex h-[68px] w-full items-center justify-center gap-3 rounded-[24px] bg-slate-950 px-6 text-[16px] font-semibold text-white shadow-[0_22px_46px_rgba(15,23,42,.22)] transition hover:translate-y-[-1px] hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                            >
                              {importingWebsite ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  Preparing draft
                                </>
                              ) : (
                                <>
                                  Build from website
                                  <ArrowRight className="h-5 w-5" />
                                </>
                              )}
                            </button>

                            <div className="mt-3 text-center text-sm text-slate-500">
                              {!websiteSource?.url
                                ? "Add a website to start the first pass."
                                : "Website ready. You can start the first draft now."}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : null}

              {cardVisible("manual") ? (
                <motion.div
                  key="manual-card"
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, scale: 0.9, filter: "blur(16px)" }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  onHoverStart={() => setHoveredMode("manual")}
                  onHoverEnd={() => setHoveredMode(null)}
                  className={`relative overflow-hidden rounded-[34px] border border-white/80 bg-[linear-gradient(135deg,rgba(245,240,255,.94),rgba(251,249,255,.82))] shadow-[0_28px_80px_rgba(137,92,255,.12)] ${
                    activeMode === "manual" ? "min-h-[620px]" : "min-h-[430px]"
                  }`}
                >
                  <SwirlCore
                    tint="violet"
                    active={hoveredMode === "manual" || activeMode === "manual"}
                  />

                  <div className="relative z-[2] flex h-full flex-col p-6 sm:p-7 lg:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[34px] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[42px]">
                          Describe your business
                        </div>
                        <div className="mt-3 max-w-[520px] text-[16px] leading-8 text-slate-600">
                          No website yet? Open the card and start manually.
                        </div>
                      </div>

                      {activeMode === "manual" ? (
                        <button
                          type="button"
                          onClick={() => setActiveMode(null)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/72 text-slate-600 transition hover:bg-white"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      ) : null}
                    </div>

                    {!activeMode ? (
                      <>
                        <div className="mt-auto flex items-end justify-between gap-4 pt-10">
                          <div className="flex flex-wrap gap-2">
                            <div className="rounded-full border border-white/80 bg-white/66 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,.05)]">
                              Business name
                            </div>
                            <div className="rounded-full border border-white/80 bg-white/60 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,.05)]">
                              Short description
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveMode("manual")}
                          className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-slate-900 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,.22)] transition hover:translate-y-[-1px] hover:bg-slate-900"
                        >
                          Open manual
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.34, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(0,.94fr)]"
                      >
                        <div className="rounded-[28px] border border-white/75 bg-white/72 p-5 shadow-[0_18px_46px_rgba(15,23,42,.06)]">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-violet-100 bg-violet-50 text-violet-700">
                              <Building2 className="h-5 w-5" />
                            </span>
                            <div>
                              <div className="text-[18px] font-semibold text-slate-950">
                                Manual starting point
                              </div>
                              <div className="mt-1 text-sm text-slate-500">
                                This opens the draft without relying on website scan.
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 space-y-3">
                            <input
                              value={manualName}
                              onChange={(e) => setManualName(e.target.value)}
                              placeholder="Business name"
                              className="h-[64px] w-full rounded-[22px] border border-white/80 bg-white/90 px-5 text-[17px] font-medium tracking-[-0.03em] text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-slate-300"
                            />

                            <textarea
                              value={manualBrief}
                              onChange={(e) => setManualBrief(e.target.value)}
                              rows={7}
                              placeholder="Describe the business in a few clear lines..."
                              className="w-full resize-none rounded-[24px] border border-white/80 bg-white/90 px-5 py-4 text-[15px] leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,.62),rgba(255,255,255,.42))] p-5 shadow-[0_18px_46px_rgba(15,23,42,.05)]">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                              Manual path
                            </div>

                            <div className="mt-4 text-[28px] font-semibold leading-[1.08] tracking-[-0.05em] text-slate-950">
                              Start from scratch, refine after.
                            </div>

                            <div className="mt-4 max-w-[460px] text-[15px] leading-7 text-slate-600">
                              Write the business name and a short explanation. The next steps can still refine services, knowledge, and launch setup.
                            </div>
                          </div>

                          <div className="mt-8">
                            <button
                              type="button"
                              onClick={handleManualContinue}
                              disabled={!manualName && !manualBrief}
                              className="inline-flex h-[68px] w-full items-center justify-center gap-3 rounded-[24px] bg-slate-950 px-6 text-[16px] font-semibold text-white shadow-[0_22px_46px_rgba(15,23,42,.22)] transition hover:translate-y-[-1px] hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                            >
                              Continue manually
                              <ArrowRight className="h-5 w-5" />
                            </button>

                            <div className="mt-3 text-center text-sm text-slate-500">
                              Manual text stays saved for the next step.
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </div>
          </AnimatePresence>
        </div>
      </section>

      {shouldShowResults ? (
        <motion.section
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl"
        >
          <div className="border-b border-slate-200/70 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[16px] font-semibold text-slate-950">
                  {analysisLoading ? "Building the first draft" : "First pass result"}
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-500">
                  {analysisLoading
                    ? "The website is being processed now."
                    : barrierState
                      ? "This source did not give enough readable signal yet."
                      : "Review the first pass, refine it, then continue."}
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
                  We’re reading the primary website and shaping the first reviewable draft.
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
                        {barrierState
                          ? "This source needs a different starting point."
                          : analysisTitle || "Your first business draft is taking shape."}
                      </div>

                      <p className="max-w-[760px] text-sm leading-7 text-slate-600">
                        {barrierState
                          ? humanizeWarning(barrierWarning)
                          : truncateText(
                              s(analysisMessage) ||
                                s(analysisDescription) ||
                                "Review the business snapshot, refine anything important, then continue.",
                              240
                            )}
                      </p>

                      {analysisUrl ? (
                        <div className="inline-flex max-w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                          <span className="mr-1 font-medium text-slate-700">Source:</span>
                          <span className="truncate">{analysisUrl}</span>
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

                        {!barrierState &&
                        typeof onOpenKnowledge === "function" &&
                        n(analysisKnowledgeCount) > 0 ? (
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
    </div>
  );
}