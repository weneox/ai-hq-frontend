import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Link2, X } from "lucide-react";

import websiteIcon from "../../../assets/setup-studio/channels/weblink.webp";
import googleMapsIcon from "../../../assets/setup-studio/channels/google-maps.svg";
import instagramIcon from "../../../assets/setup-studio/channels/instagram.svg";
import linkedinIcon from "../../../assets/setup-studio/channels/linkedin.svg";
import facebookIcon from "../../../assets/setup-studio/channels/facebook.svg";
import tiktokIcon from "../../../assets/setup-studio/channels/tiktok.svg";
import youtubeIcon from "../../../assets/setup-studio/channels/youtube.svg";
import whatsappIcon from "../../../assets/setup-studio/channels/whatsapp.svg";

function s(v) {
  return String(v ?? "").replace(/\u00a0/g, " ").trim();
}

function arr(v, d = []) {
  return Array.isArray(v) ? v : d;
}

function obj(v, d = {}) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : d;
}

function lower(v) {
  return s(v).toLowerCase();
}

function uniqueStrings(list = []) {
  return [...new Set(arr(list).map((item) => s(item)).filter(Boolean))];
}

const SOURCE_OPTIONS = [
  {
    key: "website",
    label: "Website",
    icon: websiteIcon,
    mode: "link",
    placeholder: "yourbusiness.com",
    title: "Add your website",
    description:
      "Paste the main website URL. This helps build the first draft from the most reliable public source.",
    actionLabel: "Add website",
    connectLabel: "",
    tone: "from-sky-400/25 via-cyan-300/10 to-transparent",
  },
  {
    key: "google_maps",
    label: "Google Maps",
    icon: googleMapsIcon,
    mode: "link",
    placeholder: "Paste a Google Maps link",
    title: "Add your Google Maps source",
    description:
      "Paste the Maps link for the business location. This helps with local identity and contact details.",
    actionLabel: "Add Maps link",
    connectLabel: "",
    tone: "from-emerald-400/25 via-lime-300/10 to-transparent",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: instagramIcon,
    mode: "hybrid",
    placeholder: "instagram.com/yourbrand",
    title: "Add or connect Instagram",
    description:
      "Add the profile link now, or use Connect as the future direct sign-in flow.",
    actionLabel: "Add profile link",
    connectLabel: "Connect",
    tone: "from-pink-400/25 via-fuchsia-300/10 to-transparent",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: linkedinIcon,
    mode: "hybrid",
    placeholder: "linkedin.com/company/yourbrand",
    title: "Add or connect LinkedIn",
    description:
      "Use the company page link, or keep Connect ready for the future auth flow.",
    actionLabel: "Add page link",
    connectLabel: "Connect",
    tone: "from-sky-400/25 via-blue-300/10 to-transparent",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: facebookIcon,
    mode: "hybrid",
    placeholder: "facebook.com/yourbrand",
    title: "Add or connect Facebook",
    description:
      "Use the public page link now. Connect can be wired later for the real source sync.",
    actionLabel: "Add page link",
    connectLabel: "Connect",
    tone: "from-blue-400/25 via-indigo-300/10 to-transparent",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: tiktokIcon,
    mode: "link",
    placeholder: "tiktok.com/@yourbrand",
    title: "Add your TikTok profile",
    description:
      "Paste the TikTok profile link if the business publishes short-form content there.",
    actionLabel: "Add TikTok link",
    connectLabel: "",
    tone: "from-slate-500/20 via-slate-300/10 to-transparent",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: youtubeIcon,
    mode: "link",
    placeholder: "youtube.com/@yourbrand",
    title: "Add your YouTube channel",
    description:
      "Paste the channel link if the business publishes videos, explainers, or brand content.",
    actionLabel: "Add channel link",
    connectLabel: "",
    tone: "from-rose-400/25 via-red-300/10 to-transparent",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: whatsappIcon,
    mode: "hybrid",
    placeholder: "wa.me/994xxxxxxxxx",
    title: "Add or connect WhatsApp",
    description:
      "Use a WhatsApp contact link now, or keep Connect ready for the future auth flow.",
    actionLabel: "Add WhatsApp link",
    connectLabel: "Connect",
    tone: "from-emerald-400/25 via-green-300/10 to-transparent",
  },
];

