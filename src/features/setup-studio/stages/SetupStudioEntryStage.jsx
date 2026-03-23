import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function s(v) {
  return String(v ?? "").trim();
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
  const manualIdx = text.indexOf("[manual_business]");
  if (manualIdx === -1) return text.trim();
  return text.slice(0, manualIdx).trim();
}

const SOURCE_TYPES = [
  {
    key: "website",
    label: "Website",
    placeholder: "yourbusiness.com",
    hint: "Best first pass for services, contact details, and business summary.",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "@yourbrand",
    hint: "Useful for brand tone, social proof, and visual context.",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/company/yourbrand",
    hint: "Useful for company identity, trust, and positioning.",
  },
  {
    key: "google_maps",
    label: "Google Maps",
    placeholder: "Business name or maps link",
    hint: "Helpful when the business is location-first.",
  },
];

function Kicker({ children }) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
      {children}
    </div>
  );
}

function SourceTypeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-slate-950 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ disabled, children, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ClosedSourceVisual() {
  return (
    <div className="mt-8 space-y-3">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
          Website
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
          Instagram
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
          LinkedIn
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
          Google Maps
        </span>
      </div>

      <div className="pt-3 text-sm text-slate-400">Start from one source.</div>
    </div>
  );
}

function ClosedDescribeVisual() {
  return (
    <div className="mt-8 space-y-3">
      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
        What your business does
      </div>
      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
        Who it helps
      </div>
      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
        How people reach you
      </div>
    </div>
  );
}

