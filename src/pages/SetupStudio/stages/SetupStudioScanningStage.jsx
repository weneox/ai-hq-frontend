import { motion } from "framer-motion";
import { FileText, Globe2, Loader2, Mic } from "lucide-react";

import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import {
  MetricCard,
  StagePanel,
  TinyChip,
  TinyLabel,
} from "../components/SetupStudioUi.jsx";
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
  return "Draft";
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
    lines.push(sourceName ? `Reading ${sourceName}` : "Reading source");
  }

  if (hasManualInput) {
    lines.push("Blending manual notes");
  }

  if (hasVoiceInput) {
    lines.push("Transcribing voice input");
  }

  lines.push("Shaping identity");
  lines.push("Collecting useful signals");
  lines.push("Preparing review draft");

  const seen = new Set();
  return lines.filter((line) => {
    const key = s(line).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

  const sourceName = sourceLabel(sourceType, lastUrl);
  const clippedUrl = s(lastUrl) ? truncateMiddle(lastUrl, 58, 28) : "";

  return (
    <SetupStudioStageShell
      eyebrow="scanning"
      title="Building your review draft."
      body="A temporary draft is being prepared from the current source and any notes you added."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <StagePanel className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <TinyLabel>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              In progress
            </TinyLabel>
            {clippedUrl ? <TinyChip>{clippedUrl}</TinyChip> : null}
            {!clippedUrl ? <TinyChip>{sourceName}</TinyChip> : null}
            {resolvedHasManualInput ? (
              <TinyChip>
                <FileText className="mr-1 h-3.5 w-3.5" />
                Notes
              </TinyChip>
            ) : null}
            {resolvedHasVoiceInput ? (
              <TinyChip>
                <Mic className="mr-1 h-3.5 w-3.5" />
                Voice
              </TinyChip>
            ) : null}
          </div>

          <div className="space-y-3">
            {safeLines.map((line, index) => {
              const active = index === activeIndex;
              const done = index < activeIndex;

              return (
                <motion.div
                  key={`${line}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-center gap-4 rounded-[24px] px-4 py-4 ${
                    active
                      ? "bg-slate-950 text-white"
                      : done
                        ? "bg-emerald-50 text-emerald-900"
                        : "bg-white/70 text-slate-500"
                  }`}
                >
                  <div
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      active
                        ? "bg-white text-slate-950"
                        : done
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="flex-1 text-sm font-medium">{line}</div>

                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
                    {active ? "live" : done ? "done" : "queued"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </StagePanel>

        <div className="grid gap-4">
          <MetricCard
            label="Source"
            value={sourceName}
            detail="The current input stays isolated in its own review session."
          />
          <MetricCard
            label="Draft"
            value="Temporary"
            detail="Only the reviewed draft can become saved business truth."
          />
          <StagePanel tone="subtle" className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Globe2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-950">
                Calm review flow
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-500">
                Evidence stays separate. You will refine the editable draft next.
              </div>
            </div>
          </StagePanel>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}
