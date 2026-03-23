// src/features/setup-studio/stages/SetupStudioEntryStage.jsx
import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Link2,
  Paperclip,
  Plus,
  X,
  Zap,
} from "lucide-react";

import websiteIcon from "../../../assets/setup-studio/channels/weblink.webp";
import googleMapsIcon from "../../../assets/setup-studio/channels/google-maps.svg";
import instagramIcon from "../../../assets/setup-studio/channels/instagram.svg";
import linkedinIcon from "../../../assets/setup-studio/channels/linkedin.svg";
import facebookIcon from "../../../assets/setup-studio/channels/facebook.svg";
import tiktokIcon from "../../../assets/setup-studio/channels/tiktok.svg";
import youtubeIcon from "../../../assets/setup-studio/channels/youtube.svg";
import whatsappIcon from "../../../assets/setup-studio/channels/whatsapp.svg";

const DISPLAY_FONT_STYLE = {
  fontFamily: '"Sora", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
};

function s(v) {
  return String(v ?? "").replace(/\u00a0/g, " ").trim();
}

function obj(v, d = {}) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : d;
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SOURCE_OPTIONS = [
  {
    key: "website",
    label: "Website",
    icon: websiteIcon,
    mode: "link",
    placeholder: "yourbusiness.com",
    title: "Add your website",
    description: "Paste the main website URL.",
    actionLabel: "Add website",
    connectLabel: "",
    themeClass: "theme-website",
  },
  {
    key: "google_maps",
    label: "Google Maps",
    icon: googleMapsIcon,
    mode: "link",
    placeholder: "Paste your Google Maps link",
    title: "Add your Google Maps source",
    description: "Paste your business Google Maps link.",
    actionLabel: "Add Maps link",
    connectLabel: "",
    themeClass: "theme-google-maps",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: instagramIcon,
    mode: "hybrid",
    placeholder: "instagram.com/yourbrand",
    title: "Add or connect Instagram",
    description: "Paste the public profile link or connect later.",
    actionLabel: "Add profile link",
    connectLabel: "Connect",
    themeClass: "theme-instagram",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: linkedinIcon,
    mode: "hybrid",
    placeholder: "linkedin.com/company/yourbrand",
    title: "Add or connect LinkedIn",
    description: "Paste the company page link or connect later.",
    actionLabel: "Add page link",
    connectLabel: "Connect",
    themeClass: "theme-linkedin",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: facebookIcon,
    mode: "hybrid",
    placeholder: "facebook.com/yourbrand",
    title: "Add or connect Facebook",
    description: "Paste the page link or connect later.",
    actionLabel: "Add page link",
    connectLabel: "Connect",
    themeClass: "theme-facebook",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: tiktokIcon,
    mode: "link",
    placeholder: "tiktok.com/@yourbrand",
    title: "Add your TikTok profile",
    description: "Paste the public TikTok profile link.",
    actionLabel: "Add TikTok link",
    connectLabel: "",
    themeClass: "theme-tiktok",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: youtubeIcon,
    mode: "link",
    placeholder: "youtube.com/@yourbrand",
    title: "Add your YouTube channel",
    description: "Paste the public channel link.",
    actionLabel: "Add channel link",
    connectLabel: "",
    themeClass: "theme-youtube",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: whatsappIcon,
    mode: "hybrid",
    placeholder: "wa.me/994xxxxxxxxx",
    title: "Add or connect WhatsApp",
    description: "Paste your WhatsApp link or connect later.",
    actionLabel: "Add WhatsApp link",
    connectLabel: "Connect",
    themeClass: "theme-whatsapp",
  },
];

function sourceByKey(key = "") {
  return SOURCE_OPTIONS.find((item) => item.key === key) || null;
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
        /(?:https?:\/\/)?(?:www\.)?(?:maps\.app\.goo\.gl|maps\.google\.[^\s/]+|goo\.gl\/maps)\/?[^\s,]*/i,
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

function sourceDraftValues(sourceDrafts = {}) {
  return Object.values(sourceDrafts)
    .map((item) => s(obj(item).value))
    .filter(Boolean);
}

function stripKnownSourceBits(raw = "", sourceDrafts = {}) {
  let text = s(raw);
  if (!text) return "";

  const exactLabelMatch = SOURCE_OPTIONS.some(
    (item) => text.toLowerCase() === item.label.toLowerCase()
  );
  if (exactLabelMatch) return "";

  for (const value of sourceDraftValues(sourceDrafts)) {
    const escaped = escapeRegExp(value);
    text = text.replace(new RegExp(escaped, "gi"), " ");
  }

  const inlinePatterns = [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[^\s,]+/gi,
    /(^|[\s(])@[a-z0-9._]{2,}\b/gi,
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,]+/gi,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^\s,]+/gi,
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/[^\s,]+/gi,
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s,]+/gi,
    /(?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com)\/[^\s,]+/gi,
    /(?:https?:\/\/)?(?:www\.)?(?:maps\.app\.goo\.gl|maps\.google\.[^\s/]+|goo\.gl\/maps)\/?[^\s,]*/gi,
    /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s,]*)?/gi,
  ];

  for (const regex of inlinePatterns) {
    text = text.replace(regex, " ");
  }

  return text
    .replace(/\(\s*\)/g, " ")
    .replace(/\[\s*\]/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[,;:\-\s]+/, "")
    .replace(/[,;:\-\s]+$/, "")
    .trim();
}