function EntryCard({
  active,
  title,
  description,
  eyebrow,
  preview,
  children,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      className={`w-full overflow-hidden rounded-[32px] border bg-white p-0 text-left transition ${
        active
          ? "border-slate-950 shadow-[0_12px_36px_rgba(15,23,42,.06)]"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            {eyebrow}
          </div>

          {active ? (
            <div className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Selected
            </div>
          ) : null}
        </div>

        <div className="mt-5 text-[28px] font-semibold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-[32px]">
          {title}
        </div>

        <div className="mt-3 max-w-[460px] text-sm leading-7 text-slate-600">
          {description}
        </div>

        {!active ? preview : null}

        <AnimatePresence initial={false}>
          {active ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mt-8 border-t border-slate-200 pt-6">{children}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

export default function SetupStudioEntryStage({
  discoveryForm,
  onSetDiscoveryField,
  onContinueFlow,
}) {
  const savedManual = useMemo(
    () => parseManualBlock(discoveryForm?.note),
    [discoveryForm?.note]
  );

  const savedPlainNote = useMemo(
    () => extractPlainNote(discoveryForm?.note),
    [discoveryForm?.note]
  );

  const [activeMode, setActiveMode] = useState(() => {
    const fromForm = s(discoveryForm?.entryMode);
    if (fromForm === "describe" || fromForm === "sources") return fromForm;
    if (savedManual.name || savedManual.brief || savedPlainNote) return "describe";
    return "sources";
  });

  const [sourceType, setSourceType] = useState(
    s(discoveryForm?.sourceType) || "website"
  );
  const [sourceValue, setSourceValue] = useState(
    s(discoveryForm?.sourceValue || discoveryForm?.websiteUrl || "")
  );

  const [manualName, setManualName] = useState(savedManual.name || "");
  const [manualBrief, setManualBrief] = useState(
    savedManual.brief || savedPlainNote || ""
  );

  useEffect(() => {
    setManualName(savedManual.name || "");
    setManualBrief(savedManual.brief || savedPlainNote || "");
  }, [savedManual.name, savedManual.brief, savedPlainNote]);

  useEffect(() => {
    setSourceType(s(discoveryForm?.sourceType) || "website");
    setSourceValue(s(discoveryForm?.sourceValue || discoveryForm?.websiteUrl || ""));
  }, [
    discoveryForm?.sourceType,
    discoveryForm?.sourceValue,
    discoveryForm?.websiteUrl,
  ]);

  const composedNote = useMemo(() => {
    if (!manualName && !manualBrief) return "";

    return [
      "[manual_business]",
      `name: ${manualName}`,
      `brief: ${manualBrief}`,
    ]
      .join("\n")
      .trim();
  }, [manualName, manualBrief]);

  useEffect(() => {
    if (s(discoveryForm?.note) !== composedNote) {
      onSetDiscoveryField?.("note", composedNote);
    }
  }, [composedNote, discoveryForm?.note, onSetDiscoveryField]);

  useEffect(() => {
    if (sourceType !== "website" && s(discoveryForm?.websiteUrl)) {
      onSetDiscoveryField?.("websiteUrl", "");
    }
  }, [sourceType, discoveryForm?.websiteUrl, onSetDiscoveryField]);

  useEffect(() => {
    if (sourceType === "website" && s(discoveryForm?.websiteUrl) !== s(sourceValue)) {
      onSetDiscoveryField?.("websiteUrl", sourceValue);
    }
  }, [sourceType, sourceValue, discoveryForm?.websiteUrl, onSetDiscoveryField]);

  function handleModeChange(nextMode) {
    setActiveMode(nextMode);
    onSetDiscoveryField?.("entryMode", nextMode);
  }

  function handleSourceTypeChange(nextType) {
    setSourceType(nextType);
    onSetDiscoveryField?.("sourceType", nextType);
  }

  function handleSourceValueChange(nextValue) {
    setSourceValue(nextValue);
    onSetDiscoveryField?.("sourceValue", nextValue);

    if (sourceType === "website") {
      onSetDiscoveryField?.("websiteUrl", nextValue);
    }
  }

  function handleContinue() {
    onContinueFlow?.();
  }

  const activeSource =
    SOURCE_TYPES.find((item) => item.key === sourceType) || SOURCE_TYPES[0];

  const canContinueSources = !!s(sourceValue);
  const canContinueDescribe = !!s(manualName) || !!s(manualBrief);

  return (
    <section className="w-full py-4 sm:py-6">
      <div className="max-w-[760px]">
        <Kicker>Setup studio</Kicker>

        <h1 className="mt-5 text-[36px] font-semibold leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-[48px] lg:text-[56px]">
          Start from one strong signal.
        </h1>

        <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-slate-600 sm:text-[16px]">
          Add one source or describe the business in a short note. The system
          will build the first business draft from there.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <EntryCard
          active={activeMode === "sources"}
          eyebrow="Sources"
          title="Add your business sources"
          description="Start from a real public source and let the system discover the first draft."
          preview={<ClosedSourceVisual />}
          onClick={() => handleModeChange("sources")}
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Source type
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SOURCE_TYPES.map((item) => (
                <SourceTypeButton
                  key={item.key}
                  active={item.key === sourceType}
                  onClick={() => handleSourceTypeChange(item.key)}
                >
                  {item.label}
                </SourceTypeButton>
              ))}
            </div>

            <div className="mt-5">
              <input
                value={sourceValue}
                onChange={(e) => handleSourceValueChange(e.target.value)}
                placeholder={activeSource.placeholder}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[16px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
              />
            </div>

            <p className="mt-4 max-w-[520px] text-sm leading-6 text-slate-500">
              {activeSource.hint}
            </p>

            <div className="mt-6">
              <PrimaryButton
                disabled={!canContinueSources}
                onClick={handleContinue}
              >
                Analyze source
              </PrimaryButton>
            </div>
          </div>
        </EntryCard>

        <EntryCard
          active={activeMode === "describe"}
          eyebrow="Manual"
          title="Describe your business"
          description="Write a short business note when there is little or no public source yet."
          preview={<ClosedDescribeVisual />}
          onClick={() => handleModeChange("describe")}
        >
          <div className="grid gap-4">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Business name
              </div>

              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Business name"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[16px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
              />
            </div>

            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Business note
              </div>

              <textarea
                value={manualBrief}
                onChange={(e) => setManualBrief(e.target.value)}
                placeholder="Tell us what the business does."
                rows={5}
                className="min-h-[160px] w-full resize-none rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-[16px] leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
              />
            </div>

            <p className="text-sm leading-6 text-slate-500">
              One clear sentence is enough for the first draft.
            </p>

            <div>
              <PrimaryButton
                disabled={!canContinueDescribe}
                onClick={handleContinue}
              >
                Build draft
              </PrimaryButton>
            </div>
          </div>
        </EntryCard>
      </div>
    </section>
  );
}