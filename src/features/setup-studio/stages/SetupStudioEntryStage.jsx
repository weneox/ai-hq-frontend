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
    hint: "Best first pass for services, contact details, positioning, and business summary.",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "@yourbrand",
    hint: "Good for brand tone, visual context, and social proof.",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/company/yourbrand",
    hint: "Useful for identity, trust, and company context.",
  },
  {
    key: "google_maps",
    label: "Google Maps",
    placeholder: "Business name or maps link",
    hint: "Helpful when the business is location-first.",
  },
];

function TinyLabel({ children }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#96a0b4]">
      {children}
    </div>
  );
}

function ModeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative pb-3 text-left text-[26px] font-semibold leading-none tracking-[-0.05em] transition sm:text-[30px]",
        active ? "text-[#1f2b42]" : "text-[#a2acbe] hover:text-[#4f607d]",
      ].join(" ")}
    >
      {children}
      <span
        className={[
          "absolute bottom-0 left-0 h-px bg-[#1f2b42] transition-all duration-200",
          active ? "w-full opacity-100" : "w-0 opacity-0",
        ].join(" ")}
      />
    </button>
  );
}

function SourceTypeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "pb-2 text-[14px] font-medium tracking-[0.01em] transition",
        active
          ? "border-b border-[#1f2b42] text-[#1f2b42]"
          : "border-b border-transparent text-[#9ba5b8] hover:text-[#55647f]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ContinueButton({ disabled, onClick }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.998 }}
      className="inline-flex h-[52px] items-center rounded-full border border-[rgba(221,227,236,.98)] bg-white px-6 text-[15px] font-semibold text-[#243248] shadow-[0_10px_24px_rgba(55,72,106,.05)] transition disabled:cursor-not-allowed disabled:opacity-40"
    >
      Continue
    </motion.button>
  );
}

