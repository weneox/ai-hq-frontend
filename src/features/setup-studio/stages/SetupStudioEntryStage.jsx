import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

function s(v) {
  return String(v ?? "").replace(/\u00a0/g, " ").trim();
}

function lines(v = "") {
  return s(v)
    .split(/\n+/)
    .map((item) => s(item))
    .filter(Boolean);
}

function stripLabel(v = "") {
  return s(v).replace(
    /^(website|site|url|link|source|google maps|maps|instagram|linkedin)\s*:\s*/i,
    ""
  );
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

function detectLineSourceType(v = "") {
  const x = stripLabel(v);

  if (!x) return "";
  if (
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[^\s,]+/i.test(x) ||
    (/^@[a-z0-9._]{2,}$/i.test(x) && !/@.+\./i.test(x))
  ) {
    return "instagram";
  }

  if (/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,]+/i.test(x)) {
    return "linkedin";
  }

  if (
    /(?:https?:\/\/)?(?:www\.)?(?:maps\.app\.goo\.gl|maps\.google\.[^\s/]+|goo\.gl\/maps)\/?[^\s,]*/i.test(
      x
    ) ||
    /^google maps$/i.test(x)
  ) {
    return "google_maps";
  }

  if (looksLikeWebsite(x)) {
    return "website";
  }

  return "";
}

function buildInitialComposer({ discoveryForm = {}, businessForm = {} }) {
  const source = s(
    discoveryForm?.sourceValue ||
      discoveryForm?.websiteUrl ||
      businessForm?.websiteUrl
  );
  const note = s(discoveryForm?.note || businessForm?.description);

  return [source, note].filter(Boolean).join("\n\n");
}

function buildInitialMode({ discoveryForm = {} }) {
  const sourceType = s(discoveryForm?.sourceType).toLowerCase();

  if (
    ["website", "google_maps", "instagram", "linkedin", "auto"].includes(
      sourceType
    )
  ) {
    return sourceType;
  }

  return "auto";
}

function buildInterpretation(raw = "", preferredMode = "auto") {
  const text = s(raw);

  if (!text) {
    return {
      sourceType: "",
      sourceValue: "",
      websiteUrl: "",
      note: "",
      description: "",
      summary: "Add a source or describe the business to begin.",
    };
  }

  const cleanLines = lines(text).map(stripLabel);

  if (preferredMode !== "auto") {
    const firstLine = s(cleanLines[0]);
    const rest = cleanLines.slice(1).join("\n\n").trim();

    if (firstLine) {
      return {
        sourceType: preferredMode,
        sourceValue: firstLine,
        websiteUrl: preferredMode === "website" ? firstLine : "",
        note: rest,
        description: rest,
        summary: rest
          ? `Will use ${sourceLabel(preferredMode)} + your note.`
          : `Will use ${sourceLabel(preferredMode)} only.`,
      };
    }
  }

  const firstLine = s(cleanLines[0]);
  const firstLineSourceType = detectLineSourceType(firstLine);

  if (firstLineSourceType) {
    const rest = cleanLines.slice(1).join("\n\n").trim();
    return {
      sourceType: firstLineSourceType,
      sourceValue: firstLine,
      websiteUrl: firstLineSourceType === "website" ? firstLine : "",
      note: rest,
      description: rest,
      summary: rest
        ? `Will scan ${sourceLabel(firstLineSourceType)} + use your note.`
        : `Will scan ${sourceLabel(firstLineSourceType)} only.`,
    };
  }

  const inlineSource = detectInlineSource(text);

  if (inlineSource?.sourceValue) {
    const sourceValue = s(inlineSource.sourceValue);
    const note = s(
      text
        .replace(inlineSource.fullMatch, " ")
        .replace(/^[,;:\-\s]+/, "")
        .replace(/\s{2,}/g, " ")
    );

    return {
      sourceType: inlineSource.sourceType,
      sourceValue,
      websiteUrl: inlineSource.sourceType === "website" ? sourceValue : "",
      note,
      description: note,
      summary: note
        ? `Will scan ${sourceLabel(inlineSource.sourceType)} + use your note.`
        : `Will scan ${sourceLabel(inlineSource.sourceType)} only.`,
    };
  }

  return {
    sourceType: "",
    sourceValue: "",
    websiteUrl: "",
    note: text,
    description: text,
    summary: "Will build the first draft from your description only.",
  };
}

function sourceLabel(type = "") {
  const x = s(type).toLowerCase();

  if (x === "website") return "website";
  if (x === "google_maps") return "Google Maps";
  if (x === "instagram") return "Instagram";
  if (x === "linkedin") return "LinkedIn";
  return "your input";
}

