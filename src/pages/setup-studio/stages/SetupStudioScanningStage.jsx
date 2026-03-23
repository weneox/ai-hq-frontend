import { motion } from "framer-motion";
import { FileAudio2, FileText, Globe2, Loader2, Mic } from "lucide-react";
import { truncateMiddle } from "../lib/setupStudioHelpers.js";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function arr(v, d = []) {
  return Array.isArray(v) ? v : d;
}

function bool(v, d = false) {
  if (typeof v === "boolean") return v;
  const x = String(v ?? "").trim().toLowerCase();
  if (!x) return d;
  if (["1", "true", "yes", "y", "on"].includes(x)) return true;
  if (["0", "false", "no", "n", "off"].includes(x)) return false;
  return d;
}

function sourceLabel(sourceType = "", lastUrl = "") {
  const x = s(sourceType).toLowerCase();

  if (x === "google_maps") return "Google Maps";
  if (x === "instagram") return "Instagram";
  if (x === "linkedin") return "LinkedIn";
  if (x === "facebook") return "Facebook";
  if (x === "website") return "Website";

  if (s(lastUrl)) return "Source";
  return "";
}

function buildDefaultScanLines({
  sourceType = "",
  hasSourceInput = false,
  hasManualInput = false,
  hasVoiceInput = false,
}) {
  const sourceName = sourceLabel(sourceType);

  const lines = [];

  if (hasSourceInput) {
    lines.push(
      sourceName
        ? `Reading ${sourceName} input`
        : "Reading the primary source"
    );
  }

  if (hasManualInput) {
    lines.push("Merging manual business details");
  }

  if (hasVoiceInput) {
    lines.push("Transcribing voice input");
  }

  lines.push("Extracting business identity");
  lines.push("Collecting knowledge signals");
  lines.push("Preparing the first draft");

  const seen = new Set();
  return lines.filter((line) => {
    const key = s(line).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function Pill({ icon: Icon, children }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className="truncate">{children}</span>
    </div>
  );
}

export default function SetupStudioScanningStage({
  lastUrl,
  sourceType = "",
  hasSourceInput,
  hasManualInput = false,
  hasVoiceInput = false,
  scanLines = [],
  scanLineIndex = 0,
}) {
  const resolvedHasSourceInput =
    typeof hasSourceInput === "boolean" ? hasSourceInput : !!s(lastUrl);

  const resolvedHasManualInput = bool(hasManualInput, false);
  const resolvedHasVoiceInput = bool(hasVoiceInput, false);

  const defaultLines = buildDefaultScanLines({
    sourceType,
    hasSourceInput: resolvedHasSourceInput,
    hasManualInput: resolvedHasManualInput,
    hasVoiceInput: resolvedHasVoiceInput,
  });

  const safeLines = arr(scanLines).length ? arr(scanLines) : defaultLines;

  const activeIndex = Math.max(
    0,
    Math.min(Number(scanLineIndex || 0), safeLines.length - 1)
  );

  const clippedUrl = s(lastUrl) ? truncateMiddle(lastUrl, 58, 28) : "";
  const sourceName = sourceLabel(sourceType, lastUrl);

  const title = resolvedHasSourceInput && resolvedHasManualInput
    ? "Analyzing source and manual input."
    : resolvedHasSourceInput && resolvedHasVoiceInput
      ? "Analyzing source and voice input."
      : resolvedHasManualInput && resolvedHasVoiceInput
        ? "Analyzing manual and voice input."
        : resolvedHasSourceInput
          ? "Building the first business draft."
          : resolvedHasManualInput
            ? "Building the draft from manual input."
            : resolvedHasVoiceInput
              ? "Building the draft from voice input."
              : "Preparing the first business draft.";

  const description = resolvedHasSourceInput && (resolvedHasManualInput || resolvedHasVoiceInput)
    ? "The system is combining all available inputs, extracting business details, and preparing a review draft."
    : resolvedHasSourceInput
      ? "The system is reading the source, extracting business details, and preparing a draft you can review."
      : resolvedHasManualInput
        ? "The system is structuring the written business details and preparing the first review draft."
        : resolvedHasVoiceInput
          ? "The system is transcribing the voice description and shaping the first review draft."
          : "The system is preparing the first business draft for review.";

  return (
    <motion.section
      key="setup-studio-scanning"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[980px]"
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8">
        <div className="max-w-[760px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Analyzing
          </div>

          <h2 className="mt-5 text-[30px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[40px]">
            {title}
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-slate-600">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {clippedUrl ? (
              <Pill icon={Globe2}>{clippedUrl}</Pill>
            ) : null}

            {!clippedUrl && sourceName ? (
              <Pill icon={Globe2}>{sourceName}</Pill>
            ) : null}

            {resolvedHasManualInput ? (
              <Pill icon={FileText}>Manual details</Pill>
            ) : null}

            {resolvedHasVoiceInput ? (
              <Pill icon={Mic}>Voice input</Pill>
            ) : null}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {safeLines.map((line, index) => {
            const active = index === activeIndex;
            const done = index < activeIndex;

            return (
              <div
                key={`${line}-${index}`}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-4 ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white"
                    : done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <div
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    active
                      ? "bg-white text-slate-950"
                      : done
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-500"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{line}</div>
                </div>

                <div className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                  {active ? "active" : done ? "done" : "queued"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}