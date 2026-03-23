// src/features/setup-studio/stages/SetupStudioEntryStage.jsx
import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Link2,
  Paperclip,
  ShoppingBag,
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

function lower(v) {
  return s(v).toLowerCase();
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
  },
];

const CHIP_ROWS = [
  ["website", "google_maps", "instagram", "linkedin"],
  ["facebook", "tiktok", "youtube", "whatsapp"],
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

function cleanComposerText(raw = "", sourceDrafts = {}) {
  let text = s(raw);

  if (!text) return "";

  text = text.replace(
    /find local businesses,\s*view maps and get driving directions in google maps\.?/gi,
    " "
  );

  for (const source of SOURCE_OPTIONS) {
    const label = s(source.label);
    const record = obj(sourceDrafts[source.key]);
    const value = s(record.value);

    if (value) {
      text = text.split(value).join(" ");
    }

    if (lower(text) === lower(label)) {
      text = "";
    }
  }

  text = text
    .replace(/\s{2,}/g, " ")
    .replace(/^[,;:\-\s]+/, "")
    .replace(/[,:;\-\s]+$/, "")
    .trim();

  return text;
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

function pickPrimaryAttachedSource(sourceDrafts = {}) {
  for (const item of SOURCE_OPTIONS) {
    const record = obj(sourceDrafts[item.key]);

    if (s(record.value)) {
      return {
        sourceType: item.key,
        sourceValue: s(record.value),
      };
    }
  }

  return null;
}

function buildInterpretation(raw = "", sourceDrafts = {}) {
  const cleaned = cleanComposerText(raw, sourceDrafts);
  const attached = pickPrimaryAttachedSource(sourceDrafts);

  if (attached?.sourceValue) {
    return {
      sourceType: attached.sourceType,
      sourceValue: attached.sourceValue,
      websiteUrl: attached.sourceType === "website" ? attached.sourceValue : "",
      note: cleaned,
      description: cleaned,
    };
  }

  const inlineSource = detectInlineSource(cleaned);

  if (inlineSource?.sourceValue) {
    const note = s(
      cleaned
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
    };
  }

  return {
    sourceType: "",
    sourceValue: "",
    websiteUrl: "",
    note: cleaned,
    description: cleaned,
  };
}

function NeoxWordmark() {
  return (
    <div className="inline-flex select-none items-center justify-center">
      <div
        style={DISPLAY_FONT_STYLE}
        className="inline-flex items-center gap-[6px] text-[34px] font-extrabold leading-none tracking-[-0.075em] sm:text-[38px] lg:text-[42px]"
      >
        <span className="bg-[linear-gradient(90deg,#1e3a8a_0%,#2563eb_34%,#22d3ee_72%,#14b8a6_100%)] bg-clip-text text-transparent">
          NEOX
        </span>
        <span className="bg-[linear-gradient(90deg,#334155_0%,#475569_44%,#0f766e_100%)] bg-clip-text text-transparent">
          AI Studio
        </span>
      </div>
    </div>
  );
}

function SourceChip({ source, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[50px] items-center justify-center gap-2.5 rounded-full border border-white/85 bg-[rgba(255,255,255,.66)] px-5 text-[15px] font-normal tracking-[-0.03em] text-[rgba(31,41,55,.76)] shadow-[0_10px_24px_-20px_rgba(15,23,42,.24)] backdrop-blur-[10px] transition hover:bg-[rgba(255,255,255,.82)]"
    >
      <img
        src={source.icon}
        alt={source.label}
        className="h-[15px] w-[15px] object-contain"
      />
      <span>{source.label}</span>
    </button>
  );
}

function SourcePickerModal({ onClose, onChoose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(15,23,42,.16)] px-4 py-6 backdrop-blur-[12px]"
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
        className="relative z-10 w-full max-w-[720px] rounded-[32px] border border-white/80 bg-[rgba(248,248,248,.94)] p-6 shadow-[0_28px_70px_-34px_rgba(15,23,42,.24)] backdrop-blur-[14px] sm:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Sources
            </div>
            <h3
              style={DISPLAY_FONT_STYLE}
              className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-slate-950"
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

  const showConnect = source.mode === "hybrid";
  const hasValue = !!s(value);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-[rgba(15,23,42,.16)] px-4 py-6 backdrop-blur-[12px]"
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
        className="relative z-10 w-full max-w-[560px] rounded-[32px] border border-white/80 bg-[rgba(248,248,248,.95)] p-6 shadow-[0_28px_70px_-34px_rgba(15,23,42,.24)] backdrop-blur-[14px] sm:p-7"
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
                className="mt-2 text-[28px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950"
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
          <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(19,28,45,.08)] bg-white/88 px-4 py-4">
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
    cleanComposerText(
      s(discoveryForm?.note || businessForm?.description),
      buildInitialSourceDrafts(discoveryForm)
    )
  );
  const [sourceDrafts, setSourceDrafts] = useState(() =>
    buildInitialSourceDrafts(discoveryForm)
  );
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [activeSourceKey, setActiveSourceKey] = useState("");
  const [modalValue, setModalValue] = useState("");

  const activeSource = useMemo(() => sourceByKey(activeSourceKey), [activeSourceKey]);

  const interpretation = useMemo(() => {
    return buildInterpretation(composerValue, sourceDrafts);
  }, [composerValue, sourceDrafts]);

  const hasRealSource = !!s(interpretation.sourceValue);
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

    const nextComposer = cleanComposerText(composerValue, nextDrafts);

    setSourceDrafts(nextDrafts);
    setComposerValue(nextComposer);
    syncState(nextComposer, nextDrafts);
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

    const nextComposer = cleanComposerText(composerValue, nextDrafts);

    setSourceDrafts(nextDrafts);
    setComposerValue(nextComposer);
    syncState(nextComposer, nextDrafts);
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
          <div className="absolute right-[-8%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(196,235,230,.24)_0%,_rgba(196,235,230,0)_70%)] blur-3xl" />
          <div className="absolute right-[16%] top-[18%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,_rgba(186,242,255,.18)_0%,_rgba(186,242,255,0)_70%)] blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-screen items-start justify-center px-4 pb-10 pt-[78px] sm:px-6 lg:px-8">
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
                className="mx-auto mt-6 max-w-[1040px] text-center text-[33px] font-semibold leading-[1.14] tracking-[-0.055em] text-[rgba(17,24,39,.96)] sm:text-[38px] lg:text-[44px]"
              >
                All tasks in one ask, smart sourcing with AI
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.04 }}
              className="relative mx-auto mt-11 w-full max-w-[1000px]"
            >
              <div className="pointer-events-none absolute left-1/2 top-full h-[48px] w-[60%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(102,255,191,.22)_0%,_rgba(137,228,255,.15)_42%,_rgba(137,228,255,0)_78%)] blur-[20px]" />

              <div className="relative overflow-hidden rounded-[30px] border border-[rgba(17,24,39,.10)] bg-[rgba(248,248,248,.90)] shadow-[0_18px_44px_-28px_rgba(15,23,42,.18)] backdrop-blur-[12px]">
                <textarea
                  value={composerValue}
                  onChange={(e) => handleComposerChange(e.target.value)}
                  rows={4}
                  placeholder="Describe your needs..."
                  className="min-h-[136px] w-full resize-none border-0 bg-transparent px-[22px] pt-[21px] text-[16px] font-normal leading-7 tracking-[-0.03em] text-slate-900 outline-none shadow-none placeholder:text-[rgba(107,114,128,.82)] focus:ring-0 sm:text-[17px]"
                />

                <div className="flex items-center justify-between px-4 pb-4 pt-0 sm:px-[16px]">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={openSourcePicker}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(17,24,39,.12)] bg-[rgba(255,255,255,.52)] text-[rgba(31,41,55,.82)] shadow-[0_8px_24px_-18px_rgba(15,23,42,.22)] backdrop-blur-[8px] transition hover:bg-white"
                    >
                      <Paperclip className="h-[18px] w-[18px]" />
                    </button>

                    <button
                      type="button"
                      onClick={openSourcePicker}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(17,24,39,.12)] bg-[rgba(255,255,255,.52)] text-[rgba(31,41,55,.82)] shadow-[0_8px_24px_-18px_rgba(15,23,42,.22)] backdrop-blur-[8px] transition hover:bg-white"
                    >
                      <ShoppingBag className="h-[18px] w-[18px]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-transparent px-3 text-[15px] font-medium tracking-[-0.03em] text-[rgba(31,41,55,.88)]"
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
                          ? "bg-[rgba(17,24,39,.22)] text-white hover:bg-[rgba(17,24,39,.34)]"
                          : "bg-[rgba(17,24,39,.18)] text-white/90"
                      }`}
                    >
                      <ArrowRight className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-11 flex max-w-[980px] flex-col items-center gap-4">
                {CHIP_ROWS.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex flex-wrap items-center justify-center gap-4"
                  >
                    {row.map((key) => {
                      const source = sourceByKey(key);
                      if (!source) return null;

                      return (
                        <SourceChip
                          key={source.key}
                          source={source}
                          onClick={() => openSourceModal(source.key)}
                        />
                      );
                    })}
                  </div>
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