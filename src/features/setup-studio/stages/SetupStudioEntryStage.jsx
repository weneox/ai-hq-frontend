import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

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
    hint: "Good for brand tone, social proof, and visual context.",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/company/yourbrand",
    hint: "Useful for identity, trust, and business context.",
  },
  {
    key: "google_maps",
    label: "Google Maps",
    placeholder: "Business name or maps link",
    hint: "Helpful when the business is location-first.",
  },
];

function ModeNavItem({
  number,
  title,
  text,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left"
    >
      <div className="flex items-start gap-4">
        <div className="pt-0.5 text-[12px] font-semibold tracking-[0.18em] text-[#9aa4b8]">
          {number}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={[
              "text-[28px] font-semibold leading-[1.02] tracking-[-0.05em] transition",
              active ? "text-[#1f2b42]" : "text-[#9aa4b8] group-hover:text-[#53627d]",
            ].join(" ")}
          >
            {title}
          </div>

          <div
            className={[
              "mt-3 max-w-[220px] text-[15px] leading-7 transition",
              active ? "text-[#6f7b90]" : "text-[#adb4c2] group-hover:text-[#7f899e]",
            ].join(" ")}
          >
            {text}
          </div>

          <div className="mt-5 h-px w-full bg-[rgba(222,228,238,.9)]" />
        </div>
      </div>
    </button>
  );
}

function Surface({ children }) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-[rgba(225,230,238,.92)] bg-[rgba(252,252,253,.82)] shadow-[0_24px_60px_rgba(55,73,109,.05)] backdrop-blur-[8px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(255,255,255,.78),transparent_22%),radial-gradient(circle_at_86%_18%,rgba(245,241,250,.42),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(223,234,248,.22),transparent_30%)]" />
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}

function SourceTypeLink({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "pb-2 text-[14px] font-medium tracking-[0.01em] transition",
        active
          ? "border-b border-[#1f2b42] text-[#1f2b42]"
          : "border-b border-transparent text-[#8e98ab] hover:text-[#4d5d79]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled = false }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.998 }}
      className="inline-flex h-[54px] items-center justify-center gap-3 rounded-full border border-[rgba(220,226,235,.98)] bg-white px-6 text-[15px] font-semibold text-[#243248] shadow-[0_12px_26px_rgba(54,72,106,.06)] transition disabled:cursor-not-allowed disabled:opacity-45"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </motion.button>
  );
}