function sourceByKey(key = "") {
  return SOURCE_OPTIONS.find((item) => item.key === key) || SOURCE_OPTIONS[0];
}

function buildInitialSourceDrafts(discoveryForm = {}) {
  const sourceType = s(discoveryForm?.sourceType);
  const sourceValue = s(discoveryForm?.sourceValue || discoveryForm?.websiteUrl);

  if (!sourceType || !sourceValue) return {};

  return {
    [sourceType]: {
      value: sourceValue,
      mode: "link",
    },
  };
}

function looksLikeWebsite(v = "") {
  const x = s(v);
  if (!x) return false;
  if (/\s/.test(x) && !/^https?:\/\//i.test(x)) return false;

  return /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/i.test(x);
}

function detectInlineSource(raw = "") {
  const text = s(raw);
  if (!text) return null;

  const patterns = [
    {
      type: "instagram",
      regex:
        /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[^\s,]+|(^|[\s(])@[a-z0-9._]{2,}\b/i,
      normalize(match) {
        return s(match).replace(/^[\s(]+/, "");
      },
    },
    {
      type: "linkedin",
      regex: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,]+/i,
    },
    {
      type: "facebook",
      regex: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^\s,]+/i,
    },
    {
      type: "tiktok",
      regex: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/[^\s,]+/i,
    },
    {
      type: "youtube",
      regex: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s,]+/i,
    },
    {
      type: "whatsapp",
      regex: /(?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com)\/[^\s,]+/i,
    },
    {
      type: "google_maps",
      regex:
        /(?:https?:\/\/)?(?:www\.)?(?:maps\.app\.goo\.gl|maps\.google\.[^\s/]+|goo\.gl\/maps)\/?[^\s,]*|google maps/i,
    },
    {
      type: "website",
      regex:
        /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s,]*)?/i,
    },
  ];

  for (const item of patterns) {
    const match = text.match(item.regex);
    if (!match) continue;

    const value = s(
      typeof item.normalize === "function" ? item.normalize(match[0]) : match[0]
    );

    if (!value) continue;
    if (item.type === "website" && /@/.test(value)) continue;

    return {
      sourceType: item.type,
      sourceValue: value,
      fullMatch: match[0],
    };
  }

  return null;
}

function pickPrimaryAttachedSource(sourceDrafts = {}) {
  for (const item of SOURCE_OPTIONS) {
    const record = obj(sourceDrafts[item.key]);
    if (s(record.value)) {
      return {
        sourceType: item.key,
        sourceValue: s(record.value),
        mode: lower(record.mode || "link"),
      };
    }
  }

  return null;
}

function buildInterpretation(raw = "", sourceDrafts = {}) {
  const text = s(raw);
  const primaryAttached = pickPrimaryAttachedSource(sourceDrafts);

  if (primaryAttached?.sourceValue) {
    return {
      sourceType: primaryAttached.sourceType,
      sourceValue: primaryAttached.sourceValue,
      websiteUrl:
        primaryAttached.sourceType === "website" ? primaryAttached.sourceValue : "",
      note: text,
      description: text,
      summary: text
        ? `Will scan ${sourceLabel(primaryAttached.sourceType)} and use your description.`
        : `Will scan ${sourceLabel(primaryAttached.sourceType)}.`,
    };
  }

  if (!text) {
    return {
      sourceType: "",
      sourceValue: "",
      websiteUrl: "",
      note: "",
      description: "",
      summary: "Describe the business or add a source to begin.",
    };
  }

  const inlineSource = detectInlineSource(text);

  if (inlineSource?.sourceValue) {
    const note = s(
      text
        .replace(inlineSource.fullMatch, " ")
        .replace(/^[,;:\-\s]+/, "")
        .replace(/\s{2,}/g, " ")
    );

    return {
      sourceType: inlineSource.sourceType,
      sourceValue: inlineSource.sourceValue,
      websiteUrl:
        inlineSource.sourceType === "website" ? inlineSource.sourceValue : "",
      note,
      description: note,
      summary: note
        ? `Will scan ${sourceLabel(inlineSource.sourceType)} and use your description.`
        : `Will scan ${sourceLabel(inlineSource.sourceType)}.`,
    };
  }

  return {
    sourceType: "",
    sourceValue: "",
    websiteUrl: "",
    note: text,
    description: text,
    summary: "Will build the first draft from your description.",
  };
}

