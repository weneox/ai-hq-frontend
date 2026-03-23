import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Globe2,
  Link2,
  Sparkles,
  X,
} from "lucide-react";

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

const SOURCE_OPTIONS = [
  {
    key: "website",
    label: "Website",
    icon: websiteIcon,
    mode: "link",
    placeholder: "yourbusiness.com",
    title: "Add your website",
    description:
      "Paste the main website URL for your business. This is usually the strongest public source for the first draft.",
    actionLabel: "Add website",
    connectLabel: "",
    tone: "from-sky-400/25 via-cyan-300/10 to-transparent",
  },
  {
    key: "google_maps",
    label: "Google Maps",
    icon: googleMapsIcon,
    mode: "link",
    placeholder: "Paste your Google Maps link",
    title: "Add your Google Maps source",
    description:
      "Paste the Google Maps link for your business. This helps with place identity and local business details.",
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
      "Paste the public Instagram profile link now. The connect action can later be wired to the real auth flow.",
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
      "Paste the company page link now. The connect action can later be wired to the real auth flow.",
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
      "Paste the public Facebook page link now. The connect action can later be wired to the real auth flow.",
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
      "Paste the public TikTok profile link if this is a real source for the business brand.",
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
      "Paste the channel link if the business publishes videos, explainers, or brand content there.",
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
      "Paste a WhatsApp link now. The connect action can later be wired to the real auth flow.",
    actionLabel: "Add WhatsApp link",
    connectLabel: "Connect",
    tone: "from-emerald-400/25 via-green-300/10 to-transparent",
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
  const text = s(raw);
  const attached = pickPrimaryAttachedSource(sourceDrafts);

  if (attached?.sourceValue) {
    return {
      sourceType: attached.sourceType,
      sourceValue: attached.sourceValue,
      websiteUrl: attached.sourceType === "website" ? attached.sourceValue : "",
      note: text,
      description: text,
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
    };
  }

  return {
    sourceType: "",
    sourceValue: "",
    websiteUrl: "",
    note: text,
    description: text,
  };
}

function SourcePill({ source, active = false, onClick, filled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,.16)]"
          : filled
            ? "border-slate-300 bg-white text-slate-900 shadow-[0_10px_26px_rgba(15,23,42,.06)]"
            : "border-white/80 bg-white/82 text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,.05)] hover:-translate-y-[1px] hover:bg-white"
      }`}
    >
      <img
        src={source.icon}
        alt={source.label}
        className="h-4 w-4 object-contain"
      />
      <span>{source.label}</span>
    </button>
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
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(15,23,42,.22)] px-4 py-6 backdrop-blur-[12px]"
    >
      <button
        type="button"
        aria-label="Close source modal"
        className="absolute inset-0"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.985 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,.95),rgba(249,251,254,.9))] shadow-[0_30px_90px_rgba(15,23,42,.18)]"
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
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_26px_rgba(15,23,42,.06)]">
                <img
                  src={source.icon}
                  alt={source.label}
                  className="h-7 w-7 object-contain"
                />
              </span>

              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Source
                </div>
                <h3 className="mt-2 text-[28px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950">
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
                className="inline-flex h-11 items-center justify-center rounded-full px-3 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
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
  const [composerValue, setComposerValue] = useState(
    s(discoveryForm?.note || businessForm?.description)
  );
  const [sourceDrafts, setSourceDrafts] = useState(
    buildInitialSourceDrafts(discoveryForm)
  );
  const [activeSourceKey, setActiveSourceKey] = useState("");
  const [modalValue, setModalValue] = useState("");

  const activeSource = useMemo(
    () => sourceByKey(activeSourceKey),
    [activeSourceKey]
  );

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

    onSetManualSection?.("servicesText", s(manualSections?.servicesText || ""));
    onSetManualSection?.("faqsText", s(manualSections?.faqsText || ""));
    onSetManualSection?.("policiesText", s(manualSections?.policiesText || ""));
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
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fb_48%,#eef5fb_100%)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-8%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(164,231,255,.18)_0%,_rgba(164,231,255,0)_68%)] blur-3xl" />
          <div className="absolute left-[-8%] bottom-[-12%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,_rgba(198,230,255,.16)_0%,_rgba(198,230,255,0)_70%)] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.18]" />
        </div>

        <div className="relative z-10 flex min-h-[100svh] w-full flex-col">
          <div className="flex items-center justify-end px-4 pb-0 pt-5 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 text-sm font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,.05)] transition hover:bg-white"
              >
                <Globe2 className="h-4 w-4" />
                English
                <ChevronDown className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-[0_16px_34px_rgba(15,23,42,.16)] transition hover:bg-slate-800"
              >
                Studio mode
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
            <div className="w-full max-w-[1050px]">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="text-center"
              >
                <div className="mx-auto w-fit rounded-full border border-white/80 bg-white/84 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-[0_10px_26px_rgba(15,23,42,.05)]">
                  Ready to scan
                </div>

                <div className="mt-8">
                  <div className="text-[38px] font-semibold leading-none tracking-[-0.06em] text-slate-950 sm:text-[52px]">
                    NEOX AI Studio
                  </div>

                  <p className="mx-auto mt-5 max-w-[800px] text-[24px] leading-tight tracking-[-0.03em] text-slate-900 sm:text-[34px]">
                    Describe your business in any language, then let AI build the
                    first business draft.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.04 }}
                className="relative mx-auto mt-10 w-full max-w-[940px]"
              >
                <div className="pointer-events-none absolute inset-x-[18%] -bottom-8 h-24 rounded-full bg-[radial-gradient(circle,_rgba(96,255,192,.22)_0%,_rgba(126,229,255,.18)_34%,_rgba(126,229,255,0)_74%)] blur-2xl" />

                <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,.90),rgba(249,252,255,.84))] shadow-[0_28px_80px_rgba(15,23,42,.10)] backdrop-blur-xl">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute right-[10%] top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(154,233,255,.14)_0%,_rgba(154,233,255,0)_72%)] blur-2xl" />
                    <div className="absolute left-[8%] bottom-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(126,211,255,.10)_0%,_rgba(126,211,255,0)_70%)] blur-2xl" />
                  </div>

                  <div className="relative z-10 p-4 sm:p-5">
                    <div className="overflow-hidden rounded-[28px] border border-slate-200/90 bg-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_16px_38px_rgba(15,23,42,.05)]">
                      <textarea
                        value={composerValue}
                        onChange={(e) => handleComposerChange(e.target.value)}
                        rows={5}
                        placeholder="Describe your business in any language..."
                        className="min-h-[180px] w-full resize-none border-0 bg-transparent px-5 py-5 text-[17px] leading-8 text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0 sm:px-6 sm:py-6"
                      />

                      <div className="flex flex-col gap-4 border-t border-slate-200/80 px-5 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_8px_20px_rgba(15,23,42,.04)] transition hover:border-slate-300 hover:text-slate-900"
                          >
                            <Link2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_8px_20px_rgba(15,23,42,.04)] transition hover:border-slate-300 hover:text-slate-900"
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,.04)]">
                            Draft
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          </div>

                          <button
                            type="button"
                            disabled={!canContinue || importingWebsite}
                            onClick={handleContinue}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_16px_34px_rgba(15,23,42,.16)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      {SOURCE_OPTIONS.map((source) => {
                        const record = obj(sourceDrafts[source.key]);
                        const filled =
                          !!s(record.value) || lower(record.mode) === "connect";

                        return (
                          <SourcePill
                            key={source.key}
                            source={source}
                            active={activeSourceKey === source.key}
                            filled={filled}
                            onClick={() => openSourceModal(source.key)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

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