function SourcesPanel({
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
      key="sources-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
      className="min-h-[420px]"
    >
      <div className="max-w-[720px]">
        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8e98ab]">
          Sources
        </div>

        <h3 className="mt-5 max-w-[560px] text-[34px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#1f2b42] sm:text-[42px]">
          Start from what already exists
        </h3>

        <p className="mt-5 max-w-[560px] text-[17px] leading-8 text-[#6f7b90]">
          Give the system one clear source and let it build the first business draft from there.
        </p>

        <div className="mt-10">
          <label className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9aa4b8]">
            Primary source
          </label>

          <div className="mt-4 border-b border-[rgba(219,225,235,.96)] pb-4">
            <input
              value={sourceValue}
              onChange={(e) => onChangeValue(e.target.value)}
              placeholder={activeSource.placeholder}
              className="w-full bg-transparent text-[34px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#1f2b42] outline-none placeholder:text-[#c2c8d4] sm:text-[44px]"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {SOURCE_TYPES.map((item) => (
              <SourceTypeLink
                key={item.key}
                label={item.label}
                active={item.key === sourceType}
                onClick={() => onChangeType(item.key)}
              />
            ))}
          </div>

          <div className="mt-8 max-w-[640px] text-[15px] leading-7 text-[#7f899d]">
            {activeSource.hint}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-[rgba(222,228,238,.92)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[14px] text-[#8e98ab]">
            The cleaner the starting source, the stronger the first draft.
          </div>

          <PrimaryButton onClick={onContinue} disabled={!canContinue}>
            Continue
          </PrimaryButton>
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
      key="describe-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
      className="min-h-[420px]"
    >
      <div className="max-w-[760px]">
        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#a294ba]">
          Describe
        </div>

        <h3 className="mt-5 max-w-[560px] text-[34px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#1f2b42] sm:text-[42px]">
          Start from a sentence
        </h3>

        <p className="mt-5 max-w-[560px] text-[17px] leading-8 text-[#737d90]">
          Write what the business is, what it offers, or who it serves. Keep it simple.
        </p>

        <div className="mt-10">
          <label className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9aa4b8]">
            Business name
          </label>

          <div className="mt-4 border-b border-[rgba(219,225,235,.96)] pb-4">
            <input
              value={manualName}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Your business name"
              className="w-full bg-transparent text-[28px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#1f2b42] outline-none placeholder:text-[#c2c8d4] sm:text-[34px]"
            />
          </div>
        </div>

        <div className="mt-10">
          <label className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9aa4b8]">
            Description
          </label>

          <div className="mt-4 border-b border-[rgba(219,225,235,.96)] pb-4">
            <textarea
              value={manualBrief}
              onChange={(e) => onChangeBrief(e.target.value)}
              placeholder="Tell us what your business does..."
              rows={6}
              className="min-h-[180px] w-full resize-none bg-transparent text-[28px] font-semibold leading-[1.18] tracking-[-0.05em] text-[#1f2b42] outline-none placeholder:text-[#c2c8d4] sm:text-[34px]"
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-[rgba(222,228,238,.92)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[14px] text-[#8e98ab]">
            One good sentence is enough to generate the first version.
          </div>

          <PrimaryButton onClick={onContinue} disabled={!canContinue}>
            Continue
          </PrimaryButton>
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
    const nextSourceType = s(discoveryForm?.sourceType) || "website";
    const nextSourceValue = s(discoveryForm?.sourceValue || discoveryForm?.websiteUrl || "");

    setSourceType(nextSourceType);
    setSourceValue(nextSourceValue);
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
  }

  function handleContinue() {
    onContinueFlow?.();
  }

  return (
    <section className="mx-auto w-full max-w-[1240px] px-2 pb-8 pt-4 sm:px-3 lg:pt-6">
      <div className="w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/84 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-[#8096cb] shadow-[0_10px_26px_rgba(77,98,133,.05)]">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          AI SETUP STUDIO
        </div>

        <h1 className="mx-auto mt-7 max-w-[740px] text-[38px] font-semibold leading-[0.96] tracking-[-0.07em] text-[#1f2b42] sm:text-[50px] lg:text-[58px]">
          Build your business draft
        </h1>

        <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-8 text-[#778094] sm:text-[18px]">
          Choose how you want to begin.
        </p>
      </div>

      <div className="mt-12">
        <Surface>
          <div className="grid lg:grid-cols-[280px_1fr]">
            <div className="border-b border-[rgba(222,228,238,.92)] px-6 py-7 lg:border-b-0 lg:border-r lg:px-8 lg:py-9">
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9aa4b8]">
                Start
              </div>

              <h2 className="mt-5 max-w-[200px] text-[30px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#1f2b42]">
                Choose your starting point
              </h2>

              <div className="mt-10 space-y-6">
                <ModeNavItem
                  number="01"
                  title="Sources"
                  text="Begin from a real business source."
                  active={activeMode === "sources"}
                  onClick={() => handleModeChange("sources")}
                />

                <ModeNavItem
                  number="02"
                  title="Describe"
                  text="Begin from a short written brief."
                  active={activeMode === "describe"}
                  onClick={() => handleModeChange("describe")}
                />
              </div>
            </div>

            <div className="px-6 py-7 lg:px-10 lg:py-9">
              <AnimatePresence mode="wait">
                {activeMode === "sources" ? (
                  <SourcesPanel
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
        </Surface>
      </div>
    </section>
  );
}