function sourceLabel(type = "") {
  const x = lower(type);

  if (x === "website") return "Website";
  if (x === "google_maps") return "Google Maps";
  if (x === "instagram") return "Instagram";
  if (x === "linkedin") return "LinkedIn";
  if (x === "facebook") return "Facebook";
  if (x === "tiktok") return "TikTok";
  if (x === "youtube") return "YouTube";
  if (x === "whatsapp") return "WhatsApp";
  return "your source";
}

function SourceChip({ source, active = false, onClick, value = "", mode = "" }) {
  const hasValue = !!s(value);
  const isConnect = lower(mode) === "connect";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[20px] border px-4 py-3 text-left transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-[0_16px_34px_rgba(15,23,42,.18)]"
          : "border-slate-200/90 bg-white/84 text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,.05)] hover:-translate-y-[1px] hover:border-slate-300 hover:bg-white"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-gradient-to-r ${source.tone}`}
      />
      <div className="relative z-10 flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${
            active
              ? "border-white/15 bg-white/10"
              : "border-slate-200 bg-white/90"
          }`}
        >
          <img
            src={source.icon}
            alt={source.label}
            className="h-5 w-5 object-contain"
          />
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-semibold">{source.label}</span>
          <span
            className={`mt-0.5 block truncate text-[12px] ${
              active ? "text-white/70" : "text-slate-500"
            }`}
          >
            {hasValue
              ? value
              : isConnect
                ? "Connect selected"
                : "Add source"}
          </span>
        </span>
      </div>
    </button>
  );
}

function SavedBadge({ source, record }) {
  const value = s(record?.value);
  const mode = lower(record?.mode);

  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200/90 bg-white/85 px-3 py-2 text-[12px] text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,.04)]">
      <img src={source.icon} alt={source.label} className="h-4 w-4 object-contain" />
      <span className="font-medium text-slate-700">{source.label}</span>
      <span className="truncate">
        {value || (mode === "connect" ? "Connect selected" : "Added")}
      </span>
    </div>
  );
}