function pickPrimaryAttachedSource(sourceDrafts = {}) {
  for (const item of SOURCE_OPTIONS) {
    const record = obj(sourceDrafts[item.key]);
    if (s(record.value) || s(record.mode) === "connect") {
      return {
        sourceType: item.key,
        sourceValue: s(record.value),
        mode: s(record.mode),
      };
    }
  }

  return null;
}

function buildInterpretation(raw = "", sourceDrafts = {}) {
  const cleanText = stripKnownSourceBits(raw, sourceDrafts);
  const attached = pickPrimaryAttachedSource(sourceDrafts);

  if (attached?.sourceType) {
    return {
      sourceType: attached.sourceType,
      sourceValue: attached.sourceValue,
      websiteUrl: attached.sourceType === "website" ? attached.sourceValue : "",
      note: cleanText,
      description: cleanText,
    };
  }

  const inlineSource = detectInlineSource(raw);

  if (inlineSource?.sourceValue) {
    const note = stripKnownSourceBits(
      raw.replace(inlineSource.fullMatch, " "),
      sourceDrafts
    );

    return {
      sourceType: inlineSource.sourceType,
      sourceValue: inlineSource.sourceValue,
      websiteUrl:
        inlineSource.sourceType === "website" ? inlineSource.sourceValue : "",
      note,
      description: note,
    };
  }

  return {
    sourceType: "",
    sourceValue: "",
    websiteUrl: "",
    note: cleanText,
    description: cleanText,
  };
}

function initialComposerSeed(discoveryForm = {}, businessForm = {}) {
  const drafts = buildInitialSourceDrafts(discoveryForm);
  return stripKnownSourceBits(
    s(discoveryForm?.note || businessForm?.description),
    drafts
  );
}

function sourceStatus(sourceDrafts = {}, sourceKey = "") {
  const record = obj(sourceDrafts[sourceKey]);
  if (s(record.value)) return "linked";
  if (s(record.mode) === "connect") return "connected";
  return "idle";
}

function NeoxWordmark() {
  return (
    <div className="inline-flex select-none items-center justify-center">
      <div
        style={DISPLAY_FONT_STYLE}
        className="inline-flex items-baseline gap-2 text-[34px] font-extrabold leading-none tracking-[-0.075em] sm:text-[40px] lg:text-[44px]"
      >
        <span className="bg-[linear-gradient(90deg,#0f172a_0%,#1d4ed8_42%,#0ea5e9_74%,#14b8a6_100%)] bg-clip-text text-transparent">
          NEOX
        </span>
        <span className="bg-[linear-gradient(90deg,#334155_0%,#475569_38%,#0f766e_100%)] bg-clip-text text-transparent">
          AI Studio
        </span>
      </div>
    </div>
  );
}