const MODE_OPTIONS = [
  { key: "auto", label: "Auto detect" },
  { key: "website", label: "Website" },
  { key: "google_maps", label: "Google Maps" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
];

function ModePill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-[12px] font-medium transition ${
        active
          ? "border border-slate-900 bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,.14)]"
          : "border border-white/70 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function SignalPill({ children }) {
  return (
    <div className="rounded-full border border-slate-200/90 bg-white/80 px-3.5 py-2 text-[12px] font-medium text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
      {children}
    </div>
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
  const [inputMode, setInputMode] = useState(
    buildInitialMode({ discoveryForm })
  );
  const [composerValue, setComposerValue] = useState(
    buildInitialComposer({ discoveryForm, businessForm })
  );

  const interpretation = useMemo(() => {
    return buildInterpretation(composerValue, inputMode);
  }, [composerValue, inputMode]);

  const canContinue = !!s(composerValue);

  function syncState(nextText, nextMode) {
    const next = buildInterpretation(nextText, nextMode);

    onSetDiscoveryField?.("sourceType", next.sourceType || "");
    onSetDiscoveryField?.("sourceValue", next.sourceValue || "");
    onSetDiscoveryField?.("websiteUrl", next.websiteUrl || "");
    onSetDiscoveryField?.("note", next.note || "");

    onSetBusinessField?.("companyName", "");
    onSetBusinessField?.("websiteUrl", next.websiteUrl || "");
    onSetBusinessField?.("primaryPhone", "");
    onSetBusinessField?.("primaryEmail", "");
    onSetBusinessField?.("primaryAddress", "");
    onSetBusinessField?.("timezone", "");
    onSetBusinessField?.("language", "");
    onSetBusinessField?.("description", next.description || "");

    onSetManualSection?.("servicesText", "");
    onSetManualSection?.("faqsText", "");
    onSetManualSection?.("policiesText", "");
  }

  function handleComposerChange(nextText) {
    setComposerValue(nextText);
    syncState(nextText, inputMode);
  }

  function handleModeChange(nextMode) {
    setInputMode(nextMode);
    syncState(composerValue, nextMode);
  }

  function handleContinue() {
    flushSync(() => {
      syncState(composerValue, inputMode);
    });

    onContinueFlow?.();
  }

  return (
    <section className="w-full py-2 sm:py-4">
      <div className="mx-auto max-w-[1100px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="max-w-[760px]"
        >
          <div className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,.05)]">
            Ready to scan
          </div>

          <h1 className="mt-6 text-[40px] font-semibold leading-[0.94] tracking-[-0.07em] text-slate-950 sm:text-[54px] lg:text-[68px]">
            Build the first
            <span className="bg-gradient-to-r from-slate-950 via-slate-700 to-slate-500 bg-clip-text text-transparent">
              {" "}
              business draft.
            </span>
          </h1>

          <p className="mt-5 max-w-[700px] text-[15px] leading-7 text-slate-600 sm:text-[17px]">
            Paste a website, Maps, Instagram, or LinkedIn link — or just
            describe the business in your own language. The system will build
            the first draft and ask only for what is still missing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.04 }}
          className="relative mt-10 overflow-hidden rounded-[34px] border border-white/75 bg-white/78 shadow-[0_28px_80px_rgba(15,23,42,.10)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(255,168,76,.26)_0%,_rgba(255,168,76,0)_68%)] blur-2xl" />
            <div className="absolute right-[14%] top-[8%] h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(170,120,255,.18)_0%,_rgba(170,120,255,0)_72%)] blur-3xl" />
            <div className="absolute left-[10%] top-[18%] h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(116,181,255,.16)_0%,_rgba(116,181,255,0)_70%)] blur-2xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
          </div>

          <div className="relative z-10 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Start with anything
                </div>
                <div className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[28px]">
                  One input. The system does the structuring.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {MODE_OPTIONS.map((item) => (
                  <ModePill
                    key={item.key}
                    active={item.key === inputMode}
                    onClick={() => handleModeChange(item.key)}
                  >
                    {item.label}
                  </ModePill>
                ))}
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.84))] shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_16px_40px_rgba(15,23,42,.06)]">
              <textarea
                value={composerValue}
                onChange={(e) => handleComposerChange(e.target.value)}
                rows={8}
                placeholder={`Paste a source or describe the business...

Examples:
saytpro.az

Google Maps:
ABB Xırdalan filialı

Or just write naturally:
Bakıda xidmət göstərən kişi salonuyuq. Əsasən saç kəsimi, saqqal forması və boyama edirik. Müştərilər əsasən şəhər içindən gəlir.`}
                className="min-h-[280px] w-full resize-none border-0 bg-transparent px-5 py-5 text-[16px] leading-8 text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0 sm:px-6 sm:py-6 sm:text-[17px]"
              />

              <div className="flex flex-col gap-4 border-t border-slate-200/80 px-5 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-700">
                    {interpretation.summary}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-500">
                    You can write in Azerbaijani, English, Turkish, Russian, or
                    any language you prefer.
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

            <div className="mt-5 flex flex-wrap gap-2.5">
              <SignalPill>Name & positioning</SignalPill>
              <SignalPill>Contacts & address</SignalPill>
              <SignalPill>Services & FAQs</SignalPill>
              <SignalPill>Review before launch</SignalPill>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}