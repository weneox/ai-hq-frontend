import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import websiteIcon from "../../../assets/setup-studio/channels/weblink.webp";
import instagramIcon from "../../../assets/setup-studio/channels/instagram.svg";
import linkedinIcon from "../../../assets/setup-studio/channels/linkedin.svg";

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

function StageBadge({ children, tone = "blue" }) {
  const color =
    tone === "rose"
      ? "text-[#a184c8] border-[rgba(255,255,255,.9)] bg-[rgba(255,255,255,.72)]"
      : "text-[#7b95d2] border-[rgba(255,255,255,.9)] bg-[rgba(255,255,255,.72)]";

  return (
    <div
      className={[
        "inline-flex items-center rounded-full border px-3.5 py-1.5",
        "text-[11px] font-semibold uppercase tracking-[0.22em]",
        color,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Shell({ tone = "blue", children, button = false, onClick }) {
  const Comp = button ? motion.button : motion.div;

  const tones = {
    blue:
      "border-[rgba(220,227,240,.94)] bg-[linear-gradient(180deg,rgba(248,251,255,.94),rgba(238,244,251,.92))] shadow-[0_28px_80px_rgba(77,107,159,.08)]",
    rose:
      "border-[rgba(231,224,236,.95)] bg-[linear-gradient(180deg,rgba(252,250,252,.95),rgba(245,240,246,.93))] shadow-[0_28px_80px_rgba(126,103,148,.08)]",
  };

  return (
    <Comp
      type={button ? "button" : undefined}
      onClick={onClick}
      whileHover={
        button
          ? {
              y: -4,
              transition: { duration: 0.18, ease: "easeOut" },
            }
          : undefined
      }
      whileTap={button ? { scale: 0.998 } : undefined}
      className={[
        "group relative w-full overflow-hidden rounded-[36px] border text-left",
        tones[tone] || tones.blue,
        button ? "cursor-pointer" : "",
      ].join(" ")}
    >
      <div className="absolute inset-[1px] rounded-[35px] bg-[linear-gradient(180deg,rgba(255,255,255,.5),rgba(255,255,255,.12))]" />
      <div className="relative z-[2] h-full">{children}</div>
    </Comp>
  );
}

function VisualNode({
  icon,
  label,
  className = "",
  labelClassName = "",
  size = "h-11 w-11",
}) {
  return (
    <div className={["absolute", className].join(" ")}>
      <div className="relative">
        <div className="absolute inset-[-12px] rounded-full bg-white/80 blur-[16px]" />
        <img
          src={icon}
          alt={label}
          className={["relative object-contain drop-shadow-[0_10px_24px_rgba(41,58,92,.12)]", size].join(" ")}
        />
      </div>
      <div
        className={[
          "mt-2 text-[13px] font-medium tracking-[-0.02em] text-[#5f6e86]",
          labelClassName,
        ].join(" ")}
      >
        {label}
      </div>
    </div>
  );
}

function SourceConstellation({ large = false }) {
  const wrapper = large ? "h-[290px] w-[430px]" : "h-[240px] w-[360px]";
  const centerSize = large ? "h-[110px] w-[110px]" : "h-[88px] w-[88px]";
  const centerText = large ? "text-[14px]" : "text-[12px]";

  return (
    <div className={["pointer-events-none relative", wrapper].join(" ")}>
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 430 290"
          className="h-full w-full opacity-[.8]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sourceLine" x1="0" y1="0" x2="430" y2="290">
              <stop offset="0%" stopColor="rgba(145,177,235,.12)" />
              <stop offset="50%" stopColor="rgba(145,177,235,.42)" />
              <stop offset="100%" stopColor="rgba(145,177,235,.12)" />
            </linearGradient>
            <radialGradient id="sourceGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(175,204,255,.4)" />
              <stop offset="100%" stopColor="rgba(175,204,255,0)" />
            </radialGradient>
          </defs>

          <ellipse cx="285" cy="188" rx="118" ry="78" fill="url(#sourceGlow)" />

          <path
            d="M88 64 C156 92, 190 118, 234 146"
            stroke="url(#sourceLine)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M336 74 C316 106, 300 122, 242 150"
            stroke="url(#sourceLine)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M132 224 C176 204, 202 182, 240 160"
            stroke="url(#sourceLine)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          <circle cx="238" cy="152" r="3.2" fill="rgba(145,177,235,.75)" />
          <circle cx="88" cy="64" r="2.5" fill="rgba(145,177,235,.45)" />
          <circle cx="336" cy="74" r="2.5" fill="rgba(145,177,235,.45)" />
          <circle cx="132" cy="224" r="2.5" fill="rgba(145,177,235,.45)" />
        </svg>
      </div>

      <div
        className={[
          "absolute left-[198px] top-[106px] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
          "border border-[rgba(210,223,247,.9)] bg-[linear-gradient(180deg,rgba(255,255,255,.94),rgba(237,244,255,.84))]",
          "shadow-[0_16px_40px_rgba(76,108,163,.1)]",
          centerSize,
        ].join(" ")}
      >
        <div className="absolute inset-[-24px] rounded-full bg-[radial-gradient(circle,rgba(168,196,250,.18),transparent_70%)]" />
        <div className={["relative text-center font-medium uppercase tracking-[0.18em] text-[#7f96cb]", centerText].join(" ")}>
          Draft
        </div>
      </div>

      <VisualNode
        icon={websiteIcon}
        label="Website"
        className={large ? "left-[46px] top-[30px]" : "left-[18px] top-[26px]"}
        labelClassName="ml-[-2px]"
        size={large ? "h-12 w-12" : "h-11 w-11"}
      />

      <VisualNode
        icon={instagramIcon}
        label="Instagram"
        className={large ? "right-[24px] top-[38px]" : "right-[6px] top-[32px]"}
        size={large ? "h-12 w-12" : "h-11 w-11"}
      />

      <VisualNode
        icon={linkedinIcon}
        label="LinkedIn"
        className={large ? "left-[88px] bottom-[18px]" : "left-[54px] bottom-[4px]"}
        size={large ? "h-12 w-12" : "h-11 w-11"}
      />
    </div>
  );
}

function WritingGesture({ large = false }) {
  const wrapper = large ? "h-[290px] w-[430px]" : "h-[240px] w-[360px]";

  return (
    <div className={["pointer-events-none relative", wrapper].join(" ")}>
      <div className="absolute inset-0">
        <div className="absolute right-[18px] top-[18px] h-[150px] w-[150px] rounded-full bg-[rgba(239,223,255,.22)] blur-[34px]" />
        <div className="absolute left-[34px] bottom-[18px] h-[110px] w-[220px] rounded-full bg-[rgba(255,255,255,.36)] blur-[26px]" />

        <svg
          viewBox="0 0 430 290"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="inkStroke" x1="40" y1="210" x2="348" y2="74">
              <stop offset="0%" stopColor="rgba(180,154,220,.18)" />
              <stop offset="55%" stopColor="rgba(160,129,205,.72)" />
              <stop offset="100%" stopColor="rgba(195,177,228,.18)" />
            </linearGradient>
            <linearGradient id="inkStrokeSoft" x1="70" y1="190" x2="360" y2="94">
              <stop offset="0%" stopColor="rgba(196,182,226,.05)" />
              <stop offset="50%" stopColor="rgba(177,151,217,.4)" />
              <stop offset="100%" stopColor="rgba(196,182,226,.05)" />
            </linearGradient>
          </defs>

          <path
            d="M72 198 C124 168, 170 160, 212 168 C254 176, 286 202, 324 168 C338 156, 346 138, 350 120"
            stroke="url(#inkStroke)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M126 148 C160 122, 212 108, 258 118 C292 126, 318 144, 344 134"
            stroke="url(#inkStrokeSoft)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M96 222 C144 216, 192 218, 248 228"
            stroke="url(#inkStrokeSoft)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute left-[74px] top-[144px] h-[2px] w-[168px] rounded-full bg-[linear-gradient(90deg,rgba(177,151,217,.06),rgba(177,151,217,.42),rgba(177,151,217,.08))]" />
        <div className="absolute left-[72px] top-[168px] h-[2px] w-[120px] rounded-full bg-[linear-gradient(90deg,rgba(177,151,217,.04),rgba(177,151,217,.26),rgba(177,151,217,.04))]" />
        <div className="absolute right-[62px] top-[82px] h-[54px] w-[2px] rounded-full bg-[linear-gradient(180deg,rgba(177,151,217,.04),rgba(177,151,217,.55),rgba(177,151,217,.04))]" />
      </div>

      <div className="absolute bottom-[14px] left-[42px] text-[12px] font-medium uppercase tracking-[0.22em] text-[#aa98c8]">
        shape it by words
      </div>
    </div>
  );
}

function ClosedFooter({ tone = "blue", text = "Open" }) {
  const arrowTone =
    tone === "rose"
      ? "text-[#9c86c7] border-[rgba(228,220,235,.95)]"
      : "text-[#7c95cf] border-[rgba(220,228,241,.95)]";

  return (
    <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between">
      <div className="text-[13px] font-medium tracking-[0.02em] text-[#7c8698]">
        {text}
      </div>

      <div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-full border bg-white/84",
          "shadow-[0_10px_24px_rgba(52,67,94,.06)] transition duration-200 group-hover:translate-x-0.5",
          arrowTone,
        ].join(" ")}
      >
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

function SourceClosedCard({ onClick }) {
  return (
    <Shell tone="blue" button onClick={onClick}>
      <div className="relative min-h-[520px] px-8 pb-24 pt-8 sm:px-10 sm:pt-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,255,255,.76),transparent_22%),radial-gradient(circle_at_88%_84%,rgba(178,202,245,.12),transparent_26%)]" />

        <div className="relative z-[2] max-w-[330px]">
          <StageBadge tone="blue">Sources</StageBadge>

          <h2 className="mt-6 text-[40px] font-semibold leading-[0.96] tracking-[-0.065em] text-[#213148] sm:text-[50px]">
            Add your business sources
          </h2>

          <p className="mt-5 max-w-[290px] text-[18px] leading-8 text-[#6f7c92]">
            Pull in the strongest signals you already have.
          </p>
        </div>

        <div className="relative z-[2] mt-10 flex justify-end">
          <SourceConstellation />
        </div>

        <ClosedFooter tone="blue" text="Use sources to build the first draft" />
      </div>
    </Shell>
  );
}

function ManualClosedCard({ onClick }) {
  return (
    <Shell tone="rose" button onClick={onClick}>
      <div className="relative min-h-[520px] px-8 pb-24 pt-8 sm:px-10 sm:pt-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_16%,rgba(255,255,255,.7),transparent_22%),radial-gradient(circle_at_12%_86%,rgba(241,226,255,.16),transparent_28%)]" />

        <div className="relative z-[2] max-w-[330px]">
          <StageBadge tone="rose">Manual</StageBadge>

          <h2 className="mt-6 text-[40px] font-semibold leading-[0.96] tracking-[-0.065em] text-[#213148] sm:text-[50px]">
            Describe your business
          </h2>

          <p className="mt-5 max-w-[290px] text-[18px] leading-8 text-[#737b8e]">
            Start from a thought, a sentence, or a short business brief.
          </p>
        </div>

        <div className="relative z-[2] mt-10 flex justify-end">
          <WritingGesture />
        </div>

        <ClosedFooter tone="rose" text="Write the first version yourself" />
      </div>
    </Shell>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-[rgba(223,228,238,.96)] bg-white/86 px-4 py-2 text-[14px] font-medium text-[#637189] shadow-[0_10px_24px_rgba(48,67,101,.05)] transition hover:-translate-y-0.5"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

function SourceLegendItem({ icon, name, sub }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <div className="absolute inset-[-10px] rounded-full bg-white/84 blur-[14px]" />
        <img
          src={icon}
          alt={name}
          className="relative h-11 w-11 object-contain drop-shadow-[0_10px_22px_rgba(44,63,94,.12)]"
        />
      </div>

      <div>
        <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#263248]">
          {name}
        </div>
        <div className="mt-0.5 text-[14px] leading-6 text-[#728098]">{sub}</div>
      </div>
    </div>
  );
}

function SourcesExpanded({ onBack, onContinue }) {
  return (
    <motion.div
      key="sources-expanded"
      initial={{ opacity: 0, y: 14, scale: 0.992 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.994 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[1020px]"
    >
      <Shell tone="blue">
        <div className="relative px-7 pb-8 pt-7 sm:px-9 sm:pt-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BackButton onClick={onBack} />
            <StageBadge tone="blue">Sources</StageBadge>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div className="max-w-[520px]">
              <h3 className="text-[38px] font-semibold leading-[0.96] tracking-[-0.065em] text-[#213148] sm:text-[46px]">
                Bring in your real business signals
              </h3>

              <p className="mt-5 text-[17px] leading-8 text-[#6f7c92]">
                Start from the clearest source you already have. Website is the
                best first pass for services, contact details, positioning, and
                business summary.
              </p>

              <div className="mt-8 space-y-5">
                <SourceLegendItem
                  icon={websiteIcon}
                  name="Website"
                  sub="Best for your first high-quality draft."
                />
                <SourceLegendItem
                  icon={instagramIcon}
                  name="Instagram"
                  sub="Useful as brand and tone context."
                />
                <SourceLegendItem
                  icon={linkedinIcon}
                  name="LinkedIn"
                  sub="Helpful for business identity and trust signals."
                />
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="mt-8 inline-flex h-[58px] items-center justify-center gap-3 rounded-full border border-[rgba(216,225,239,.98)] bg-white/90 px-6 text-[15px] font-semibold text-[#5871ac] shadow-[0_14px_30px_rgba(77,107,159,.08)] transition hover:-translate-y-0.5"
              >
                <ArrowRight className="h-4 w-4" />
                Continue with sources
              </button>
            </div>

            <div className="flex justify-center lg:justify-end">
              <SourceConstellation large />
            </div>
          </div>
        </div>
      </Shell>
    </motion.div>
  );
}

function ManualExpanded({
  onBack,
  manualName,
  manualBrief,
  onChangeName,
  onChangeBrief,
  onSubmit,
  canContinue,
}) {
  return (
    <motion.div
      key="manual-expanded"
      initial={{ opacity: 0, y: 14, scale: 0.992 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.994 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[1020px]"
    >
      <Shell tone="rose">
        <div className="relative px-7 pb-8 pt-7 sm:px-9 sm:pt-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BackButton onClick={onBack} />
            <StageBadge tone="rose">Manual</StageBadge>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div className="max-w-[520px]">
              <h3 className="text-[38px] font-semibold leading-[0.96] tracking-[-0.065em] text-[#213148] sm:text-[46px]">
                Describe your business
              </h3>

              <p className="mt-5 text-[17px] leading-8 text-[#757d8f]">
                A short name and a simple description is enough to generate the
                first version.
              </p>

              <div className="mt-8 space-y-4">
                <input
                  value={manualName}
                  onChange={(e) => onChangeName(e.target.value)}
                  placeholder="Business name"
                  className="h-[62px] w-full rounded-[22px] border border-[rgba(225,228,236,.98)] bg-white/92 px-5 text-[16px] font-medium tracking-[-0.02em] text-[#2b3447] outline-none shadow-[0_8px_24px_rgba(83,71,112,.04),inset_0_1px_0_rgba(255,255,255,.95)] placeholder:text-[#9aa3b5] focus:border-[#d4d9e9]"
                />

                <textarea
                  value={manualBrief}
                  onChange={(e) => onChangeBrief(e.target.value)}
                  placeholder="Describe your business in a few words..."
                  rows={6}
                  className="w-full resize-none rounded-[22px] border border-[rgba(225,228,236,.98)] bg-white/92 px-5 py-4 text-[16px] font-medium leading-7 tracking-[-0.02em] text-[#2b3447] outline-none shadow-[0_8px_24px_rgba(83,71,112,.04),inset_0_1px_0_rgba(255,255,255,.95)] placeholder:text-[#9aa3b5] focus:border-[#d4d9e9]"
                />
              </div>

              <button
                type="button"
                onClick={onSubmit}
                disabled={!canContinue}
                className="mt-8 inline-flex h-[58px] items-center justify-center gap-3 rounded-full border border-[rgba(224,226,236,.98)] bg-white/90 px-6 text-[15px] font-semibold text-[#6c7398] shadow-[0_14px_30px_rgba(108,94,140,.07)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <ArrowRight className="h-4 w-4" />
                Build draft manually
              </button>
            </div>

            <div className="flex justify-center lg:justify-end">
              <WritingGesture large />
            </div>
          </div>
        </div>
      </Shell>
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

  const [manualName, setManualName] = useState(savedManual.name || "");
  const [manualBrief, setManualBrief] = useState(
    savedManual.brief || savedPlainNote || ""
  );
  const [activeCard, setActiveCard] = useState(() => {
    if (savedManual.name || savedManual.brief || savedPlainNote) return "manual";
    return null;
  });

  useEffect(() => {
    setManualName(savedManual.name || "");
    setManualBrief(savedManual.brief || savedPlainNote || "");
  }, [savedManual.name, savedManual.brief, savedPlainNote]);

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

  const canContinueManual = !!manualName || !!manualBrief;

  function handleManualSubmit() {
    if (!canContinueManual) return;
    onContinueFlow?.();
  }

  function handleSourceContinue() {
    onContinueFlow?.();
  }

  return (
    <section className="mx-auto w-full max-w-[1260px] px-2 pb-8 pt-4 sm:px-3 lg:pt-6">
      <div className="w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/82 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-[#8096cb] shadow-[0_10px_26px_rgba(77,98,133,.06)]">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          AI SETUP STUDIO
        </div>

        <h1 className="mx-auto mt-7 max-w-[760px] text-[38px] font-semibold leading-[0.96] tracking-[-0.07em] text-[#1f2b42] sm:text-[50px] lg:text-[58px]">
          Build your business draft
        </h1>

        <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-8 text-[#778094] sm:text-[18px]">
          Choose how you want to begin.
        </p>
      </div>

      <div className="mt-12">
        <AnimatePresence mode="wait">
          {!activeCard ? (
            <motion.div
              key="chooser"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-7 lg:grid-cols-2"
            >
              <SourceClosedCard onClick={() => setActiveCard("sources")} />
              <ManualClosedCard onClick={() => setActiveCard("manual")} />
            </motion.div>
          ) : activeCard === "sources" ? (
            <SourcesExpanded
              onBack={() => setActiveCard(null)}
              onContinue={handleSourceContinue}
            />
          ) : (
            <ManualExpanded
              onBack={() => setActiveCard(null)}
              manualName={manualName}
              manualBrief={manualBrief}
              onChangeName={setManualName}
              onChangeBrief={setManualBrief}
              onSubmit={handleManualSubmit}
              canContinue={canContinueManual}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}