function SourceChipButton({ source, status = "idle", onClick }) {
  const active = status !== "idle";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${source.themeClass} inline-flex h-[46px] items-center justify-center gap-2.5 rounded-full border border-white/85 bg-[rgba(255,255,255,.66)] px-4 text-[14px] font-medium tracking-[-0.03em] text-[rgba(31,41,55,.76)] shadow-[0_10px_24px_-20px_rgba(15,23,42,.28)] backdrop-blur-[10px] transition hover:bg-[rgba(255,255,255,.82)] sm:h-[50px] sm:px-5 sm:text-[15px]`}
    >
      <img
        src={source.icon}
        alt={source.label}
        className="h-[17px] w-[17px] object-contain opacity-90"
      />
      <span>{source.label}</span>

      {active ? (
        <span className="inline-flex items-center justify-center">
          <span
            className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,.86)]"
            style={{ background: "var(--pill-accent)" }}
          />
        </span>
      ) : null}
    </button>
  );
}

function SourcePickerModal({ onClose, onChoose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(15,23,42,.14)] px-4 py-6 backdrop-blur-[12px]"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.985 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[760px] rounded-[30px] border border-white/80 bg-[rgba(248,248,248,.94)] p-6 shadow-[0_28px_70px_-34px_rgba(15,23,42,.24)] backdrop-blur-[14px] sm:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Sources
            </div>
            <h3
              style={DISPLAY_FONT_STYLE}
              className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[28px]"
            >
              Add a business source
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SOURCE_OPTIONS.map((source) => (
            <button
              key={source.key}
              type="button"
              onClick={() => onChoose(source.key)}
              className="inline-flex min-h-[84px] flex-col items-center justify-center gap-3 rounded-[22px] border border-white/80 bg-white/80 px-4 py-4 text-center shadow-[0_10px_24px_-20px_rgba(15,23,42,.28)] transition hover:bg-white"
            >
              <img
                src={source.icon}
                alt={source.label}
                className="h-6 w-6 object-contain"
              />
              <span className="text-[14px] font-medium tracking-[-0.03em] text-slate-800">
                {source.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SourceModal({
  source,
  value,
  onChange,
  onSaveLink,
  onConnect,
  onClose,
}) {
  if (!source) return null;

  const showConnect = source.mode === "hybrid" && !!s(source.connectLabel);
  const hasValue = !!s(value);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-[rgba(15,23,42,.14)] px-4 py-6 backdrop-blur-[12px]"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.985 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[560px] rounded-[30px] border border-white/80 bg-[rgba(248,248,248,.95)] p-6 shadow-[0_28px_70px_-34px_rgba(15,23,42,.24)] backdrop-blur-[14px] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] border border-slate-200 bg-white shadow-[0_10px_24px_-18px_rgba(15,23,42,.2)]">
              <img
                src={source.icon}
                alt={source.label}
                className="h-7 w-7 object-contain"
              />
            </span>

            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Source
              </div>
              <h3
                style={DISPLAY_FONT_STYLE}
                className="mt-2 text-[24px] font-semibold leading-[1.04] tracking-[-0.05em] text-slate-950 sm:text-[28px]"
              >
                {source.title}
              </h3>
              <p className="mt-3 text-[14px] leading-7 text-slate-600">
                {source.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3 rounded-[18px] border border-[rgba(19,28,45,.08)] bg-white/88 px-4 py-4">
            <Link2 className="h-4 w-4 text-slate-400" />
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={source.placeholder}
              className="h-full w-full border-0 bg-transparent p-0 text-[15px] text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0"
              autoFocus
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
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
              className="inline-flex h-11 items-center justify-center rounded-full px-3 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
  const [composerValue, setComposerValue] = useState(() =>
    initialComposerSeed(discoveryForm, businessForm)
  );
  const [sourceDrafts, setSourceDrafts] = useState(
    buildInitialSourceDrafts(discoveryForm)
  );
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [activeSourceKey, setActiveSourceKey] = useState("");
  const [modalValue, setModalValue] = useState("");

  const activeSource = useMemo(() => sourceByKey(activeSourceKey), [activeSourceKey]);

  const interpretation = useMemo(() => {
    return buildInterpretation(composerValue, sourceDrafts);
  }, [composerValue, sourceDrafts]);

  const hasRealSource = !!s(interpretation.sourceValue) || !!s(interpretation.sourceType);
  const canContinue = !!(s(composerValue) || hasRealSource);

  useEffect(() => {
    if (!activeSource) return;
    const prev = obj(sourceDrafts[activeSource.key]);
    setModalValue(s(prev.value));
  }, [activeSource, sourceDrafts]);

  useEffect(() => {
    if (!activeSourceKey && !sourcePickerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [activeSourceKey, sourcePickerOpen]);

  function syncState(nextText = composerValue, nextDrafts = sourceDrafts) {
    const next = buildInterpretation(nextText, nextDrafts);

    onSetDiscoveryField?.("sourceType", next.sourceType || "");
    onSetDiscoveryField?.("sourceValue", next.sourceValue || "");
    onSetDiscoveryField?.("websiteUrl", next.websiteUrl || "");
    onSetDiscoveryField?.("note", next.note || "");

    onSetBusinessField?.("websiteUrl", next.websiteUrl || "");
    onSetBusinessField?.("description", next.description || "");

    onSetManualSection?.("servicesText", s(manualSections?.servicesText || ""));
    onSetManualSection?.("faqsText", s(manualSections?.faqsText || ""));
    onSetManualSection?.("policiesText", s(manualSections?.policiesText || ""));
  }

  function handleComposerChange(nextText) {
    setComposerValue(nextText);
    syncState(nextText, sourceDrafts);
  }

  function openSourcePicker() {
    setSourcePickerOpen(true);
  }

  function closeSourcePicker() {
    setSourcePickerOpen(false);
  }

  function chooseSource(sourceKey) {
    setSourcePickerOpen(false);
    setActiveSourceKey(sourceKey);
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
    syncState(composerValue, nextDrafts);
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
      <section className="relative min-h-screen w-full overflow-hidden bg-transparent">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-8%] top-[-9%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(196,235,230,.28)_0%,_rgba(196,235,230,0)_70%)] blur-3xl" />
          <div className="absolute right-[16%] top-[22%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,_rgba(186,242,255,.18)_0%,_rgba(186,242,255,0)_70%)] blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-screen items-start justify-center px-4 pb-10 pt-[38px] sm:px-6 lg:px-8">
          <div className="w-full max-w-[1180px]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="text-center"
            >
              <NeoxWordmark />

              <h1
                style={DISPLAY_FONT_STYLE}
                className="mx-auto mt-4 max-w-[1060px] text-center text-[30px] font-semibold leading-[1.12] tracking-[-0.055em] text-[rgba(17,24,39,.96)] sm:text-[38px] lg:text-[46px]"
              >
                All your business context in one ask, shaped with AI
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.04 }}
              className="relative mx-auto mt-8 w-full max-w-[1002px]"
            >
              <div className="pointer-events-none absolute left-1/2 bottom-[-18px] h-[58px] w-[64%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(110,231,183,.28)_0%,_rgba(125,211,252,.18)_42%,_rgba(125,211,252,0)_74%)] blur-[22px]" />

              <div className="relative overflow-hidden rounded-[30px] border border-[rgba(17,24,39,.10)] bg-[rgba(248,248,248,.90)] shadow-[0_18px_44px_-28px_rgba(15,23,42,.18)] backdrop-blur-[12px]">
                <textarea
                  value={composerValue}
                  onChange={(e) => handleComposerChange(e.target.value)}
                  rows={4}
                  placeholder="Describe your business..."
                  className="min-h-[122px] w-full resize-none border-0 bg-transparent px-[22px] pt-[20px] text-[16px] font-normal leading-7 tracking-[-0.03em] text-slate-900 outline-none shadow-none placeholder:text-[rgba(107,114,128,.78)] focus:ring-0 sm:min-h-[132px] sm:text-[17px]"
                />

                <div className="flex items-center justify-between px-4 pb-4 pt-0 sm:px-[16px]">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={openSourcePicker}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(17,24,39,.12)] bg-[rgba(255,255,255,.52)] text-[rgba(31,41,55,.82)] shadow-[0_8px_24px_-18px_rgba(15,23,42,.20)] backdrop-blur-[8px] transition hover:bg-white"
                    >
                      <Paperclip className="h-[18px] w-[18px]" />
                    </button>

                    <button
                      type="button"
                      onClick={openSourcePicker}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(17,24,39,.12)] bg-[rgba(255,255,255,.52)] text-[rgba(31,41,55,.82)] shadow-[0_8px_24px_-18px_rgba(15,23,42,.20)] backdrop-blur-[8px] transition hover:bg-white"
                    >
                      <Plus className="h-[18px] w-[18px]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-transparent px-3 text-[15px] font-medium tracking-[-0.03em] text-[rgba(31,41,55,.88)] sm:text-[16px]"
                    >
                      <Zap className="h-[15px] w-[15px]" />
                      Fast
                      <ChevronDown className="h-[16px] w-[16px] text-[rgba(107,114,128,.82)]" />
                    </button>

                    <button
                      type="button"
                      disabled={!canContinue || importingWebsite}
                      onClick={handleContinue}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                        canContinue && !importingWebsite
                          ? "bg-slate-950 text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,.34)] hover:bg-slate-800"
                          : "bg-[rgba(17,24,39,.18)] text-white/90"
                      }`}
                    >
                      <ArrowRight className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-11 flex max-w-[1080px] flex-wrap items-center justify-center gap-4">
                {SOURCE_OPTIONS.map((source) => (
                  <SourceChipButton
                    key={source.key}
                    source={source}
                    status={sourceStatus(sourceDrafts, source.key)}
                    onClick={() => openSourceModal(source.key)}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {sourcePickerOpen ? (
          <SourcePickerModal
            onClose={closeSourcePicker}
            onChoose={chooseSource}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {activeSource ? (
          <SourceModal
            source={activeSource}
            value={modalValue}
            onChange={setModalValue}
            onSaveLink={handleSaveSourceLink}
            onConnect={handleConnectSelection}
            onClose={closeSourceModal}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}