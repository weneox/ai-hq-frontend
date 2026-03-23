import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Globe2, PencilLine } from "lucide-react";

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

function ModeCard({ active, title, body, meta, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-[28px] border bg-white p-6 text-left transition ${
        active
          ? "border-slate-950 shadow-[0_10px_30px_rgba(15,23,42,.06)]"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${
            active
              ? "border-slate-950 bg-slate-950 text-white"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>

        {active ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white">
            <Check className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>

      <div className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-slate-950">
        {title}
      </div>

      <div className="mt-2 text-sm leading-6 text-slate-600">{body}</div>

      <div className="mt-5 text-[12px] font-medium text-slate-400">{meta}</div>
    </button>
  );
}

function SourcePill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm transition ${
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
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
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
  }, [discoveryForm?.sourceType, discoveryForm?.sourceValue, discoveryForm?.websiteUrl]);

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
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Setup studio
        </div>

        <h1 className="mt-5 text-[36px] font-semibold leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-[48px] lg:text-[56px]">
          Start with one clear input.
        </h1>

        <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-slate-600 sm:text-[16px]">
          Add one business source or write a short business note. The system
          will build the first business draft from there.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <ModeCard
          active={activeMode === "sources"}
          title="Add your business sources"
          body="Start from a website, Instagram, LinkedIn, or Google Maps."
          meta="Best when the business already exists online."
          icon={Globe2}
          onClick={() => handleModeChange("sources")}
        />

        <ModeCard
          active={activeMode === "describe"}
          title="Describe your business"
          body="Write what the business does and let the system shape the first draft."
          meta="Best when there is little or no public source yet."
          icon={PencilLine}
          onClick={() => handleModeChange("describe")}
        />
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeMode === "sources" ? (
            <motion.div
              key="sources"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="rounded-[30px] border border-slate-200 bg-white p-6 sm:p-7"
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Source type
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {SOURCE_TYPES.map((item) => (
                      <SourcePill
                        key={item.key}
                        active={item.key === sourceType}
                        onClick={() => handleSourceTypeChange(item.key)}
                      >
                        {item.label}
                      </SourcePill>
                    ))}
                  </div>

                  <div className="mt-6">
                    <input
                      value={sourceValue}
                      onChange={(e) => handleSourceValueChange(e.target.value)}
                      placeholder={activeSource.placeholder}
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[16px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                    />
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    {activeSource.hint}
                  </p>
                </div>

                <div>
                  <PrimaryButton
                    disabled={!canContinueSources}
                    onClick={handleContinue}
                  >
                    Analyze source
                    <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="describe"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="rounded-[30px] border border-slate-200 bg-white p-6 sm:p-7"
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Business note
                  </div>

                  <div className="mt-4 grid gap-4">
                    <input
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="Business name"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[16px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                    />

                    <textarea
                      value={manualBrief}
                      onChange={(e) => setManualBrief(e.target.value)}
                      placeholder="Tell us what the business does."
                      rows={5}
                      className="min-h-[160px] w-full resize-none rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-[16px] leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                    />
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    One clear sentence is enough to generate the first draft.
                  </p>
                </div>

                <div>
                  <PrimaryButton
                    disabled={!canContinueDescribe}
                    onClick={handleContinue}
                  >
                    Build draft
                    <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}