import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Link2,
  Loader2,
  Mic,
  PlugZap,
  Square,
  X,
} from "lucide-react";

import websiteIcon from "../../../assets/setup-studio/channels/weblink.webp";
import instagramIcon from "../../../assets/setup-studio/channels/instagram.svg";
import facebookIcon from "../../../assets/setup-studio/channels/facebook.svg";
import linkedinIcon from "../../../assets/setup-studio/channels/linkedin.svg";
import googleMapsIcon from "../../../assets/setup-studio/channels/google-maps.svg";
import {
  getMetaChannelStatus,
  getMetaConnectUrl,
} from "../../../api/settings.js";

const DISPLAY_FONT_STYLE = {
  fontFamily:
    '"Sora", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
};

const INPUT_RESET_STYLE = {
  all: "unset",
  flex: "1 1 auto",
  width: "100%",
  minWidth: 0,
  border: "0",
  outline: "0",
  boxShadow: "none",
  background: "transparent",
  color: "#0f172a",
  fontSize: "16px",
  lineHeight: "24px",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
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

function arr(v, d = []) {
  return Array.isArray(v) ? v : d;
}

function instagramProfileUrlFromChannel(channel = {}) {
  const username = s(channel?.external_username).replace(/^@+/, "");
  if (username) return `https://instagram.com/${username}`;
  return "";
}

function normalizeInstagramStatusPayload(raw = {}) {
  const channel = obj(raw?.channel);
  const connected =
    Boolean(raw?.connected) &&
    Boolean(raw?.hasToken) &&
    !!s(channel?.external_user_id || channel?.external_username || channel?.external_page_id);

  return {
    loading: false,
    connecting: false,
    connected,
    hasToken: Boolean(raw?.hasToken),
    username: s(channel?.external_username).replace(/^@+/, ""),
    profileUrl: instagramProfileUrlFromChannel(channel),
    displayName: s(channel?.display_name),
    externalUserId: s(channel?.external_user_id),
    externalPageId: s(channel?.external_page_id),
    channel,
    error: "",
  };
}

const SOURCE_OPTIONS = [
  {
    key: "website",
    label: "Website",
    icon: websiteIcon,
    placeholder: "yourbusiness.com",
    title: "Website",
    description: "Add the main business website.",
    actionLabel: "Save source",
    glow: "rgba(56,189,248,.34)",
    glowSoft: "rgba(125,211,252,.18)",
    tint: "rgba(56,189,248,.08)",
    border: "rgba(56,189,248,.22)",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: instagramIcon,
    placeholder: "@yourbrand or instagram.com/yourbrand",
    title: "Instagram",
    description: "Connect the real account, or add a public profile link manually.",
    actionLabel: "Save source",
    glow: "rgba(236,72,153,.26)",
    glowSoft: "rgba(251,191,36,.12)",
    tint: "rgba(236,72,153,.07)",
    border: "rgba(236,72,153,.18)",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: facebookIcon,
    placeholder: "facebook.com/yourbrand",
    title: "Facebook",
    description: "Add the public business page link.",
    actionLabel: "Save source",
    glow: "rgba(59,130,246,.26)",
    glowSoft: "rgba(147,197,253,.14)",
    tint: "rgba(59,130,246,.07)",
    border: "rgba(59,130,246,.18)",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: linkedinIcon,
    placeholder: "linkedin.com/company/yourbrand",
    title: "LinkedIn",
    description: "Add the company page link.",
    actionLabel: "Save source",
    glow: "rgba(14,165,233,.26)",
    glowSoft: "rgba(56,189,248,.14)",
    tint: "rgba(14,165,233,.07)",
    border: "rgba(14,165,233,.18)",
  },
  {
    key: "google_maps",
    label: "Google Maps",
    icon: googleMapsIcon,
    placeholder: "Business name, city or Maps link",
    title: "Google Maps",
    description: "Add a Maps link, or the business name with city.",
    actionLabel: "Save source",
    glow: "rgba(34,197,94,.28)",
    glowSoft: "rgba(250,204,21,.14)",
    tint: "rgba(34,197,94,.07)",
    border: "rgba(34,197,94,.18)",
  },
];

const VISIBLE_SOURCE_KEYS = [
  "website",
  "instagram",
  "facebook",
  "linkedin",
  "google_maps",
];

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
      type: "linkedin",
      regex: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,]+/i,
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
        <span className="bg-[linear-gradient(180deg,#475569_0%,#0f172a_100%)] bg-clip-text text-transparent">
          AI Studio
        </span>
      </div>
    </div>
  );
}

