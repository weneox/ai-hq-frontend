import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Link2, Mic, Square, X } from "lucide-react";

import websiteIcon from "../../../assets/setup-studio/channels/weblink.webp";
import googleMapsIcon from "../../../assets/setup-studio/channels/google-maps.svg";
import instagramIcon from "../../../assets/setup-studio/channels/instagram.svg";
import facebookIcon from "../../../assets/setup-studio/channels/facebook.svg";

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
    placeholder: "yourbusiness.com",
    title: "Website",
    description: "Paste the main business website.",
    actionLabel: "Save source",
  },
  {
    key: "google_maps",
    label: "Google Maps",
    icon: googleMapsIcon,
    placeholder: "Business name, city or Google Maps link",
    title: "Google Maps",
    description: "Paste a Maps link, or enter the business name with city.",
    actionLabel: "Save source",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: instagramIcon,
    placeholder: "@yourbrand or instagram.com/yourbrand",
    title: "Instagram",
    description: "Paste a public profile link or handle.",
    actionLabel: "Save source",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: facebookIcon,
    placeholder: "facebook.com/yourbrand",
    title: "Facebook",
    description: "Paste the public business page link.",
    actionLabel: "Save source",
  },
];

const VISIBLE_SOURCE_KEYS = ["website", "google_maps", "instagram", "facebook"];

function sourceByKey(key = "") {
  return SOURCE_OPTIONS.find((item) => item.key === key) || null;
}

