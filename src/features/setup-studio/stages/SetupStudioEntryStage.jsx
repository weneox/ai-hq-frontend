import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#98a2b5]">
      {children}
    </div>
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
      className="inline-flex h-[54px] items-center justify-center rounded-full border border-[rgba(222,228,236,.98)] bg-[linear-gradient(180deg,#ffffff_0%,#f5f8fc_100%)] px-7 text-[15px] font-semibold text-[#273349] shadow-[0_12px_26px_rgba(55,72,106,.06)] transition disabled:cursor-not-allowed disabled:opacity-40"
    >
      Continue
      <span className="ml-2">→</span>
    </motion.button>
  );
}

function ModeSwitch({ activeMode, onChange }) {
  return (
    <div className="mt-6 inline-flex items-center rounded-full border border-[rgba(226,231,239,.96)] bg-white/78 p-1 shadow-[0_10px_24px_rgba(56,73,107,.04)] backdrop-blur-[6px]">
      <button
        type="button"
        onClick={() => onChange("sources")}
        className={[
          "rounded-full px-5 py-3 text-[15px] font-medium tracking-[0.01em] transition",
          activeMode === "sources"
            ? "bg-[#eef3fb] text-[#1f2b42]"
            : "text-[#8e99ad] hover:text-[#52627f]",
        ].join(" ")}
      >
        Use a source
      </button>

      <button
        type="button"
        onClick={() => onChange("describe")}
        className={[
          "rounded-full px-5 py-3 text-[15px] font-medium tracking-[0.01em] transition",
          activeMode === "describe"
            ? "bg-[#f3eff7] text-[#1f2b42]"
            : "text-[#8e99ad] hover:text-[#52627f]",
        ].join(" ")}
      >
        Describe your business
      </button>
    </div>
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
          : "border-b border-transparent text-[#97a2b6] hover:text-[#55647f]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function RibbonHero() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(255,214,154,.20),transparent_22%),radial-gradient(circle_at_64%_40%,rgba(236,181,255,.22),transparent_24%),radial-gradient(circle_at_46%_68%,rgba(167,213,255,.18),transparent_26%),radial-gradient(circle_at_82%_84%,rgba(255,214,232,.18),transparent_24%)]" />

      <svg
        viewBox="0 0 820 760"
        className="absolute inset-[-6%] h-[112%] w-[112%]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="heroBlurA" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="26" />
          </filter>

          <filter id="heroBlurB" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="42" />
          </filter>

          <linearGradient id="ribbonA" x1="318" y1="-20" x2="708" y2="742" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9fc2ff" stopOpacity="0.95" />
            <stop offset="38%" stopColor="#e8a6ff" stopOpacity="0.88" />
            <stop offset="74%" stopColor="#ffb0d3" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#ffd8a0" stopOpacity="0.96" />
          </linearGradient>

          <linearGradient id="ribbonB" x1="414" y1="4" x2="682" y2="760" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffd16b" stopOpacity="0.96" />
            <stop offset="42%" stopColor="#ff8c46" stopOpacity="0.94" />
            <stop offset="74%" stopColor="#ff79c7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7868ff" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="ribbonC" x1="270" y1="164" x2="696" y2="692" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d9e8ff" stopOpacity="0.84" />
            <stop offset="34%" stopColor="#98d5ff" stopOpacity="0.78" />
            <stop offset="68%" stopColor="#f3c0ff" stopOpacity="0.76" />
            <stop offset="100%" stopColor="#ffe1b3" stopOpacity="0.82" />
          </linearGradient>

          <linearGradient id="ribbonHighlight" x1="356" y1="18" x2="726" y2="706" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.74" />
            <stop offset="55%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        <path
          d="M470 -80C556 94 706 182 724 366C742 536 670 670 546 824"
          stroke="url(#ribbonA)"
          strokeWidth="128"
          strokeLinecap="round"
          opacity="0.9"
          filter="url(#heroBlurB)"
        />
        <path
          d="M520 -56C610 94 720 252 712 412C704 560 632 682 522 834"
          stroke="url(#ribbonB)"
          strokeWidth="96"
          strokeLinecap="round"
          opacity="0.78"
          filter="url(#heroBlurA)"
        />
        <path
          d="M406 84C512 200 598 284 634 394C672 512 646 644 552 780"
          stroke="url(#ribbonC)"
          strokeWidth="116"
          strokeLinecap="round"
          opacity="0.72"
          filter="url(#heroBlurA)"
        />

        <path
          d="M448 -24C548 122 664 204 680 364C694 500 640 618 544 740"
          stroke="url(#ribbonA)"
          strokeWidth="94"
          strokeLinecap="round"
          opacity="0.94"
        />
        <path
          d="M514 -6C600 132 672 254 668 388C662 524 610 634 526 748"
          stroke="url(#ribbonB)"
          strokeWidth="72"
          strokeLinecap="round"
          opacity="0.94"
        />
        <path
          d="M390 144C488 236 564 308 600 410C632 506 616 610 544 708"
          stroke="url(#ribbonC)"
          strokeWidth="82"
          strokeLinecap="round"
          opacity="0.84"
        />

        <path
          d="M436 42C522 168 640 242 654 366C666 476 626 574 560 664"
          stroke="url(#ribbonHighlight)"
          strokeWidth="18"
          strokeLinecap="round"
          opacity="0.54"
        />
        <path
          d="M344 598C474 590 574 598 676 650"
          stroke="url(#ribbonHighlight)"
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.34"
        />
        <path
          d="M264 648C396 634 528 642 680 714"
          stroke="url(#ribbonC)"
          strokeWidth="24"
          strokeLinecap="round"
          opacity="0.24"
          filter="url(#heroBlurA)"
        />
      </svg>
    </div>
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
    >
      <div className="overflow-hidden rounded-[30px] border border-[rgba(225,230,238,.94)] bg-white/76 shadow-[0_22px_54px_rgba(56,73,107,.05)] backdrop-blur-[8px]">
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <TinyLabel>Use a source</TinyLabel>

          <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-center">
            <div className="min-w-0 flex-1 border-b border-[rgba(219,225,235,.96)] pb-4">
              <input
                value={sourceValue}
                onChange={(e) => onChangeValue(e.target.value)}
                placeholder={activeSource.placeholder}
                className="w-full bg-transparent text-[32px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#1f2b42] outline-none placeholder:text-[#c4cad6] sm:text-[46px]"
              />
            </div>

            <div className="shrink-0">
              <ContinueButton disabled={!canContinue} onClick={onContinue} />
            </div>
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

          <div className="mt-8 max-w-[660px] text-[15px] leading-8 text-[#7d879b]">
            {activeSource.hint}
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
      key="describe-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
    >
      <div className="overflow-hidden rounded-[30px] border border-[rgba(225,230,238,.94)] bg-white/76 shadow-[0_22px_54px_rgba(56,73,107,.05)] backdrop-blur-[8px]">
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <TinyLabel>Describe your business</TinyLabel>

          <div className="mt-5 border-b border-[rgba(219,225,235,.96)] pb-4">
            <textarea
              value={manualBrief}
              onChange={(e) => onChangeBrief(e.target.value)}
              placeholder="Tell us what your business does in one sentence."
              rows={4}
              className="min-h-[170px] w-full resize-none bg-transparent text-[30px] font-semibold leading-[1.08] tracking-[-0.06em] text-[#1f2b42] outline-none placeholder:text-[#c4cad6] sm:text-[42px]"
            />
          </div>

          <div className="mt-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 flex-1 xl:max-w-[360px]">
              <TinyLabel>Optional business name</TinyLabel>
              <div className="mt-4 border-b border-[rgba(219,225,235,.96)] pb-3">
                <input
                  value={manualName}
                  onChange={(e) => onChangeName(e.target.value)}
                  placeholder="Your business name"
                  className="w-full bg-transparent text-[22px] font-semibold tracking-[-0.04em] text-[#1f2b42] outline-none placeholder:text-[#c4cad6] sm:text-[28px]"
                />
              </div>
            </div>

            <div className="shrink-0">
              <ContinueButton disabled={!canContinue} onClick={onContinue} />
            </div>
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
    const fromForm = s(discoveryForm?.entryMode);
    if (fromForm === "describe" || fromForm === "sources") return fromForm;
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
    <section className="relative mx-auto w-full max-w-[1400px] overflow-hidden px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(228,238,250,.55),transparent_24%),radial-gradient(circle_at_78%_24%,rgba(245,232,255,.42),transparent_26%),radial-gradient(circle_at_72%_78%,rgba(220,238,255,.34),transparent_28%)]" />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,640px)_1fr] lg:gap-0">
        <div className="pt-4 lg:pt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/84 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-[#8096cb] shadow-[0_10px_24px_rgba(77,98,133,.04)]">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            AI SETUP STUDIO
          </div>

          <h1 className="mt-8 max-w-[660px] text-[46px] font-semibold leading-[0.94] tracking-[-0.07em] text-[#1f2b42] sm:text-[60px] lg:text-[72px]">
            Build your business draft
          </h1>

          <p className="mt-6 max-w-[470px] text-[18px] leading-8 text-[#707b90] sm:text-[19px]">
            Add one key source or describe your business in one sentence.
          </p>

          <div className="mt-10 max-w-[760px]">
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

            <ModeSwitch activeMode={activeMode} onChange={handleModeChange} />
          </div>
        </div>

        <div className="relative hidden lg:block">
          <RibbonHero />
        </div>
      </div>
    </section>
  );
}