function SourcePanel({
  sourceType,
  sourceValue,
  onChangeType,
  onChangeValue,
  onContinue,
}) {
  const activeSource =
    SOURCE_TYPES.find((item) => item.key === sourceType) || SOURCE_TYPES[0];

  const canContinue = !!s(sourceValue);

  return (
    <motion.div
      key="sources"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
      className="pt-12"
    >
      <div className="grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="max-w-[220px]">
          <TinyLabel>Mode</TinyLabel>
          <div className="mt-5 text-[28px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#1f2b42]">
            Use a source
          </div>
          <p className="mt-5 text-[15px] leading-8 text-[#7a8498]">
            Start from something real that already exists.
          </p>
        </div>

        <div className="min-w-0">
          <TinyLabel>Primary source</TinyLabel>

          <div className="mt-5 border-b border-[rgba(219,225,235,.96)] pb-5">
            <input
              value={sourceValue}
              onChange={(e) => onChangeValue(e.target.value)}
              placeholder={activeSource.placeholder}
              className="w-full bg-transparent text-[40px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#1f2b42] outline-none placeholder:text-[#c4cad6] sm:text-[54px]"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
            {SOURCE_TYPES.map((item) => (
              <SourceTypeButton
                key={item.key}
                active={item.key === sourceType}
                onClick={() => onChangeType(item.key)}
              >
                {item.label}
              </SourceTypeButton>
            ))}
          </div>

          <div className="mt-10 max-w-[680px] text-[15px] leading-8 text-[#7d879b]">
            {activeSource.hint}
          </div>

          <div className="mt-12 flex flex-col gap-5 border-t border-[rgba(222,228,238,.92)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[14px] text-[#98a2b5]">
              One clean source is enough to generate the first draft.
            </div>

            <ContinueButton disabled={!canContinue} onClick={onContinue} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DescribePanel({
  manualName,
  manualBrief,
  onChangeName,
  onChangeBrief,
  onContinue,
}) {
  const canContinue = !!s(manualName) || !!s(manualBrief);

  return (
    <motion.div
      key="describe"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
      className="pt-12"
    >
      <div className="grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="max-w-[220px]">
          <TinyLabel>Mode</TinyLabel>
          <div className="mt-5 text-[28px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#1f2b42]">
            Describe
          </div>
          <p className="mt-5 text-[15px] leading-8 text-[#7a8498]">
            Start from a short sentence and shape the first version by words.
          </p>
        </div>

        <div className="min-w-0">
          <TinyLabel>Business name</TinyLabel>

          <div className="mt-5 border-b border-[rgba(219,225,235,.96)] pb-5">
            <input
              value={manualName}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Your business name"
              className="w-full bg-transparent text-[32px] font-semibold leading-[1] tracking-[-0.06em] text-[#1f2b42] outline-none placeholder:text-[#c4cad6] sm:text-[40px]"
            />
          </div>

          <div className="mt-12">
            <TinyLabel>Description</TinyLabel>

            <div className="mt-5 border-b border-[rgba(219,225,235,.96)] pb-5">
              <textarea
                value={manualBrief}
                onChange={(e) => onChangeBrief(e.target.value)}
                placeholder="Tell us what your business does..."
                rows={6}
                className="min-h-[220px] w-full resize-none bg-transparent text-[32px] font-semibold leading-[1.12] tracking-[-0.06em] text-[#1f2b42] outline-none placeholder:text-[#c4cad6] sm:text-[40px]"
              />
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-5 border-t border-[rgba(222,228,238,.92)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[14px] text-[#98a2b5]">
              One good sentence is enough to generate the first version.
            </div>

            <ContinueButton disabled={!canContinue} onClick={onContinue} />
          </div>
        </div>
      </div>
    </motion.div>
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
    if (savedManual.name || savedManual.brief || savedPlainNote) return "describe";
    return "sources";
  });

  const [sourceType, setSourceType] = useState(s(discoveryForm?.sourceType) || "website");
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
    const parts = [];

    if (manualName || manualBrief) {
      parts.push(
        [
          "[manual_business]",
          `name: ${manualName}`,
          `brief: ${manualBrief}`,
        ].join("\n")
      );
    }

    return parts.join("\n\n").trim();
  }, [manualName, manualBrief]);

  useEffect(() => {
    if (s(discoveryForm?.note) !== composedNote) {
      onSetDiscoveryField?.("note", composedNote);
    }
  }, [composedNote, discoveryForm?.note, onSetDiscoveryField]);

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

  function handleContinue() {
    onContinueFlow?.();
  }

  return (
    <section className="mx-auto w-full max-w-[1220px] px-2 pb-10 pt-4 sm:px-3 lg:pt-6">
      <div className="w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/84 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-[#8096cb] shadow-[0_10px_24px_rgba(77,98,133,.04)]">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          AI SETUP STUDIO
        </div>

        <h1 className="mx-auto mt-7 max-w-[760px] text-[38px] font-semibold leading-[0.95] tracking-[-0.07em] text-[#1f2b42] sm:text-[50px] lg:text-[58px]">
          Build your business draft
        </h1>

        <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-8 text-[#778094] sm:text-[18px]">
          Choose how you want to begin.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-[1040px]">
        <div className="border-t border-[rgba(222,228,238,.92)] pt-6">
          <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
            <ModeButton
              active={activeMode === "sources"}
              onClick={() => handleModeChange("sources")}
            >
              Use a source
            </ModeButton>

            <ModeButton
              active={activeMode === "describe"}
              onClick={() => handleModeChange("describe")}
            >
              Describe your business
            </ModeButton>
          </div>

          <AnimatePresence mode="wait">
            {activeMode === "sources" ? (
              <SourcePanel
                sourceType={sourceType}
                sourceValue={sourceValue}
                onChangeType={handleSourceTypeChange}
                onChangeValue={handleSourceValueChange}
                onContinue={handleContinue}
              />
            ) : (
              <DescribePanel
                manualName={manualName}
                manualBrief={manualBrief}
                onChangeName={setManualName}
                onChangeBrief={setManualBrief}
                onContinue={handleContinue}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}