function SourceModal({
  source,
  value,
  onChange,
  onClose,
  onSaveLink,
  onConnect,
}) {
  if (!source) return null;

  const showConnect = source.mode === "hybrid";
  const hasValue = !!s(value);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,.24)] px-4 py-6 backdrop-blur-[12px]"
      >
        <button
          type="button"
          aria-label="Close source panel"
          className="absolute inset-0"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.985 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,.94),rgba(250,252,255,.88))] shadow-[0_28px_80px_rgba(15,23,42,.18)]"
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-br ${source.tone}`}
            />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
          </div>

          <div className="relative z-10 p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,.06)]">
                  <img
                    src={source.icon}
                    alt={source.label}
                    className="h-7 w-7 object-contain"
                  />
                </span>

                <div className="min-w-0">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Source
                  </div>
                  <h3 className="mt-2 text-[28px] font-semibold leading-[1] tracking-[-0.05em] text-slate-950">
                    {source.title}
                  </h3>
                  <p className="mt-3 max-w-[420px] text-[14px] leading-7 text-slate-600">
                    {source.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_10px_26px_rgba(15,23,42,.04)]">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {showConnect ? "Add link or connect" : "Add source link"}
              </div>

              <div className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3.5">
                <Link2 className="h-4 w-4 text-slate-400" />
                <input
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={source.placeholder}
                  className="h-full w-full border-0 bg-transparent p-0 text-[15px] text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0"
                  autoFocus
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onSaveLink}
                  disabled={!hasValue}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(15,23,42,.14)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {source.actionLabel}
                </button>

                {showConnect ? (
                  <button
                    type="button"
                    onClick={onConnect}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  >
                    {source.connectLabel}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-transparent px-3 text-sm font-medium text-slate-500 transition hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function SetupStudioEntryStage({
  importingWebsite = false,
  discoveryForm,
  businessForm,
  manualSections,
  onSetBusinessField,
  onSetManualSection,
  onSetDiscoveryField,
  onContinueFlow,
}) {
  const [composerValue, setComposerValue] = useState(
    s(discoveryForm?.note || businessForm?.description)
  );
  const [sourceDrafts, setSourceDrafts] = useState(
    buildInitialSourceDrafts(discoveryForm)
  );
  const [activeSourceKey, setActiveSourceKey] = useState("");
  const [modalValue, setModalValue] = useState("");

  const activeSource = useMemo(
    () => SOURCE_OPTIONS.find((item) => item.key === activeSourceKey) || null,
    [activeSourceKey]
  );

  const interpretation = useMemo(() => {
    return buildInterpretation(composerValue, sourceDrafts);
  }, [composerValue, sourceDrafts]);

  const attachedSourceCount = useMemo(() => {
    return SOURCE_OPTIONS.filter((item) => {
      const record = obj(sourceDrafts[item.key]);
      return !!(s(record.value) || lower(record.mode) === "connect");
    }).length;
  }, [sourceDrafts]);

  const hasRealSource = !!s(interpretation.sourceValue);
  const canContinue = !!(s(composerValue) || hasRealSource);

  useEffect(() => {
    if (!activeSource) return;

    const previous = obj(sourceDrafts[activeSource.key]);
    setModalValue(s(previous.value));
  }, [activeSource, sourceDrafts]);

  useEffect(() => {
    if (!activeSourceKey) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [activeSourceKey]);

  function syncState(nextText = composerValue, nextDrafts = sourceDrafts) {
    const next = buildInterpretation(nextText, nextDrafts);

    onSetDiscoveryField?.("sourceType", next.sourceType || "");
    onSetDiscoveryField?.("sourceValue", next.sourceValue || "");
    onSetDiscoveryField?.("websiteUrl", next.websiteUrl || "");
    onSetDiscoveryField?.("note", next.note || "");

    onSetBusinessField?.("websiteUrl", next.websiteUrl || "");
    onSetBusinessField?.("description", next.description || "");

    if (!nextText) {
      onSetManualSection?.("servicesText", s(manualSections?.servicesText || ""));
      onSetManualSection?.("faqsText", s(manualSections?.faqsText || ""));
      onSetManualSection?.("policiesText", s(manualSections?.policiesText || ""));
    }
  }

  function handleComposerChange(nextText) {
    setComposerValue(nextText);
    syncState(nextText, sourceDrafts);
  }

  function openSourceModal(sourceKey) {
    setActiveSourceKey(sourceKey);
  }

  function closeSourceModal() {
    setActiveSourceKey("");
    setModalValue("");
  }

  function handleSaveSourceLink() {
    if (!activeSource) return;
    const nextValue = s(modalValue);
    if (!nextValue) return;

    const nextDrafts = {
      ...sourceDrafts,
      [activeSource.key]: {
        value: nextValue,
        mode: "link",
      },
    };

    setSourceDrafts(nextDrafts);
    syncState(composerValue, nextDrafts);
    closeSourceModal();
  }

  function handleConnectSelection() {
    if (!activeSource) return;

    const nextDrafts = {
      ...sourceDrafts,
      [activeSource.key]: {
        value: "",
        mode: "connect",
      },
    };

    setSourceDrafts(nextDrafts);
    closeSourceModal();
  }

  function handleContinue() {
    flushSync(() => {
      syncState(composerValue, sourceDrafts);
    });

    onContinueFlow?.();
  }

  return (
    <>
      <section className="w-full py-6 sm:py-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="max-w-[860px] text-center"
          >
            <div className="inline-flex items-center rounded-full border border-white/80 bg-white/86 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,.05)]">
              Ready to scan
            </div>

            <h1 className="mt-7 text-[44px] font-semibold leading-[0.94] tracking-[-0.07em] text-slate-950 sm:text-[58px] lg:text-[76px]">
              Build the first business draft.
            </h1>

            <p className="mx-auto mt-5 max-w-[760px] text-[15px] leading-7 text-slate-600 sm:text-[17px]">
              Describe your business in any language. You can also add a website,
              Maps, or social source and let the system structure the first draft
              for you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.04 }}
            className="relative mt-12 w-full max-w-[920px]"
          >
            <div className="pointer-events-none absolute inset-x-[12%] -bottom-10 h-28 rounded-full bg-[radial-gradient(circle,_rgba(90,255,190,.22)_0%,_rgba(113,216,255,.18)_30%,_rgba(113,216,255,0)_74%)] blur-2xl" />

            <div className="relative overflow-hidden rounded-[36px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,.9),rgba(248,250,252,.82))] shadow-[0_30px_90px_rgba(15,23,42,.10)] backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[8%] top-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(255,186,112,.18)_0%,_rgba(255,186,112,0)_72%)] blur-2xl" />
                <div className="absolute left-[8%] bottom-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(114,184,255,.12)_0%,_rgba(114,184,255,0)_70%)] blur-2xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
              </div>

              <div className="relative z-10 p-5 sm:p-6 lg:p-7">
                <div className="rounded-[30px] border border-slate-200/90 bg-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_18px_38px_rgba(15,23,42,.05)]">
                  <textarea
                    value={composerValue}
                    onChange={(e) => handleComposerChange(e.target.value)}
                    rows={6}
                    placeholder="Describe your business in any language..."
                    className="min-h-[230px] w-full resize-none border-0 bg-transparent px-5 py-5 text-[17px] leading-8 text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0 sm:px-6 sm:py-6"
                  />

                  <div className="flex flex-col gap-4 border-t border-slate-200/80 px-5 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-slate-700">
                        {interpretation.summary}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-slate-500">
                        Sources are optional. Start with text only, or add a source
                        below.
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canContinue || importingWebsite}
                      onClick={handleContinue}
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-[0_16px_34px_rgba(15,23,42,.16)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {importingWebsite ? "Building draft..." : "Build draft"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Add a source
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {SOURCE_OPTIONS.map((source) => {
                      const record = obj(sourceDrafts[source.key]);
                      return (
                        <SourceChip
                          key={source.key}
                          source={source}
                          active={activeSourceKey === source.key}
                          value={record.value}
                          mode={record.mode}
                          onClick={() => openSourceModal(source.key)}
                        />
                      );
                    })}
                  </div>
                </div>

                {attachedSourceCount > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {SOURCE_OPTIONS.filter((source) => {
                      const record = obj(sourceDrafts[source.key]);
                      return !!(s(record.value) || lower(record.mode) === "connect");
                    }).map((source) => (
                      <SavedBadge
                        key={source.key}
                        source={source}
                        record={sourceDrafts[source.key]}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-slate-500">
                  {uniqueStrings([
                    "Website",
                    "Google Maps",
                    "Instagram",
                    "LinkedIn",
                    "Facebook",
                    "TikTok",
                    "YouTube",
                    "WhatsApp",
                  ]).map((item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {activeSource ? (
          <SourceModal
            source={activeSource}
            value={modalValue}
            onChange={setModalValue}
            onClose={closeSourceModal}
            onSaveLink={handleSaveSourceLink}
            onConnect={handleConnectSelection}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}