function SourceChip({
  source,
  active = false,
  statusText = "",
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative inline-flex h-[62px] items-center justify-center overflow-hidden rounded-full border border-white/90 bg-[rgba(255,255,255,.78)] px-7 text-[15px] font-medium tracking-[-0.02em] text-slate-700 shadow-[0_14px_28px_-26px_rgba(15,23,42,.20)] backdrop-blur-[12px] transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-[1px] hover:bg-white"
      style={{
        borderColor: active ? source.border : undefined,
        backgroundColor: active ? source.tint : undefined,
        boxShadow: active
          ? "0 18px 36px -26px rgba(15,23,42,.20)"
          : "0 14px 28px -26px rgba(15,23,42,.20)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-[48%] rounded-full opacity-0 blur-[18px] transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, ${source.glow} 0%, ${source.glowSoft} 34%, rgba(255,255,255,0) 90%)`,
        }}
      />
      <span
        className="pointer-events-none absolute -left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full opacity-0 blur-[16px] transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: source.glow }}
      />

      <span className="relative z-10 inline-flex items-center gap-3">
        <img
          src={source.icon}
          alt={source.label}
          className="h-[22px] w-[22px] object-contain"
        />
        <span className="whitespace-nowrap">{source.label}</span>
        {statusText ? (
          <span className="rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {statusText}
          </span>
        ) : null}
        {active ? <Check className="h-[15px] w-[15px] text-slate-900" /> : null}
      </span>
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
  instagramMeta = {},
  onInstagramConnect,
  onUseConnectedInstagram,
}) {
  if (!source) return null;

  const isInstagram = source.key === "instagram";
  const connected = Boolean(instagramMeta?.connected);
  const usingConnectedDraft = hasExistingValue && s(value) && lower(s(instagramMeta?.profileUrl)) === lower(s(value));

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
        className="relative z-10 w-full max-w-[620px] rounded-[34px] border border-white/80 bg-[rgba(250,250,250,.98)] p-7 shadow-[0_32px_80px_-36px_rgba(15,23,42,.28)] sm:p-8"
      >
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src={source.icon}
                alt={source.label}
                className="h-10 w-10 shrink-0 object-contain"
              />

              <h3
                style={DISPLAY_FONT_STYLE}
                className="truncate text-[26px] font-semibold leading-none tracking-[-0.05em] text-slate-950 sm:text-[28px]"
              >
                {source.title}
              </h3>
            </div>

            <p className="ml-14 mt-3 text-[15px] leading-7 text-slate-500">
              {source.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-[0_10px_24px_-18px_rgba(15,23,42,.22)] transition hover:text-slate-700"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {isInstagram ? (
          <div className="mt-6 rounded-[28px] border border-[rgba(15,23,42,.08)] bg-white/80 p-5">
            {instagramMeta?.loading ? (
              <div className="flex items-center gap-3 text-[14px] text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking connected Instagram account...
              </div>
            ) : connected ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Connected account
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[18px] font-semibold tracking-[-0.03em] text-slate-950">
                      <img
                        src={instagramIcon}
                        alt="Instagram"
                        className="h-[18px] w-[18px] object-contain"
                      />
                      <span className="truncate">
                        @{s(instagramMeta?.username || "instagram")}
                      </span>
                    </div>
                    {s(instagramMeta?.displayName) ? (
                      <div className="mt-1 text-[14px] text-slate-500">
                        {s(instagramMeta.displayName)}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={onUseConnectedInstagram}
                    className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-[14px] font-medium transition ${
                      usingConnectedDraft
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    {usingConnectedDraft ? "Using connected account" : "Use connected account"}
                  </button>
                </div>

                {s(instagramMeta?.profileUrl) ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[13px] text-slate-600">
                    {instagramMeta.profileUrl}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-[14px] leading-6 text-slate-500">
                  Connect the real Instagram account first, then use it directly in the setup flow.
                </div>

                <button
                  type="button"
                  onClick={onInstagramConnect}
                  disabled={instagramMeta?.connecting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-[14px] font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {instagramMeta?.connecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlugZap className="h-4 w-4" />
                  )}
                  {instagramMeta?.connecting ? "Connecting..." : "Connect Instagram"}
                </button>
              </div>
            )}

            {s(instagramMeta?.error) ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
                {instagramMeta.error}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8">
          <div className="flex h-[60px] items-center gap-3 rounded-full border border-[rgba(15,23,42,.08)] bg-[#f7f8fa] px-5 transition focus-within:border-[rgba(15,23,42,.14)] focus-within:bg-white">
            <Link2 className="h-[16px] w-[16px] shrink-0 text-slate-400" />
            <input
              type="text"
              name={`${source.key}-source`}
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={source.placeholder}
              className="min-w-0 placeholder:text-slate-400"
              style={INPUT_RESET_STYLE}
              autoFocus={!isInstagram}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onSave}
              disabled={!s(value)}
              className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-[15px] font-medium text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,.22)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {source.actionLabel}
            </button>

            {hasExistingValue ? (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-2 text-[15px] font-medium text-slate-500 transition hover:text-slate-900"
              >
                Remove
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-2 text-[15px] font-medium text-slate-500 transition hover:text-slate-900"
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
  const [instagramMeta, setInstagramMeta] = useState({
    loading: true,
    connecting: false,
    connected: false,
    hasToken: false,
    username: "",
    profileUrl: "",
    displayName: "",
    externalUserId: "",
    externalPageId: "",
    channel: null,
    error: "",
  });

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

  const refreshInstagramStatus = useCallback(async () => {
    try {
      setInstagramMeta((prev) => ({
        ...prev,
        loading: true,
        error: "",
      }));

      const status = await getMetaChannelStatus();

      setInstagramMeta((prev) => ({
        ...prev,
        ...normalizeInstagramStatusPayload(status),
      }));

      return normalizeInstagramStatusPayload(status);
    } catch (error) {
      const message = s(error?.message || "Failed to load Instagram status");
      setInstagramMeta((prev) => ({
        ...prev,
        loading: false,
        connected: false,
        hasToken: false,
        username: "",
        profileUrl: "",
        displayName: "",
        externalUserId: "",
        externalPageId: "",
        channel: null,
        error: message,
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    refreshInstagramStatus();
  }, [refreshInstagramStatus]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const metaConnected = s(params.get("meta_connected"));
    const metaError = s(params.get("meta_error"));

    if (!metaConnected && !metaError) return;

    if (metaError) {
      setInstagramMeta((prev) => ({
        ...prev,
        error: metaError,
        connecting: false,
      }));
    }

    refreshInstagramStatus().then((status) => {
      if (
        metaConnected === "1" &&
        status?.connected &&
        !s(obj(sourceDraftsRef.current.instagram).value)
      ) {
        const connectedUrl = s(status.profileUrl);
        if (connectedUrl) {
          const nextDrafts = {
            ...sourceDraftsRef.current,
            instagram: {
              value: connectedUrl,
              mode: "connected",
              username: s(status.username),
            },
          };

          const nextComposer = cleanComposerText(composerRef.current, nextDrafts);

          setSourceDrafts(nextDrafts);
          setComposerValue(nextComposer);

          const next = buildInterpretation(nextComposer, nextDrafts);
          onSetDiscoveryField?.("sourceType", next.sourceType || "");
          onSetDiscoveryField?.("sourceValue", next.sourceValue || "");
          onSetDiscoveryField?.("websiteUrl", next.websiteUrl || "");
          onSetDiscoveryField?.("note", next.note || "");

          onSetBusinessField?.("websiteUrl", next.websiteUrl || "");
          onSetBusinessField?.("description", next.description || "");
        }
      }
    });

    params.delete("meta_connected");
    params.delete("meta_error");
    params.delete("channel");

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash || ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, [onSetBusinessField, onSetDiscoveryField, refreshInstagramStatus]);

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

    if (activeSource.key === "instagram") {
      const current = obj(sourceDrafts[activeSource.key]);
      const currentValue = s(current.value);
      const connectedUrl = s(instagramMeta.profileUrl);
      const fallbackValue = currentValue || connectedUrl;
      setModalValue(fallbackValue);
      return;
    }

    const prev = obj(sourceDrafts[activeSource.key]);
    setModalValue(s(prev.value));
  }, [activeSource, sourceDrafts, instagramMeta.profileUrl]);

  useEffect(() => {
    if (!activeSourceKey) return;

    const body = document.body;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
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
        mode:
          activeSource.key === "instagram" &&
          lower(nextValue) === lower(s(instagramMeta.profileUrl))
            ? "connected"
            : "manual",
        username:
          activeSource.key === "instagram" ? s(instagramMeta.username) : "",
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

  async function handleInstagramConnect() {
    try {
      setInstagramMeta((prev) => ({
        ...prev,
        connecting: true,
        error: "",
      }));

      const url = await getMetaConnectUrl();
      window.location.assign(url);
    } catch (error) {
      setInstagramMeta((prev) => ({
        ...prev,
        connecting: false,
        error: s(error?.message || "Failed to start Instagram connect"),
      }));
    }
  }

  function handleUseConnectedInstagram() {
    const connectedUrl = s(instagramMeta.profileUrl);
    if (!connectedUrl) return;

    const nextDrafts = {
      ...sourceDraftsRef.current,
      instagram: {
        value: connectedUrl,
        mode: "connected",
        username: s(instagramMeta.username),
      },
    };

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
                className="mx-auto mt-7 max-w-[1180px] text-[34px] font-semibold leading-[1.08] tracking-[-0.065em] text-slate-950 sm:text-[42px] lg:text-[54px]"
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
              <div className="pointer-events-none absolute left-1/2 top-[calc(100%-8px)] z-0 h-[190px] w-[84%] -translate-x-1/2">
                <div
                  className={`absolute left-1/2 top-0 h-[128px] w-[54%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(86,255,180,.30)_0%,_rgba(86,255,180,.14)_36%,_rgba(86,255,180,0)_74%)] blur-[28px] transition-all duration-500 ${
                    showGlow ? "scale-100 opacity-100" : "scale-90 opacity-0"
                  }`}
                />
                <div
                  className={`absolute left-1/2 top-[8px] h-[170px] w-[86%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(125,226,255,.20)_0%,_rgba(125,226,255,.10)_38%,_rgba(125,226,255,0)_78%)] blur-[44px] transition-all duration-700 ${
                    showGlow ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  }`}
                />
                <div
                  className={`absolute left-1/2 top-[18px] h-[96px] w-[36%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,.42)_0%,_rgba(255,255,255,0)_74%)] blur-[18px] transition-all duration-500 ${
                    showGlow ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>

              <div className="relative z-10 overflow-hidden rounded-[32px] border border-[rgba(15,23,42,.08)] bg-[rgba(255,255,255,.94)] shadow-[0_18px_40px_-28px_rgba(15,23,42,.14)] backdrop-blur-[10px]">
                <textarea
                  ref={textareaRef}
                  value={composerValue}
                  onChange={(e) => handleComposerChange(e.target.value)}
                  onFocus={() => setIsComposerFocused(true)}
                  onBlur={() => setIsComposerFocused(false)}
                  rows={4}
                  placeholder="Describe the business, what it offers, and what AI should understand first."
                  className="min-h-[150px] w-full resize-none border-0 bg-transparent px-[26px] pt-[24px] text-[16px] font-normal leading-7 tracking-[-0.025em] text-slate-900 outline-none shadow-none placeholder:text-[rgba(100,116,139,.88)] focus:ring-0 sm:text-[17px]"
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

              <div className="relative z-10 mx-auto mt-11 flex max-w-[980px] flex-wrap items-center justify-center gap-x-4 gap-y-4">
                {VISIBLE_SOURCE_KEYS.map((key) => {
                  const source = sourceByKey(key);
                  if (!source) return null;

                  const record = obj(sourceDrafts[key]);
                  const isInstagram = key === "instagram";
                  const hasAttachedValue = !!s(record.value);
                  const hasConnectedAccount = isInstagram && !!instagramMeta.connected;

                  return (
                    <SourceChip
                      key={source.key}
                      source={source}
                      active={hasAttachedValue}
                      statusText={
                        isInstagram
                          ? hasAttachedValue
                            ? record.mode === "connected"
                              ? "Live"
                              : "Added"
                            : hasConnectedAccount
                              ? "Connected"
                              : ""
                          : hasAttachedValue
                            ? "Added"
                            : ""
                      }
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
            instagramMeta={instagramMeta}
            onInstagramConnect={handleInstagramConnect}
            onUseConnectedInstagram={handleUseConnectedInstagram}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}