function buildInitialSourceDrafts(discoveryForm = {}) {
  const sourceType = s(discoveryForm?.sourceType);
  const sourceValue = s(discoveryForm?.sourceValue || discoveryForm?.websiteUrl);

  if (!sourceType || !sourceValue) return {};
  if (!sourceByKey(sourceType)) return {};

  return {
    [sourceType]: {
      value: sourceValue,
      mode: "manual",
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
      type: "facebook",
      regex: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^\s,]+/i,
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
  for (const key of VISIBLE_SOURCE_KEYS) {
    const record = obj(sourceDrafts[key]);
    if (s(record.value)) {
      return {
        sourceType: key,
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

function appendText(base = "", addition = "") {
  const a = s(base);
  const b = s(addition);
  if (!a) return b;
  if (!b) return a;
  return `${a}${/[.!?]$/.test(a) ? " " : ". "}${b}`;
}

function NeoxWordmark() {
  return (
    <div className="inline-flex select-none items-center justify-center">
      <div
        style={DISPLAY_FONT_STYLE}
        className="inline-flex items-end gap-[8px] text-[34px] font-semibold leading-none tracking-[-0.075em] sm:text-[38px] lg:text-[42px]"
      >
        <span className="text-slate-950">NEOX</span>
        <span className="text-slate-700">AI Studio</span>
      </div>
    </div>
  );
}

function SourceChip({ source, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[58px] items-center justify-center gap-3 rounded-full border px-6 text-[15px] font-medium tracking-[-0.03em] backdrop-blur-[8px] transition ${
        active
          ? "border-slate-300 bg-white text-slate-950 shadow-[0_16px_32px_-24px_rgba(15,23,42,.22)]"
          : "border-white/90 bg-[rgba(255,255,255,.82)] text-slate-700 shadow-[0_14px_28px_-24px_rgba(15,23,42,.16)] hover:bg-white"
      }`}
    >
      <img
        src={source.icon}
        alt={source.label}
        className="h-[21px] w-[21px] object-contain"
      />
      <span>{source.label}</span>
      {active ? <Check className="h-[15px] w-[15px] text-slate-900" /> : null}
    </button>
  );
}

function SourceModal({
  source,
  value,
  hasExistingValue = false,
  onChange,
  onSave,
  onRemove,
  onClose,
}) {
  if (!source) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-[rgba(15,23,42,.14)] px-4 py-6 backdrop-blur-[10px]"
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
        className="relative z-10 w-full max-w-[560px] rounded-[30px] border border-white/80 bg-[rgba(250,250,250,.98)] p-6 shadow-[0_28px_70px_-34px_rgba(15,23,42,.24)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] border border-slate-200 bg-white shadow-[0_10px_24px_-18px_rgba(15,23,42,.18)]">
              <img
                src={source.icon}
                alt={source.label}
                className="h-7 w-7 object-contain"
              />
            </span>

            <div>
              <h3
                style={DISPLAY_FONT_STYLE}
                className="text-[28px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950"
              >
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(19,28,45,.08)] bg-white px-4 py-4">
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
              onClick={onSave}
              disabled={!s(value)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(15,23,42,.12)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {source.actionLabel}
            </button>

            {hasExistingValue ? (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
              >
                Remove
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
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const composerRef = useRef("");
  const sourceDraftsRef = useRef({});

  const [composerValue, setComposerValue] = useState(() =>
    cleanComposerText(
      s(discoveryForm?.note || businessForm?.description),
      buildInitialSourceDrafts(discoveryForm)
    )
  );
  const [sourceDrafts, setSourceDrafts] = useState(() =>
    buildInitialSourceDrafts(discoveryForm)
  );
  const [activeSourceKey, setActiveSourceKey] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [isComposerFocused, setIsComposerFocused] = useState(false);

  useEffect(() => {
    composerRef.current = composerValue;
  }, [composerValue]);

  useEffect(() => {
    sourceDraftsRef.current = sourceDrafts;
  }, [sourceDrafts]);

  const activeSource = useMemo(() => sourceByKey(activeSourceKey), [activeSourceKey]);

  const interpretation = useMemo(() => {
    return buildInterpretation(composerValue, sourceDrafts);
  }, [composerValue, sourceDrafts]);

  const hasRealSource = !!s(interpretation.sourceValue);
  const hasComposerContent = !!s(composerValue);
  const canContinue = !!(hasComposerContent || hasRealSource);
  const showGlow = isComposerFocused || hasComposerContent || isListening;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    setSpeechSupported(!!SpeechRecognition);

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

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

  function syncState(nextText = composerRef.current, nextDrafts = sourceDraftsRef.current) {
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
    syncState(nextText, sourceDraftsRef.current);
  }

  function openSourceModal(sourceKey) {
    setActiveSourceKey(sourceKey);
  }

  function closeSourceModal() {
    setActiveSourceKey("");
    setModalValue("");
  }

  function handleSaveSource() {
    if (!activeSource) return;
    const nextValue = s(modalValue);
    if (!nextValue) return;

    const nextDrafts = {
      ...sourceDraftsRef.current,
      [activeSource.key]: {
        value: nextValue,
        mode: "manual",
      },
    };

    const nextComposer = cleanComposerText(composerRef.current, nextDrafts);

    setSourceDrafts(nextDrafts);
    setComposerValue(nextComposer);
    syncState(nextComposer, nextDrafts);
    closeSourceModal();
  }

  function handleRemoveSource() {
    if (!activeSource) return;

    const nextDrafts = { ...sourceDraftsRef.current };
    delete nextDrafts[activeSource.key];

    const nextComposer = cleanComposerText(composerRef.current, nextDrafts);

    setSourceDrafts(nextDrafts);
    setComposerValue(nextComposer);
    syncState(nextComposer, nextDrafts);
    closeSourceModal();
  }

  function focusComposer() {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function startVoiceCapture() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Voice input is not available in this browser.");
      focusComposer();
      return;
    }

    setSpeechError("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      setIsComposerFocused(true);
    };

    recognition.onresult = (event) => {
      let nextFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = s(result?.[0]?.transcript);
        if (!transcript) continue;

        if (result.isFinal) {
          nextFinal = appendText(nextFinal, transcript);
        }
      }

      if (nextFinal) {
        finalTranscript = appendText(finalTranscript, nextFinal);
      }
    };

    recognition.onerror = (event) => {
      const code = s(event?.error);

      if (code && code !== "no-speech" && code !== "aborted") {
        setSpeechError("Voice input could not be completed. Please try again.");
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;

      if (s(finalTranscript)) {
        const nextText = appendText(composerRef.current, finalTranscript);
        setComposerValue(nextText);
        syncState(nextText, sourceDraftsRef.current);
      }

      focusComposer();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
      setSpeechError("Voice input could not be started in this browser.");
      focusComposer();
    }
  }

  function stopVoiceCapture() {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch {}

    recognitionRef.current = null;
    setIsListening(false);
  }

  function handleVoiceAction() {
    if (isListening) {
      stopVoiceCapture();
      return;
    }
    startVoiceCapture();
  }

  function handleContinue() {
    flushSync(() => {
      syncState(composerRef.current, sourceDraftsRef.current);
    });

    onContinueFlow?.();
  }

  return (
    <>
      <section className="w-full bg-transparent">
        <div className="mx-auto max-w-[1260px] px-4 py-[56px] sm:px-6 sm:py-[72px] lg:px-8 lg:py-[84px]">
          <div className="mx-auto w-full max-w-[1080px] text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              <NeoxWordmark />

              <h1
                style={DISPLAY_FONT_STYLE}
                className="mx-auto mt-7 max-w-[1220px] text-[34px] font-semibold leading-[1.08] tracking-[-0.065em] text-slate-950 sm:text-[42px] lg:text-[54px]"
              >
                Build your business draft from real signals.
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.04 }}
              className="relative mx-auto mt-10 w-full max-w-[1060px]"
            >
              <div className="pointer-events-none absolute left-1/2 top-[calc(100%-10px)] z-0 h-[180px] w-[78%] -translate-x-1/2">
                <div
                  className={`absolute left-1/2 top-0 h-[130px] w-[52%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(88,255,180,.34)_0%,_rgba(88,255,180,.14)_32%,_rgba(88,255,180,0)_72%)] blur-[30px] transition-all duration-500 ${
                    showGlow ? "scale-100 opacity-100" : "scale-90 opacity-0"
                  }`}
                />
                <div
                  className={`absolute left-1/2 top-[8px] h-[160px] w-[82%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(120,232,255,.24)_0%,_rgba(120,232,255,.12)_36%,_rgba(120,232,255,0)_76%)] blur-[42px] transition-all duration-700 ${
                    showGlow ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  }`}
                />
                <div
                  className={`absolute left-1/2 top-[12px] h-[92px] w-[34%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,.58)_0%,_rgba(255,255,255,0)_74%)] blur-[18px] transition-all duration-500 ${
                    showGlow ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>

              <div className="relative z-10 overflow-hidden rounded-[30px] border border-[rgba(15,23,42,.08)] bg-[rgba(255,255,255,.94)] shadow-[0_18px_40px_-28px_rgba(15,23,42,.14)] backdrop-blur-[10px]">
                <textarea
                  ref={textareaRef}
                  value={composerValue}
                  onChange={(e) => handleComposerChange(e.target.value)}
                  onFocus={() => setIsComposerFocused(true)}
                  onBlur={() => setIsComposerFocused(false)}
                  rows={4}
                  placeholder="Tell us what this business does and what AI should understand first."
                  className="min-h-[146px] w-full resize-none border-0 bg-transparent px-[24px] pt-[22px] text-[16px] font-normal leading-7 tracking-[-0.03em] text-slate-900 outline-none shadow-none placeholder:text-[rgba(100,116,139,.9)] focus:ring-0 sm:text-[17px]"
                />

                <div className="flex items-center justify-between border-t border-[rgba(15,23,42,.06)] px-4 py-4 sm:px-[18px]">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={handleVoiceAction}
                      className={`inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full border px-4 text-[14px] font-medium tracking-[-0.03em] transition ${
                        isListening
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950"
                      }`}
                    >
                      {isListening ? (
                        <Square className="h-[15px] w-[15px] fill-current" />
                      ) : (
                        <Mic className="h-[16px] w-[16px]" />
                      )}
                      {isListening ? "Listening..." : "Use voice"}
                    </button>

                    <div className="hidden min-w-0 truncate text-[13px] text-slate-500 sm:block">
                      {isListening
                        ? "Describe the business naturally."
                        : speechSupported
                        ? "Speak for 10–20 seconds."
                        : "Voice works in supported browsers."}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canContinue || importingWebsite}
                    onClick={handleContinue}
                    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                      canContinue && !importingWebsite
                        ? "bg-[rgba(15,23,42,.18)] text-white hover:bg-[rgba(15,23,42,.30)]"
                        : "bg-[rgba(15,23,42,.10)] text-white"
                    }`}
                  >
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </button>
                </div>

                {speechError ? (
                  <div className="border-t border-[rgba(15,23,42,.06)] px-5 py-3 text-left text-[13px] text-rose-600">
                    {speechError}
                  </div>
                ) : null}
              </div>

              <div className="relative z-10 mx-auto mt-10 flex max-w-[860px] flex-wrap items-center justify-center gap-4">
                {VISIBLE_SOURCE_KEYS.map((key) => {
                  const source = sourceByKey(key);
                  if (!source) return null;

                  const isActive = !!s(obj(sourceDrafts[key]).value);

                  return (
                    <SourceChip
                      key={source.key}
                      source={source}
                      active={isActive}
                      onClick={() => openSourceModal(source.key)}
                    />
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeSource ? (
          <SourceModal
            source={activeSource}
            value={modalValue}
            hasExistingValue={!!s(obj(sourceDrafts[activeSource.key]).value)}
            onChange={setModalValue}
            onSave={handleSaveSource}
            onRemove={handleRemoveSource}
            onClose={closeSourceModal}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}